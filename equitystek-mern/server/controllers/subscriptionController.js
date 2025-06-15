const { validationResult } = require('express-validator');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const User = require('../models/User');
const Property = require('../models/Property');
const Receipt = require('../models/Receipt');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @route   GET /api/subscriptions/plans
// @desc    Get all subscription plans
// @access  Public
exports.getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true });
    res.json(plans);
  } catch (err) {
    console.error('Get subscription plans error:', err.message);
    res.status(500).json({ message: 'Server error retrieving subscription plans' });
  }
};

// @route   GET /api/subscriptions/current
// @desc    Get current user's subscription
// @access  Private
exports.getCurrentSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user.id
    }).populate('plan');

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    res.json(subscription);
  } catch (err) {
    console.error('Get current subscription error:', err.message);
    res.status(500).json({ message: 'Server error retrieving subscription' });
  }
};

// @route   POST /api/subscriptions
// @desc    Create or update a subscription
// @access  Private
exports.createSubscription = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { planId, propertyCount } = req.body;

    // Validate plan
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    // Calculate price
    const currentPrice = plan.basePrice + (Math.max(0, propertyCount - 1) * plan.pricePerProperty);

    // Check if user already has a subscription
    let subscription = await Subscription.findOne({ user: req.user.id });

    // If payment intent creation is needed
    let paymentIntent = null;
    let setupIntent = null;

    // If user doesn't have a Stripe customer ID, create one
    let user = await User.findById(req.user.id);
    
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: {
          userId: user.id.toString()
        }
      });

      // Update user with customer ID
      user = await User.findByIdAndUpdate(
        user.id,
        { stripeCustomerId: customer.id },
        { new: true }
      );
    }

    // Create or update subscription
    if (subscription) {
      // Update existing subscription
      subscription = await Subscription.findByIdAndUpdate(
        subscription._id,
        {
          plan: planId,
          propertyCount,
          currentPrice,
          status: 'active',
          updatedAt: Date.now()
        },
        { new: true }
      ).populate('plan');

      // Create setup intent for updating payment method if needed
      setupIntent = await stripe.setupIntents.create({
        customer: user.stripeCustomerId,
        payment_method_types: ['card'],
        usage: 'off_session'
      });
    } else {
      // Create new subscription
      subscription = new Subscription({
        user: req.user.id,
        plan: planId,
        propertyCount,
        currentPrice,
        status: 'active',
        startDate: Date.now()
      });

      subscription = await subscription.save();
      subscription = await Subscription.populate(subscription, { path: 'plan' });

      // Create payment intent for initial payment
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(currentPrice * 100), // Convert to cents
        currency: 'usd',
        customer: user.stripeCustomerId,
        metadata: {
          subscriptionId: subscription._id.toString(),
          userId: user.id.toString()
        }
      });

      // Create a receipt
      const receiptNumber = await Receipt.generateReceiptNumber();
      
      await Receipt.create({
        user: req.user.id,
        subscription: subscription._id,
        receiptNumber,
        amount: currentPrice,
        description: `${plan.name} Subscription - Initial payment`,
        paymentDate: Date.now(),
        stripePaymentIntentId: paymentIntent.id
      });
    }

    res.json({
      subscription,
      clientSecret: paymentIntent ? paymentIntent.client_secret : null,
      setupIntent: setupIntent ? setupIntent.client_secret : null
    });
  } catch (err) {
    console.error('Create subscription error:', err.message);
    res.status(500).json({ message: 'Server error creating subscription' });
  }
};

// @route   PUT /api/subscriptions/cancel
// @desc    Cancel subscription
// @access  Private
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user.id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    // If there's a Stripe subscription ID, cancel in Stripe
    const user = await User.findById(req.user.id);
    if (user.stripeSubscriptionId) {
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
    }

    // Update local subscription
    subscription.status = 'canceled';
    subscription.cancelAtPeriodEnd = true;
    subscription.endDate = new Date();
    subscription.endDate.setMonth(subscription.endDate.getMonth() + 1); // Set end date to 1 month from now
    
    await subscription.save();

    res.json(subscription);
  } catch (err) {
    console.error('Cancel subscription error:', err.message);
    res.status(500).json({ message: 'Server error canceling subscription' });
  }
};

// @route   GET /api/subscriptions/calculate-price
// @desc    Calculate subscription price
// @access  Private
exports.calculatePrice = async (req, res) => {
  try {
    const { planId, propertyCount } = req.query;

    if (!planId || !propertyCount) {
      return res.status(400).json({ message: 'Plan ID and property count are required' });
    }

    // Get plan
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    // Calculate price
    const count = parseInt(propertyCount);
    const price = plan.basePrice + (Math.max(0, count - 1) * plan.pricePerProperty);

    res.json({
      basePrice: plan.basePrice,
      additionalPropertyPrice: plan.pricePerProperty,
      propertyCount: count,
      totalPrice: price
    });
  } catch (err) {
    console.error('Calculate price error:', err.message);
    res.status(500).json({ message: 'Server error calculating price' });
  }
};

// @route   POST /api/subscriptions/webhook
// @desc    Handle Stripe webhook events
// @access  Public
exports.stripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handleFailedPayment(failedPayment);
      break;
    case 'subscription.created':
    case 'subscription.updated':
      const subscription = event.data.object;
      await handleSubscriptionUpdate(subscription);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.send({ received: true });
};

// Helper function to handle successful payments
async function handleSuccessfulPayment(paymentIntent) {
  try {
    if (!paymentIntent.metadata.subscriptionId) {
      return;
    }

    // Update receipt
    const receipt = await Receipt.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (receipt) {
      receipt.status = 'paid';
      await receipt.save();
    }

    // Update subscription status if needed
    const subscription = await Subscription.findById(paymentIntent.metadata.subscriptionId);
    if (subscription && subscription.status !== 'active') {
      subscription.status = 'active';
      await subscription.save();
    }
  } catch (err) {
    console.error('Error handling successful payment:', err);
  }
}

// Helper function to handle failed payments
async function handleFailedPayment(paymentIntent) {
  try {
    if (!paymentIntent.metadata.subscriptionId) {
      return;
    }

    // Update receipt
    const receipt = await Receipt.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (receipt) {
      receipt.status = 'failed';
      await receipt.save();
    }

    // Update subscription status
    const subscription = await Subscription.findById(paymentIntent.metadata.subscriptionId);
    if (subscription) {
      subscription.status = 'past_due';
      await subscription.save();
    }
  } catch (err) {
    console.error('Error handling failed payment:', err);
  }
}

// Helper function to handle subscription updates
async function handleSubscriptionUpdate(stripeSubscription) {
  try {
    // Find user by Stripe customer ID
    const user = await User.findOne({
      stripeCustomerId: stripeSubscription.customer
    });

    if (!user) {
      return;
    }

    // Update user's Stripe subscription ID
    user.stripeSubscriptionId = stripeSubscription.id;
    await user.save();

    // Update subscription status
    const subscription = await Subscription.findOne({
      user: user._id
    });

    if (subscription) {
      subscription.status = stripeSubscription.status;
      
      if (stripeSubscription.cancel_at_period_end) {
        subscription.cancelAtPeriodEnd = true;
        subscription.endDate = new Date(stripeSubscription.current_period_end * 1000);
      }
      
      if (stripeSubscription.current_period_end) {
        subscription.nextPaymentDate = new Date(stripeSubscription.current_period_end * 1000);
      }
      
      await subscription.save();
    }
  } catch (err) {
    console.error('Error handling subscription update:', err);
  }
}