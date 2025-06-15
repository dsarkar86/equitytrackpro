const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReceiptSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscription: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  receiptNumber: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['subscription', 'one_time'],
    default: 'subscription'
  },
  paymentDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  paymentMethod: {
    type: String,
    default: 'card'
  },
  stripePaymentIntentId: {
    type: String
  },
  status: {
    type: String,
    enum: ['paid', 'refunded', 'failed'],
    default: 'paid'
  },
  taxAmount: {
    type: Number,
    default: 0
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

// Static method to generate receipt number
ReceiptSchema.statics.generateReceiptNumber = async function() {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  
  // Get count of receipts today
  const datePrefix = `${year}${month}${day}`;
  const count = await this.countDocuments({
    receiptNumber: { $regex: `^INV-${datePrefix}` }
  });
  
  // Create receipt number
  const sequence = (count + 1).toString().padStart(4, '0');
  return `INV-${datePrefix}-${sequence}`;
};

module.exports = mongoose.model('Receipt', ReceiptSchema);