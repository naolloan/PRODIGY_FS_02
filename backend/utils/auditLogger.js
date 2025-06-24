const pool = require('../config/db');

exports.logAction = async (adminId, action, targetUserId, oldValue = null, newValue = null) => {
  try {
    const effectiveAdminId = adminId || targetUserId;
    
    await pool.query(
      'INSERT INTO audit_log (admin_id, action, target_user, old_value, new_value) VALUES (?, ?, ?, ?, ?)',
      [effectiveAdminId, action, targetUserId, oldValue, newValue]
    );
  } catch (err) {
    console.error('Audit log failed:', err);
  }
};