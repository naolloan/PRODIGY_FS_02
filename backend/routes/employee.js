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
router.get('/list', getAllEmployees);

// Protected routes (modification)
router.get('/:id', authenticate, authorizeAdmin, getEmployeeById);
router.post('/', authenticate, authorizeAdmin, createEmployee);
router.put('/:id', authenticate, authorizeAdmin, updateEmployee);
router.delete('/:id', authenticate, authorizeAdmin, deleteEmployee);
router.get('/me', authenticate, (req, res) => {
  res.json(req.user); // For role verification
});

module.exports = router;