const pool = require('../config/db');
const { logAction } = require('../utils/auditLogger');

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const [departments] = await pool.query(
      'SELECT * FROM departments ORDER BY name'
    );
    res.json(departments);
  } catch (err) {
    console.error('Get departments error:', err);
    res.status(500).json({ message: 'Server error fetching departments' });
  }
};

// Create department
exports.createDepartment = async (req, res) => {
  const { name, description } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name, description]
    );

    await logAction(
      req.user.id,
      'department_create',
      result.insertId
    );

    res.status(201).json({
      message: 'Department created successfully',
      departmentId: result.insertId
    });

  } catch (err) {
    console.error('Create department error:', err);
    res.status(500).json({ message: 'Server error creating department' });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    await pool.query(
      'UPDATE departments SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );

    await logAction(
      req.user.id,
      'department_update',
      id
    );

    res.json({ 
      message: 'Department updated successfully',
      departmentId: id
    });

  } catch (err) {
    console.error('Update department error:', err);
    res.status(500).json({ message: 'Server error updating department' });
  }
};