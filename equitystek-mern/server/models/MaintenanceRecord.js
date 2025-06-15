const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MaintenanceRecordSchema = new Schema({
  property: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'plumbing',
      'electrical',
      'hvac',
      'roofing',
      'appliance',
      'structural',
      'cosmetic',
      'landscaping',
      'renovation',
      'other'
    ],
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  completionDate: {
    type: Date,
    required: true
  },
  contractor: {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    license: {
      type: String,
      trim: true
    }
  },
  receiptUrls: [{
    type: String
  }],
  imageUrls: [{
    type: String
  }],
  warranty: {
    hasWarranty: {
      type: Boolean,
      default: false
    },
    expirationDate: {
      type: Date
    },
    details: {
      type: String
    }
  },
  notes: {
    type: String
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

module.exports = mongoose.model('MaintenanceRecord', MaintenanceRecordSchema);