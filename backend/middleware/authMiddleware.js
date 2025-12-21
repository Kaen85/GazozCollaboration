// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// This function is our "gatekeeper"
function authMiddleware(req, res, next) {
  // Get the token from the request header
  // It's usually sent as 'Bearer <token>'
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Check if it starts with 'Bearer '
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token is malformed, authorization denied' });
  }

  try {
    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Token is valid. Add the user's information to the request object
    // Now any protected route can access req.user
    req.user = decoded.user;
    next(); // Pass control to the next function (the actual route handler)
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = authMiddleware;