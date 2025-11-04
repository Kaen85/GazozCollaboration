// backend/db.js
const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool instance.
// It will automatically read connection details from .env variables
// like PGUSER, PGHOST, PGPASSWORD, PGDATABASE, PGPORT
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Or use individual variables
  ssl: {
    rejectUnauthorized: false // Required for services like Heroku, Render
  }
});

module.exports = {
  // A function to query the database
  query: (text, params) => pool.query(text, params),
};