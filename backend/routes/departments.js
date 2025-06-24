const express = require('express');
const router = express.Router();
const {
  getAllDepartments,
  createDepartment,
  updateDepartment
} = require('../controllers/departmentController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getAllDepartments);

// Admin-only routes
router.post('/', authenticate, authorizeAdmin, createDepartment);
router.put('/:id', authenticate, authorizeAdmin, updateDepartment);

module.exports = router;