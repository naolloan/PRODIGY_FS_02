CREATE DATABASE IF NOT EXISTS employee_management;
USE employee_management;

-- Users table for authentication
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

-- Employees table
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  department_id INT,
  position VARCHAR(100),
  salary DECIMAL(10,2),
  hire_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Insert sample admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role)
VALUES ('admin', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYrJ6WWhiC3xPGkOgKXYg1/XHNAQ6O', 'admin');

-- Insert sample departments
INSERT INTO departments (name, description) VALUES 
('HR', 'Human Resources'),
('IT', 'Information Technology'),
('Finance', 'Finance and Accounting');

-- Insert sample employees
INSERT INTO employees (first_name, last_name, email, phone, department_id, position, salary, hire_date)
VALUES 
('John', 'Doe', 'john.doe@example.com', '1234567890', 1, 'HR Manager', 75000.00, '2020-01-15'),
('Jane', 'Smith', 'jane.smith@example.com', '2345678901', 2, 'IT Specialist', 85000.00, '2019-05-20'),
('Mike', 'Johnson', 'mike.johnson@example.com', '3456789012', 3, 'Accountant', 65000.00, '2021-03-10');