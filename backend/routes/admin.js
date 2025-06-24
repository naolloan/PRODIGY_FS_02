const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin, checkAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.get('/users', authenticate, authorizeAdmin, adminController.getAllUsers);
router.put('/users/:id/role', authenticate, authorizeAdmin, adminController.updateUserRole);
router.get('/dashboard', 
  authenticate, 
  checkAdmin,
  (_req, res) => {
    res.json({ message: 'Welcome Admin' });
  }
);
// Get audit logs
router.get('/audit-logs', authenticate, authorizeAdmin, async (req, res) => {
  try {
    let query = 'SELECT * FROM audit_log';
    const params = [];
    
    if (req.query.action) {
      query += ' WHERE action = ?';
      params.push(req.query.action);
    }
    
    if (req.query.date) {
      query += req.query.action ? ' AND' : ' WHERE';
      query += ' DATE(created_at) = ?';
      params.push(req.query.date);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [logs] = await pool.query(query, params);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token (add to auth routes)
router.get('/auth/verify', authenticate, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;