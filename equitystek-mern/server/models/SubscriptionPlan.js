const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionPlanSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  pricePerProperty: {
    type: Number,
    required: true
  },
  features: [{
    type: String,
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
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

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);