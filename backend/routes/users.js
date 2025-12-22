const router = require("express").Router();
const pool = require("../db"); // Veritabanı bağlantı dosyanızın yolu (db.js veya index.js olabilir)
//const authorization = require("../middleware/auth"); // Varsa yetki kontrolü

// GET /users - Tüm kullanıcıları getir
router.get("/", async (req, res) => {
  try {
    // Veritabanındaki 'users' tablosundan verileri çekiyoruz
    // Şifreyi (user_password) güvenlik için çekmiyoruz
    const allUsers = await pool.query(
      "SELECT id, username, email as email, role, created_at FROM users"
    );
    
    // Frontend'e JSON olarak gönderiyoruz
    res.json(allUsers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;