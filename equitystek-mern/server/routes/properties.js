const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const propertyController = require('../controllers/propertyController');
const auth = require('../middleware/auth');

// @route   GET /api/properties
// @desc    Get all properties for a user
// @access  Private
router.get('/', auth, propertyController.getProperties);

// @route   GET /api/properties/:id
// @desc    Get property by ID
// @access  Private
router.get('/:id', auth, propertyController.getPropertyById);

// @route   POST /api/properties
// @desc    Create a property
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('address', 'Address is required').not().isEmpty(),
      check('city', 'City is required').not().isEmpty(),
      check('state', 'State is required').not().isEmpty(),
      check('zipCode', 'ZIP code is required').not().isEmpty(),
      check('propertyType', 'Property type is required').not().isEmpty()
    ]
  ],
  propertyController.createProperty
);

// @route   PUT /api/properties/:id
// @desc    Update a property
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('address', 'Address is required').optional(),
      check('city', 'City is required').optional(),
      check('state', 'State is required').optional(),
      check('zipCode', 'ZIP code is required').optional(),
      check('propertyType', 'Property type is required').optional()
    ]
  ],
  propertyController.updateProperty
);

// @route   DELETE /api/properties/:id
// @desc    Delete a property
// @access  Private
router.delete('/:id', auth, propertyController.deleteProperty);

module.exports = router;