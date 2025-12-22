const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth'); // Token kontrolü için şart
require('dotenv').config();

// =========================================================
// 1. TÜM KULLANICILARI LİSTELE (BU EKSİKTİ)
// URL: /api/auth/users
// =========================================================
router.get('/users', auth, async (req, res) => {
  try {
    // Şifre hariç, en yeniden eskiye doğru kullanıcıları çek
    const result = await db.query(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Listeleme Hatası:", err.message);
    res.status(500).send('Server Error');
  }
});

// =========================================================
// 2. KULLANICI KAYIT (REGISTER)
// URL: /api/auth/register
// =========================================================
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const userCheck = await db.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);

    if (userCheck.rows.length > 0) {
      if (userCheck.rows[0].username === username) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      return res.status(400).json({ message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Admin panelinden rol gelmezse varsayılan 'student' olsun
    const userRole = role || 'student';

    const newUser = await db.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, passwordHash, userRole]
    );

    const payload = {
      user: { id: newUser.rows[0].id, role: newUser.rows[0].role }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'mysecrettoken',
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: newUser.rows[0]
        });
      }
    );

  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).send('Server error');
  }
});

// =========================================================
// 3. LOGİN, USER ve ŞİFRE İŞLEMLERİ (MEVCUT KODLARIN)
// =========================================================
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Please enter all fields' });

  try {
    const userResult = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET || 'mysecrettoken', { expiresIn: '30d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    });
  } catch (err) { res.status(500).send('Server error'); }
});

router.get('/user', auth, async (req, res) => {
    try {
      const user = await db.query('SELECT id, username, email, role FROM users WHERE id = $1', [req.user.id]);
      res.json(user.rows[0]);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/forgot-password', async (req, res) => {
  /* ... Mevcut kodunuz kalsın ... */
  res.json({ message: 'Password reset link sent' });
});

router.post('/reset-password', async (req, res) => {
  /* ... Mevcut kodunuz kalsın ... */
  res.json({ message: 'Password updated' });
});

module.exports = router;