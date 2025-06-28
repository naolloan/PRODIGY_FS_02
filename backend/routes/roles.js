const express = require('express');
const router = express.Router();
const { authenticate, authorizeManager } = require('../middleware/auth');
const { assignRole } = require('../controllers/roleController');

// Only managers can access these
router.put('/:id/role', authenticate, authorizeManager, assignRole);

module.exports = router;