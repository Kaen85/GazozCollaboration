// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../db'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
require('dotenv').config();

// =========================================================
// 1. KULLANICI LİSTELEME
// URL: /api/auth/users
// =========================================================
router.get('/users', auth, async (req, res) => {
  try {
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
       return res.status(400).json({ message: 'Username or Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userRole = role || 'student';

    const newUser = await db.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, passwordHash, userRole]
    );

    const payload = { user: { id: newUser.rows[0].id, role: newUser.rows[0].role } };

    jwt.sign(payload, process.env.JWT_SECRET || 'mysecrettoken', { expiresIn: '30d' }, (err, token) => {
        if (err) throw err;
        res.status(201).json({ message: 'User registered successfully', token, user: newUser.rows[0] });
    });
  } catch (err) {
    console.error("Register Hatası:", err.message);
    res.status(500).send('Server error');
  }
});

// =========================================================
// 3. KULLANICI GÜNCELLEME (UPDATE) - YENİ EKLENDİ
// URL: /api/auth/users/:id
// =========================================================
router.put('/users/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { username, email, role, password } = req.body;

  console.log(`Update isteği geldi: ID=${id}, User=${username}, Role=${role}`);

  try {
    // 1. Kullanıcı var mı?
    const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Sorguyu Hazırla
    let query = 'UPDATE users SET username = $1, email = $2, role = $3';
    let values = [username, email, role];
    let counter = 4;

    // Şifre varsa güncelle, yoksa dokunma
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      query += `, password_hash = $${counter}`;
      values.push(passwordHash);
      counter++;
    }

    query += ` WHERE id = $${counter} RETURNING id, username, email, role`;
    values.push(id);

    // 3. Veritabanını Güncelle
    const updatedUser = await db.query(query, values);
    
    console.log("Kullanıcı güncellendi:", updatedUser.rows[0]);
    res.json(updatedUser.rows[0]);

  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// =========================================================
// 4. GİRİŞ (LOGIN)
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

// =========================================================
// 5. USER INFO, FORGOT & RESET PASSWORD
// =========================================================
router.get('/user', auth, async (req, res) => {
    try {
      const user = await db.query('SELECT id, username, email, role FROM users WHERE id = $1', [req.user.id]);
      res.json(user.rows[0]);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/forgot-password', async (req, res) => { /* ... Mevcut kodunuz ... */ res.json({msg: 'Link sent'}); });
router.post('/reset-password', async (req, res) => { /* ... Mevcut kodunuz ... */ res.json({msg: 'Password updated'}); });

module.exports = router;