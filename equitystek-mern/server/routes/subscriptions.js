const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const subscriptionController = require('../controllers/subscriptionController');
const auth = require('../middleware/auth');

// @route   GET /api/subscriptions/plans
// @desc    Get all subscription plans
// @access  Public
router.get('/plans', subscriptionController.getSubscriptionPlans);

// @route   GET /api/subscriptions/current
// @desc    Get current user's subscription
// @access  Private
router.get('/current', auth, subscriptionController.getCurrentSubscription);

// @route   POST /api/subscriptions
// @desc    Create or update a subscription
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('planId', 'Plan ID is required').not().isEmpty(),
      check('propertyCount', 'Property count is required').isNumeric()
    ]
  ],
  subscriptionController.createSubscription
);

// @route   PUT /api/subscriptions/cancel
// @desc    Cancel subscription
// @access  Private
router.put('/cancel', auth, subscriptionController.cancelSubscription);

// @route   GET /api/subscriptions/calculate-price
// @desc    Calculate subscription price
// @access  Private
router.get('/calculate-price', auth, subscriptionController.calculatePrice);

// @route   POST /api/subscriptions/webhook
// @desc    Handle Stripe webhook events
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), subscriptionController.stripeWebhook);

module.exports = router;