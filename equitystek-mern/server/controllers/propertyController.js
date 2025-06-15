const { validationResult } = require('express-validator');
const Property = require('../models/Property');
const MaintenanceRecord = require('../models/MaintenanceRecord');
const Valuation = require('../models/Valuation');
const Subscription = require('../models/Subscription');

// @route   GET /api/properties
// @desc    Get all properties for a user
// @access  Private
exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(properties);
  } catch (err) {
    console.error('Get properties error:', err.message);
    res.status(500).json({ message: 'Server error retrieving properties' });
  }
};

// @route   GET /api/properties/:id
// @desc    Get property by ID
// @access  Private
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    // Check if property exists
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if user owns the property
    if (property.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to access this property' });
    }
    
    res.json(property);
  } catch (err) {
    console.error('Get property error:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    res.status(500).json({ message: 'Server error retrieving property' });
  }
};

// @route   POST /api/properties
// @desc    Create a property
// @access  Private
exports.createProperty = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Check if user has a subscription and update property count
    const subscription = await Subscription.findOne({ user: req.user.id, status: 'active' });
    
    if (subscription) {
      // Get current property count
      const currentPropertiesCount = await Property.countDocuments({ user: req.user.id });
      
      // Update subscription's property count
      subscription.propertyCount = currentPropertiesCount + 1;
      await subscription.save();
    }
    
    // Create new property
    const newProperty = new Property({
      user: req.user.id,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      propertyType: req.body.propertyType,
      bedrooms: req.body.bedrooms || 0,
      bathrooms: req.body.bathrooms || 0,
      squareFeet: req.body.squareFeet || 0,
      yearBuilt: req.body.yearBuilt || 0,
      lotSize: req.body.lotSize || 0,
      imageUrl: req.body.imageUrl || '',
      purchasePrice: req.body.purchasePrice || 0,
      purchaseDate: req.body.purchaseDate,
      currentValue: req.body.currentValue || 0
    });
    
    const property = await newProperty.save();
    
    // Create initial valuation if currentValue is provided
    if (req.body.currentValue) {
      const newValuation = new Valuation({
        property: property.id,
        value: req.body.currentValue,
        method: 'owner_estimate',
        notes: 'Initial valuation at property creation'
      });
      
      await newValuation.save();
      
      // Update property with valuation date
      property.lastValuationDate = newValuation.valuationDate;
      await property.save();
    }
    
    res.status(201).json(property);
  } catch (err) {
    console.error('Create property error:', err.message);
    res.status(500).json({ message: 'Server error creating property' });
  }
};

// @route   PUT /api/properties/:id
// @desc    Update a property
// @access  Private
exports.updateProperty = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    let property = await Property.findById(req.params.id);
    
    // Check if property exists
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if user owns the property
    if (property.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this property' });
    }
    
    // Build property object from request
    const propertyFields = {};
    
    // Only update fields that are sent in the request
    if (req.body.address) propertyFields.address = req.body.address;
    if (req.body.city) propertyFields.city = req.body.city;
    if (req.body.state) propertyFields.state = req.body.state;
    if (req.body.zipCode) propertyFields.zipCode = req.body.zipCode;
    if (req.body.propertyType) propertyFields.propertyType = req.body.propertyType;
    if (req.body.bedrooms !== undefined) propertyFields.bedrooms = req.body.bedrooms;
    if (req.body.bathrooms !== undefined) propertyFields.bathrooms = req.body.bathrooms;
    if (req.body.squareFeet !== undefined) propertyFields.squareFeet = req.body.squareFeet;
    if (req.body.yearBuilt !== undefined) propertyFields.yearBuilt = req.body.yearBuilt;
    if (req.body.lotSize !== undefined) propertyFields.lotSize = req.body.lotSize;
    if (req.body.imageUrl !== undefined) propertyFields.imageUrl = req.body.imageUrl;
    if (req.body.purchasePrice !== undefined) propertyFields.purchasePrice = req.body.purchasePrice;
    if (req.body.purchaseDate) propertyFields.purchaseDate = req.body.purchaseDate;
    if (req.body.isActive !== undefined) propertyFields.isActive = req.body.isActive;
    
    // Update current value and create valuation if provided
    if (req.body.currentValue !== undefined) {
      propertyFields.currentValue = req.body.currentValue;
      propertyFields.lastValuationDate = new Date();
      
      // Create new valuation record
      const newValuation = new Valuation({
        property: property.id,
        value: req.body.currentValue,
        method: 'owner_estimate',
        notes: req.body.valuationNotes || 'Value updated by owner'
      });
      
      await newValuation.save();
    }
    
    // Update the property
    property = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: propertyFields },
      { new: true }
    );
    
    res.json(property);
  } catch (err) {
    console.error('Update property error:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    res.status(500).json({ message: 'Server error updating property' });
  }
};

// @route   DELETE /api/properties/:id
// @desc    Delete a property
// @access  Private
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    // Check if property exists
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if user owns the property
    if (property.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this property' });
    }
    
    // Delete all associated maintenance records
    await MaintenanceRecord.deleteMany({ property: req.params.id });
    
    // Delete all associated valuations
    await Valuation.deleteMany({ property: req.params.id });
    
    // Delete the property
    await Property.findByIdAndDelete(req.params.id);
    
    // Update subscription property count
    const subscription = await Subscription.findOne({ user: req.user.id, status: 'active' });
    if (subscription) {
      const currentPropertiesCount = await Property.countDocuments({ user: req.user.id });
      subscription.propertyCount = currentPropertiesCount;
      await subscription.save();
    }
    
    res.json({ message: 'Property removed' });
  } catch (err) {
    console.error('Delete property error:', err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    res.status(500).json({ message: 'Server error deleting property' });
  }
};