// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../db'); // Veritabanı bağlantısı
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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
// @route   POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Please provide an email.' });

  try {
    // 1. Kullanıcıyı bul
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found with this email.' });
    }

    // 2. Rastgele bir token oluştur
    const resetToken = crypto.randomBytes(20).toString('hex');
    // 3. Token'ın geçerlilik süresi (1 saat)
    const resetExpires = new Date(Date.now() + 3600000); // 1 saat sonra

    // 4. Veritabanına kaydet
    await db.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
      [resetToken, resetExpires, email]
    );

    // 5. E-posta Gönderme Simülasyonu (Gerçek projede burada nodemailer kullanılır)
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

// === YENİ: ŞİFREYİ GÜNCELLEME ===
// @route   POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Invalid data.' });
  }

  try {
    // 1. Token'ı ve süresini kontrol et
    const user = await db.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // 2. Yeni şifreyi hash'le
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // 3. Şifreyi güncelle ve token'ı temizle
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
