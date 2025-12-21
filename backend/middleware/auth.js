const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
  // 1. Header'dan token'ı al (Frontend x-auth-token gönderiyor)
  const token = req.header('x-auth-token');

  // 2. Token yoksa durdur
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // 3. Token'ı çöz ve kullanıcıyı tanı
  try {
    const secret = process.env.JWT_SECRET || 'mysecrettoken';
    const decoded = jwt.verify(token, secret);
    
    req.user = decoded.user; // İşte req.user burada oluşuyor!
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};