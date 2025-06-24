CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO departments (name, description) VALUES 
('Human Resources', 'Handles recruitment, employee relations and benefits'),
('Information Technology', 'Manages company technology infrastructure'),
('Finance', 'Handles accounting and financial operations');