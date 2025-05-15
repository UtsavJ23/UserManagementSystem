// Debug routes for troubleshooting authentication
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');

// Public endpoint that anyone can access
router.get('/debug-public', (req, res) => {
  res.json({ 
    message: 'Public endpoint successfully accessed',
    cookies: req.cookies,
    time: new Date().toISOString()
  });
});

// Protected endpoint that requires authentication
router.get('/debug-private', requireAuth, (req, res) => {
  res.json({
    message: 'Private endpoint successfully accessed',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      roles: req.user.roles
    },
    time: new Date().toISOString()
  });
});

module.exports = router;
