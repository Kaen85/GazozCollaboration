// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
  // 1. Try to get token from 'Authorization' header
  const authHeader = req.header('Authorization');
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } 
  // 2. Fallback: Check 'x-auth-token' header
  else if (req.header('x-auth-token')) {
    token = req.header('x-auth-token');
  }
  // 3. Fallback: Check URL Query parameter (Crucial for iframe/preview)
  else if (req.query && req.query.token) {
    token = req.query.token;
  }

  // 4. If no token found anywhere
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // 5. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error("Token Verification Error:", err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = authMiddleware;