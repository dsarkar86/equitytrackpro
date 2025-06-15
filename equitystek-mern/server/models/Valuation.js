const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ValuationSchema = new Schema({
  property: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  valuationDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    enum: ['automated', 'professional', 'owner_estimate'],
    default: 'automated'
  },
  notes: {
    type: String
  },
  factorsConsidered: {
    location: {
      type: Boolean,
      default: true
    },
    propertyCondition: {
      type: Boolean,
      default: true
    },
    maintenanceHistory: {
      type: Boolean,
      default: true
    },
    marketTrends: {
      type: Boolean,
      default: true
    },
    comparableSales: {
      type: Boolean,
      default: true
    }
  },
  comparableSales: [{
    address: String,
    salePrice: Number,
    saleDate: Date,
    squareFeet: Number,
    bedrooms: Number,
    bathrooms: Number,
    distanceInMiles: Number
  }],
  maintenanceImpact: {
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

module.exports = mongoose.model('Valuation', ValuationSchema);