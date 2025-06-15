const { validationResult } = require('express-validator');
const MaintenanceRecord = require('../models/MaintenanceRecord');
const Property = require('../models/Property');
const Valuation = require('../models/Valuation');

// @route   GET /api/maintenance
// @desc    Get all maintenance records for a user's properties
// @access  Private
exports.getMaintenanceRecords = async (req, res) => {
  try {
    // Get all properties owned by the user
    const properties = await Property.find({ user: req.user.id }).select('_id');
    const propertyIds = properties.map(prop => prop._id);
    
    // Get all maintenance records for these properties
    const maintenanceRecords = await MaintenanceRecord.find({
      property: { $in: propertyIds }
    }).populate('property', 'address city state zipCode imageUrl').sort({ completionDate: -1 });
    
    res.json(maintenanceRecords);
  } catch (err) {
    console.error('Get maintenance records error:', err.message);
    res.status(500).json({ message: 'Server error retrieving maintenance records' });
  }
};

// @route   GET /api/maintenance/:id
// @desc    Get maintenance record by ID
// @access  Private
exports.getMaintenanceRecordById = async (req, res) => {
  try {
    const maintenanceRecord = await MaintenanceRecord.findById(req.params.id)
      .populate('property', 'address city state zipCode user');
    
    // Check if maintenance record exists
    if (!maintenanceRecord) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    
    // Check if user owns the property
    const property = await Property.findById(maintenanceRecord.property._id);
    
    if (property.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to access this maintenance record' });
    }
    
    res.json(maintenanceRecord);
  } catch (err) {
    console.error('Get maintenance record error:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    
    res.status(500).json({ message: 'Server error retrieving maintenance record' });
  }
};

// @route   POST /api/maintenance
// @desc    Create a maintenance record
// @access  Private
exports.createMaintenanceRecord = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Check if property exists and user owns it
    const property = await Property.findById(req.body.property);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    if (property.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to add maintenance to this property' });
    }
    
    // Create new maintenance record
    const newMaintenanceRecord = new MaintenanceRecord({
      property: req.body.property,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      cost: req.body.cost,
      completionDate: req.body.completionDate,
      contractor: req.body.contractor || {},
      receiptUrls: req.body.receiptUrls || [],
      imageUrls: req.body.imageUrls || [],
      warranty: req.body.warranty || { hasWarranty: false },
      notes: req.body.notes
    });
    
    const maintenanceRecord = await newMaintenanceRecord.save();
    
    // Update property valuation if cost is significant
    if (req.body.cost > 1000) {
      // Get current valuation
      const lastValuation = await Valuation.findOne({ property: property.id })
        .sort({ valuationDate: -1 });
      
      if (lastValuation) {
        const maintenanceImpact = calculateMaintenanceImpact(req.body.category, req.body.cost);
        
        // Create new valuation with maintenance impact
        const newValue = lastValuation.value + maintenanceImpact;
        
        const newValuation = new Valuation({
          property: property.id,
          value: newValue,
          method: 'automated',
          notes: `Valuation adjusted based on ${req.body.category} maintenance of $${req.body.cost}`,
          maintenanceImpact: maintenanceImpact,
          factorsConsidered: {
            maintenanceHistory: true
          }
        });
        
        await newValuation.save();
        
        // Update property with new valuation
        property.currentValue = newValue;
        property.lastValuationDate = newValuation.valuationDate;
        await property.save();
      }
    }
    
    res.status(201).json(maintenanceRecord);
  } catch (err) {
    console.error('Create maintenance record error:', err.message);
    res.status(500).json({ message: 'Server error creating maintenance record' });
  }
};

// Helper function to calculate maintenance impact on valuation
function calculateMaintenanceImpact(category, cost) {
  // Different categories have different ROI factors
  const roiFactors = {
    'plumbing': 0.8,
    'electrical': 0.85,
    'hvac': 0.9,
    'roofing': 0.7,
    'appliance': 0.5,
    'structural': 1.1,
    'cosmetic': 0.5,
    'landscaping': 0.3,
    'renovation': 1.2,
    'other': 0.4
  };
  
  const factor = roiFactors[category] || 0.5;
  return cost * factor;
}

// @route   PUT /api/maintenance/:id
// @desc    Update a maintenance record
// @access  Private
exports.updateMaintenanceRecord = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    let maintenanceRecord = await MaintenanceRecord.findById(req.params.id);
    
    // Check if maintenance record exists
    if (!maintenanceRecord) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    
    // Check if user owns the property
    const property = await Property.findById(maintenanceRecord.property);
    
    if (property.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this maintenance record' });
    }
    
    // Build maintenance record fields
    const maintenanceFields = {};
    
    // Only update fields that are sent
    if (req.body.title !== undefined) maintenanceFields.title = req.body.title;
    if (req.body.description !== undefined) maintenanceFields.description = req.body.description;
    if (req.body.category !== undefined) maintenanceFields.category = req.body.category;
    if (req.body.cost !== undefined) maintenanceFields.cost = req.body.cost;
    if (req.body.completionDate !== undefined) maintenanceFields.completionDate = req.body.completionDate;
    if (req.body.contractor !== undefined) maintenanceFields.contractor = req.body.contractor;
    if (req.body.receiptUrls !== undefined) maintenanceFields.receiptUrls = req.body.receiptUrls;
    if (req.body.imageUrls !== undefined) maintenanceFields.imageUrls = req.body.imageUrls;
    if (req.body.warranty !== undefined) maintenanceFields.warranty = req.body.warranty;
    if (req.body.notes !== undefined) maintenanceFields.notes = req.body.notes;
    if (req.body.isActive !== undefined) maintenanceFields.isActive = req.body.isActive;
    
    // Update the maintenance record
    maintenanceRecord = await MaintenanceRecord.findByIdAndUpdate(
      req.params.id,
      { $set: maintenanceFields },
      { new: true }
    );
    
    // If cost was updated and significant, recalculate property value
    if (req.body.cost !== undefined && req.body.cost > 1000) {
      // Get last valuation
      const lastValuation = await Valuation.findOne({ property: property.id })
        .sort({ valuationDate: -1 });
      
      if (lastValuation) {
        const oldImpact = calculateMaintenanceImpact(
          maintenanceRecord.category, 
          maintenanceRecord.cost
        );
        
        const newImpact = calculateMaintenanceImpact(
          req.body.category || maintenanceRecord.category, 
          req.body.cost
        );
        
        const valueDifference = newImpact - oldImpact;
        
        if (Math.abs(valueDifference) > 100) {
          // Create new valuation with adjusted impact
          const newValue = lastValuation.value + valueDifference;
          
          const newValuation = new Valuation({
            property: property.id,
            value: newValue,
            method: 'automated',
            notes: `Valuation adjusted based on updated ${req.body.category || maintenanceRecord.category} maintenance cost`,
            maintenanceImpact: valueDifference,
            factorsConsidered: {
              maintenanceHistory: true
            }
          });
          
          await newValuation.save();
          
          // Update property with new valuation
          property.currentValue = newValue;
          property.lastValuationDate = newValuation.valuationDate;
          await property.save();
        }
      }
    }
    
    res.json(maintenanceRecord);
  } catch (err) {
    console.error('Update maintenance record error:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    
    res.status(500).json({ message: 'Server error updating maintenance record' });
  }
};

// @route   DELETE /api/maintenance/:id
// @desc    Delete a maintenance record
// @access  Private
exports.deleteMaintenanceRecord = async (req, res) => {
  try {
    const maintenanceRecord = await MaintenanceRecord.findById(req.params.id);
    
    // Check if maintenance record exists
    if (!maintenanceRecord) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    
    // Check if user owns the property
    const property = await Property.findById(maintenanceRecord.property);
    
    if (property.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this maintenance record' });
    }
    
    // Delete the maintenance record
    await MaintenanceRecord.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Maintenance record removed' });
  } catch (err) {
    console.error('Delete maintenance record error:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    
    res.status(500).json({ message: 'Server error deleting maintenance record' });
  }
};