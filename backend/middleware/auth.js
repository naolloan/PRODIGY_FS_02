const pool = require('../config/db');
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  const token = req.header('x-auth-token');
  console.log('Authenticating request, token:', token);
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [users] = await pool.query(
      'SELECT id, role FROM users WHERE id = ?',
      [decoded.user.id]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = {
      id: users[0].id,
      role: users[0].role 
    };

    console.log('Authenticated user:', req.user);
    
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.authorizeManager = (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ 
      message: 'Manager privileges required',
      yourRole: req.user.role
    });
  }
  next();
};

exports.checkManager = (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Manager access required' });
  }
  next();
};

exports.authorizeAdmin = (req, res, next) => {
  if (!['manager', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Admin privileges required',
      yourRole: req.user.role
    });
  }
  next();
};

exports.checkAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
