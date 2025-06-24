const pool = require('../config/db');
const { logAction } = require('../utils/auditLogger');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, role, created_at FROM users'
    );
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Validate role
  const validRoles = ['user', 'hr', 'manager', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }

  try {
    // Get old role for audit log
    const [user] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [id]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldRole = user[0].role;

    // Update role
    await pool.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );

    // Log the action
    await logAction(
      req.user.id,
      'role_change',
      id,
      oldRole,
      role
    );

    res.json({ 
      message: 'Role updated successfully',
      userId: id,
      newRole: role
    });

  } catch (err) {
    console.error('Role update error:', err);
    res.status(500).json({ message: 'Server error updating role' });
  }
};

// Get audit logs (admin only)
exports.getAuditLogs = async (req, res) => {
  try {
    let query = `
      SELECT 
        a.id, a.action, a.created_at,
        u1.username AS admin_name,
        u2.username AS target_name,
        a.old_value, a.new_value
      FROM audit_log a
      LEFT JOIN users u1 ON a.admin_id = u1.id
      LEFT JOIN users u2 ON a.target_user = u2.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `;
    
    const [logs] = await pool.query(query);
    res.json(logs);
  } catch (err) {
    console.error('Get audit logs error:', err);
    res.status(500).json({ message: 'Server error fetching logs' });
  }
};