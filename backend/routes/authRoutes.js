const express = require('express');
const router = express.Router();
const db = require('../db'); // Veritabanı bağlantısı
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const auth = require('../middleware/auth'); // <--- EKLENDİ: Middleware importu şart
require('dotenv').config();

// --- 1. USER REGISTRATION API ---
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const userCheck = await db.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);

    if (userCheck.rows.length > 0) {
      if (userCheck.rows[0].username === username) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      if (userCheck.rows[0].email === email) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Varsayılan rol 'student' olarak kaydediliyor
    const newUser = await db.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, passwordHash, 'student']
    );

    // Token oluştururken rolü de ekliyoruz
    const payload = {
      user: {
        id: newUser.rows[0].id,
        role: newUser.rows[0].role // <--- TOKEN İÇİNE ROL EKLENDİ
      }
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
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// --- 2. USER LOGIN API ---
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const userResult = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // === İŞTE BURASI EKSİKTİ ===
    const payload = {
      user: {
        id: user.id,
        role: user.role // <--- TOKEN OLUŞTURULURKEN ARTIK ROL BİLGİSİ İÇİNDE OLACAK
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'mysecrettoken',
      { expiresIn: '30d' }, 
      (err, token) => {
        if (err) throw err;
        
        res.json({ 
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          } 
        });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --- 3. GET USER (SAYFA YENİLENİNCE KULLANICIYI HATIRLAMAK İÇİN) ---
router.get('/user', auth, async (req, res) => {
    try {
      const user = await db.query('SELECT id, username, email, role FROM users WHERE id = $1', [req.user.id]);
      res.json(user.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// --- 4. FORGOT PASSWORD ---
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Please provide an email.' });

  try {
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found with this email.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); 

    await db.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
      [resetToken, resetExpires, email]
    );

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    
    console.log("---------------------------------------------------");
    console.log("E-POSTA GÖNDERİLDİ (SİMÜLASYON):");
    console.log(`Kullanıcı: ${email}`);
    console.log(`Sıfırlama Linki: ${resetUrl}`);
    console.log("---------------------------------------------------");

    res.json({ message: 'Password reset link sent (Check server console).' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// --- 5. RESET PASSWORD ---
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Invalid data.' });
  }

  try {
    const user = await db.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await db.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [passwordHash, user.rows[0].id]
    );

    res.json({ message: 'Password updated successfully. You can now login.' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;