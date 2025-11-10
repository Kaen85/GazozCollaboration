// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// --- 1. USER REGISTRATION API ---
// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check if user already exists
    const userCheck = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert new user into the database
    const newUser = await db.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, passwordHash]
    );

    // Respond with success
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
// @route   POST /api/auth/login
// @desc    Authenticate user and get token
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check if user exists
    const userResult = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      // --- DÜZELTME 1 BURADA ---
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const user = userResult.rows[0];

    // Check if password matches
    // Compare the plain text password from the request with the hashed password from the DB
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // --- DÜZELTME 2 BURADA ---
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // User is validated. Create a JWT token.
    const payload = {
      user: {
        id: user.id,
        name: user.username // This will be used in the AuthContext
      }
    };

    // Sign the token with a secret key
    // Create a JWT_SECRET in your .env file
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' }, // Token expires in 30 days
      (err, token) => {
        if (err) throw err;
        // Send the token back to the frontend
        res.json({ token });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;


//Yeni
import { Router } from "express";
import { register, login } from "../controllers/authController.js";
const r = Router();
r.post("/register", register);
r.post("/login", login);
export default r;
