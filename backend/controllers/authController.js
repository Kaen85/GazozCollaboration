// backend/controllers/authController.js
const db = require('../db'); 
const crypto = require('crypto');
const bcrypt = require('bcryptjs'); 

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide email.' });

    try {
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rowCount === 0) return res.status(404).json({ message: 'User not found.' });

        const resetToken = crypto.randomBytes(20).toString('hex');

        // SAVE THE TOKEN TO THE USER RECORD
        await db.query('UPDATE users SET reset_token = $1 WHERE email = $2', [resetToken, email]);

        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
        console.log(`🔑 LINK: ${resetUrl}`);

        return res.status(200).json({ message: 'Link generated. Check terminal.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // FIND USER BY TOKEN AND UPDATE PASSWORD
        const updateQuery = `
            UPDATE users 
            SET password_hash = $1, reset_token = NULL 
            WHERE reset_token = $2 
            RETURNING id
        `;
        const result = await db.query(updateQuery, [passwordHash, token]); 

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Invalid or expired token.' });
        }

        return res.status(200).json({ message: 'Your password has been successfully updated.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error resetting password.' });
    }
};