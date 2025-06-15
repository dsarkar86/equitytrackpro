const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const maintenanceController = require('../controllers/maintenanceController');
const auth = require('../middleware/auth');

// @route   GET /api/maintenance
// @desc    Get all maintenance records for a user's properties
// @access  Private
router.get('/', auth, maintenanceController.getMaintenanceRecords);

// @route   GET /api/maintenance/:id
// @desc    Get maintenance record by ID
// @access  Private
router.get('/:id', auth, maintenanceController.getMaintenanceRecordById);

// @route   POST /api/maintenance
// @desc    Create a maintenance record
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('property', 'Property ID is required').not().isEmpty(),
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('category', 'Category is required').not().isEmpty(),
      check('cost', 'Cost is required').isNumeric(),
      check('completionDate', 'Completion date is required').not().isEmpty()
    ]
  ],
  maintenanceController.createMaintenanceRecord
);

// @route   PUT /api/maintenance/:id
// @desc    Update a maintenance record
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('title', 'Title is required').optional(),
      check('description', 'Description is required').optional(),
      check('category', 'Category is required').optional(),
      check('cost', 'Cost is required').optional().isNumeric(),
      check('completionDate', 'Completion date is required').optional()
    ]
  ],
  maintenanceController.updateMaintenanceRecord
);

// @route   DELETE /api/maintenance/:id
// @desc    Delete a maintenance record
// @access  Private
router.delete('/:id', auth, maintenanceController.deleteMaintenanceRecord);

module.exports = router;