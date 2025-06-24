CREATE TABLE IF NOT EXISTS audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  target_user INT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id),
  FOREIGN KEY (target_user) REFERENCES users(id)
);

INSERT INTO permissions (role, endpoint, method) VALUES
('admin', '/api/admin/users', 'GET'),
('admin', '/api/admin/users/*/role', 'PUT');