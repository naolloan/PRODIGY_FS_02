const express = require('express');
const router = express.Router();
const { authenticate, authorizeManager, checkManager } = require('../middleware/auth');
const roleController = require('../controllers/roleController');

router.get('/users', authenticate, authorizeManager, roleController.getAllUsers);
router.put('/users/:id/role', authenticate, authorizeManager, roleController.updateUserRole);
router.get('/dashboard', 
  authenticate, 
  checkManager,
  (req, res) => {
    res.json({ message: 'Welcome Manager' });
  }
);
// Get audit logs
router.get('/audit-logs', authenticate, authorizeManager, async (req, res) => {
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
    
    const [logs] = await pool.query(`
      SELECT al.*, 
            u.username AS target_user_name,
            CONCAT(e.first_name, ' ', e.last_name) AS target_employee_name
      FROM audit_log al
      LEFT JOIN users u ON al.target_user = u.id
      LEFT JOIN employees e ON al.target_employee = e.id
      ORDER BY al.created_at DESC
    `);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;