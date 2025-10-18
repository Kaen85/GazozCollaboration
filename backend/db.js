const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'hubdb',
  password: '3285',
  port: 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
