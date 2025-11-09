// backend/db.js
const { Pool } = require('pg');
require('dotenv').config(); // .env dosyasındaki değişkenleri yükler

// Yeni Pool yapılandırması
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: process.env.DATABASE_URL // Sadece Heroku/Render gibi servisler için 'ssl' gerekir.
    ? { rejectUnauthorized: false } 
    : false, // Lokal 'localhost' bağlantısında ssl: false olmalı
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};