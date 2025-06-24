const pool = require('../config/db');
const { logAction } = require('../utils/auditLogger');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const query = `
      SELECT 
        e.*,
        d.name AS department_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
    `;
    
    const [employees] = await pool.query(query);
    res.json(employees);
  } catch (err) {
    console.error('Get employees error:', err);
    res.status(500).json({ message: 'Server error fetching employees' });
  }
};

// Get single employee
exports.getEmployeeById = async (req, res) => {
  try {
    const [employee] = await pool.query(`
      SELECT e.*, d.name AS department_name 
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.id = ?
    `, [req.params.id]);

    if (employee.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee[0]);
  } catch (err) {
    console.error('Get employee error:', err);
    res.status(500).json({ message: 'Error fetching employee' });
  }
};

// Create new employee
exports.createEmployee = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    department_id,
    position,
    salary,
    hire_date
  } = req.body;

  try {
    // Check if email exists
    const [existing] = await pool.query(
      'SELECT id FROM employees WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create employee
    const [result] = await pool.query(
      `INSERT INTO employees 
      (first_name, last_name, email, phone, department_id, position, salary, hire_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone, department_id, position, salary, hire_date]
    );

    // Log the action
    await logAction(
      req.user.id,
      'employee_create',
      result.insertId
    );

    res.status(201).json({
      message: 'Employee created successfully',
      employeeId: result.insertId
    });

  } catch (err) {
    console.error('Create employee error:', err);
    res.status(500).json({ message: 'Server error creating employee' });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  const employeeData = req.body;

  try {
    // Get old data for audit log
    const [oldEmployee] = await pool.query(
      'SELECT * FROM employees WHERE id = ?',
      [id]
    );
    
    if (oldEmployee.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Update employee
    await pool.query(
      'UPDATE employees SET ? WHERE id = ?',
      [employeeData, id]
    );

    // Log the action
    await logAction(
      req.user.id,
      'employee_update',
      id,
      JSON.stringify(oldEmployee[0]),
      JSON.stringify(employeeData)
    );

    res.json({ 
      message: 'Employee updated successfully',
      employeeId: id
    });

  } catch (err) {
    console.error('Update employee error:', err);
    res.status(500).json({ message: 'Server error updating employee' });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    // Get employee data for audit log
    const [employee] = await pool.query(
      'SELECT * FROM employees WHERE id = ?',
      [id]
    );
    
    if (employee.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Delete employee
    await pool.query(
      'DELETE FROM employees WHERE id = ?',
      [id]
    );

    // Log the action
    await logAction(
      req.user.id,
      'employee_delete',
      id,
      JSON.stringify(employee[0])
    );

    res.json({ 
      message: 'Employee deleted successfully',
      employeeId: id
    });

  } catch (err) {
    console.error('Delete employee error:', err);
    res.status(500).json({ message: 'Server error deleting employee' });
  }
};