const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'trialing', 'unpaid'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  endDate: {
    type: Date
  },
  propertyCount: {
    type: Number,
    default: 1,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  stripeSubscriptionId: {
    type: String
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  lastPaymentDate: {
    type: Date
  },
  nextPaymentDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to calculate subscription price
SubscriptionSchema.methods.calculatePrice = function(plan, propertyCount) {
  return plan.basePrice + (Math.max(0, propertyCount - 1) * plan.pricePerProperty);
};

module.exports = mongoose.model('Subscription', SubscriptionSchema);