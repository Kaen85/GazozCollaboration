// /routes/authRoutes.js

const express = require('express');
const router = express.Router();

// @route   POST api/auth/login
// @desc    Authenticate user & get token (for now, just a dummy login)
// @access  Public
router.post('/login', (req, res) => { // <--- BU SATIRI KONTROL ET
  console.log('Login endpoint was successfully hit!'); // Add this for testing
  res.json({ 
    success: true, 
    message: 'Login successful' 
  });
});

module.exports = router;