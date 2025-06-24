const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Public routes (viewing)
router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);

// Protected routes (modification)
router.post('/', authenticate, authorizeAdmin, createEmployee);
router.put('/:id', authenticate, authorizeAdmin, updateEmployee);
router.delete('/:id', authenticate, authorizeAdmin, deleteEmployee);

module.exports = router;