const pool = require('../config/db');

class Employee {
  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM employees');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(employeeData) {
    const { firstName, lastName, email, phone, departmentId, position, salary, hireDate } = employeeData;
    const [result] = await pool.query(
      'INSERT INTO employees (first_name, last_name, email, phone, department_id, position, salary, hire_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, phone, departmentId, position, salary, hireDate]
    );
    return result.insertId;
  }

  static async update(id, employeeData) {
    const { firstName, lastName, email, phone, departmentId, position, salary, hireDate } = employeeData;
    await pool.query(
      'UPDATE employees SET first_name = ?, last_name = ?, email = ?, phone = ?, department_id = ?, position = ?, salary = ?, hire_date = ? WHERE id = ?',
      [firstName, lastName, email, phone, departmentId, position, salary, hireDate, id]
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM employees WHERE id = ?', [id]);
  }
}

module.exports = Employee;