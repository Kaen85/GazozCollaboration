// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../db'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
require('dotenv').config();
const authController = require('../controllers/authController');

// --- DÜZELTME BURADA: Multer ve Upload tanımlarını EN ÜSTE aldık ---
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Proje ana dizininde 'uploads' klasörü olduğundan emin ol
  },
  filename: function (req, file, cb) {
    // Benzersiz dosya ismi: zaman damgası + uzantı
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
// ------------------------------------------------------------------

// =========================================================
// 0. PROFIL GÜNCELLEME (Artık 'upload' tanımlı olduğu için hata vermez)
// =========================================================
router.put('/profile', auth, upload.single('avatar'), async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userId = req.user.id;
    let avatarPath = null;

    if (req.file) {
      // Windows için ters slaşları düzelt
      avatarPath = req.file.path.replace(/\\/g, '/');
    }

    // 1. Şifre güncelleme isteği varsa
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
    }

    // 2. Kullanıcı bilgilerini ve avatarı güncelle
    if (avatarPath) {
        await db.query(
            'UPDATE users SET username = COALESCE($1, username), email = COALESCE($2, email), profile_picture = $3 WHERE id = $4',
            [username, email, avatarPath, userId]
        );
    } else {
        await db.query(
            'UPDATE users SET username = COALESCE($1, username), email = COALESCE($2, email) WHERE id = $3',
            [username, email, userId]
        );
    }

    // Güncel veriyi döndür
    const updatedUser = await db.query('SELECT id, username, email, role, profile_picture FROM users WHERE id = $1', [userId]);
    res.json(updatedUser.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// =========================================================
// 1. KULLANICI LİSTELEME
// URL: /api/auth/users
// =========================================================
router.get('/users', auth, async (req, res) => {
  try {
    
    const result = await db.query(
      'SELECT id, username, email, role, profile_picture, created_at FROM users ORDER BY created_at DESC'
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
// 3. KULLANICI GÜNCELLEME (UPDATE)
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

    // Şifre varsa güncelle
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
      res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, profile_picture: user.profile_picture } });
    });
  } catch (err) { res.status(500).send('Server error'); }
});

// =========================================================
// 5. USER INFO, FORGOT & RESET PASSWORD
// =========================================================
router.get('/user', auth, async (req, res) => {
    try {
      const user = await db.query('SELECT id, username, email, role, profile_picture FROM users WHERE id = $1', [req.user.id]);
      res.json(user.rows[0]);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/users/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    await db.query('DELETE FROM users WHERE id = $1', [id]);
    
    console.log(`User with ID ${id} has been deleted.`);
    res.json({ message: 'User deleted successfully' });

  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;