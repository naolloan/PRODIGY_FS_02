const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { validationResult } = require('express-validator');
const { logAction } = require('../utils/auditLogger');

// Register new user (auto-assign 'user' role)
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    // Check if user exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?', 
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, "user")',
      [username, email, hashedPassword]
    );

    // Log the action (admin creates user would go here)
    await logAction(result.insertId, 'user_self_register', result.insertId);

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertId 
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        });
      }
    );

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.verifyToken = async (req, res) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ valid: false, message: 'No token provided' });
  }

  try {
    // First verify JWT signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Then check database for fresh user data
    const [users] = await pool.query(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [decoded.user.id]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ valid: false, message: 'User not found' });
    }

    // Return fresh user data
    res.json({
      valid: true,
      user: {
        id: users[0].id,
        username: users[0].username,
        email: users[0].email,
        role: users[0].role
      }
    });

  } catch (err) {
    console.error('Token verification error:', err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ valid: false, message: 'Token expired' });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ valid: false, message: 'Invalid token' });
    }
    
    res.status(500).json({ valid: false, message: 'Server error during verification' });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const [user] = await pool.query(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user[0]);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};