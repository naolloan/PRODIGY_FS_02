require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');

const employeeRoutes = require('./routes/employee');
const departmentRoutes = require('./routes/departments');
const roleRoutes = require('./routes/roles');
const managerRoutes = require('./routes/manager');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Enable CORS for frontend
app.use(cors({
  origin: 'http://127.0.0.1:5501', // Update with your frontend URL
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);

app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/manager', managerRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));