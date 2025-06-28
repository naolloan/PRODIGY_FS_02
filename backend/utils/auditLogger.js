const pool = require('../config/db');

exports.logAction = async (managerId, action, targetUserId = null, targetEmployeeId = null, oldValue = null, newValue = null) => {
  try {
    await pool.query(
      `INSERT INTO audit_log 
      (manager_id, action, target_user, target_employee, old_value, new_value) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [managerId, action, targetUserId, targetEmployeeId, oldValue, newValue]
    );
  } catch (err) {
    console.error('Audit log failed:', err);
  }
};
