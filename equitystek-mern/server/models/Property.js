const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PropertySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  propertyType: {
    type: String,
    enum: ['single_family', 'condominium', 'townhouse', 'multi_family', 'commercial'],
    required: true
  },
  bedrooms: {
    type: Number,
    default: 0
  },
  bathrooms: {
    type: Number,
    default: 0
  },
  squareFeet: {
    type: Number,
    default: 0
  },
  yearBuilt: {
    type: Number,
    default: 0
  },
  lotSize: {
    type: Number,
    default: 0
  },
  imageUrl: {
    type: String,
    trim: true
  },
  purchasePrice: {
    type: Number,
    default: 0
  },
  purchaseDate: {
    type: Date
  },
  currentValue: {
    type: Number,
    default: 0
  },
  lastValuationDate: {
    type: Date
  },
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

// Virtual for formatted address
PropertySchema.virtual('fullAddress').get(function() {
  return `${this.address}, ${this.city}, ${this.state} ${this.zipCode}`;
});

module.exports = mongoose.model('Property', PropertySchema);