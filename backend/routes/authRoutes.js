// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../db'); // Veritabanı bağlantısı
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// --- 1. USER REGISTRATION API (HATA KONTROLLÜ) ---
// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Alanların dolu olup olmadığını kontrol et
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // === İSTEDİĞİNİZ HATA KONTROLÜ BURADA ===
    // 1. Veritabanında bu 'username' VEYA 'email' ile eşleşen bir kayıt ara
    const userCheck = await db.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);

    // 2. Eğer bir kayıt bulunduysa (rows.length > 0)
    if (userCheck.rows.length > 0) {
      // 3. Bulunan kayıt 'username' ile mi eşleşti?
      if (userCheck.rows[0].username === username) {
        // Evet -> Kullanıcıyı bilgilendir
        return res.status(400).json({ message: 'Username already exists' });
      }
      // 4. Bulunan kayıt 'email' ile mi eşleşti?
      if (userCheck.rows[0].email === email) {
        // Evet -> Kullanıcıyı bilgilendir
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    // === HATA KONTROLÜ SONU ===


    // Şifreyi hash'le
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Yeni kullanıcıyı (email dahil) veritabanına ekle
    const newUser = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, passwordHash]
    );

    // Başarı mesajı döndür
    res.status(201).json({
      message: 'User registered successfully',
      user: newUser.rows[0]
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// --- 2. USER LOGIN API ---
// (Bu rota aynı kalır)
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

    const payload = {
      user: {
        id: user.id,
        name: user.username
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' }, 
      (err, token) => {
        if (err) throw err;
        
        res.json({ 
          token,
          user: {
            id: user.id,
            username: user.username
          } 
        });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;