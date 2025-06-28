CREATE TABLE IF NOT EXISTS audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  manager_id INT, -- removed NOT NULL ✅
  action VARCHAR(50) NOT NULL,
  target_user INT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES users(id),
  FOREIGN KEY (target_user) REFERENCES users(id)
);

INSERT INTO permissions (role, endpoint, method) VALUES
('manager', '/api/manager/users', 'GET'),
('manager', '/api/manager/users/*/role', 'PUT');