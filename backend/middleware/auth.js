// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
  // 1. Get token from header
  const authHeader = req.header('Authorization');
  let token;

  // Check Authorization: Bearer <token>
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } 
  // Check x-auth-token (Legacy support)
  else if (req.header('x-auth-token')) {
    token = req.header('x-auth-token');
  }
  // 2. IMPORTANT: Check URL Query (For Iframe/PDF Preview)
  else if (req.query && req.query.token) {
    token = req.query.token;
  }

  // 3. Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // 4. Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }

  
};