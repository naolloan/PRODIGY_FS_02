const pool = require('../config/db');

class Department {
  static async getAll() {
    const [departments] = await pool.query('SELECT * FROM departments ORDER BY name');
    return departments;
  }

  static async create(name, description) {
    const [result] = await pool.query(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name, description]
    );
    return result.insertId;
  }

  static async update(id, name, description) {
    await pool.query(
      'UPDATE departments SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
  }

  static async getById(id) {
    const [dept] = await pool.query(
      'SELECT * FROM departments WHERE id = ?',
      [id]
    );
    return dept[0];
  }
}

module.exports = Department;