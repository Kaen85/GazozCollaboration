// PostgreSQL pool + schema bootstrap
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:1234@localhost:5432/studentdb"
});

export async function ensureTables(){
  const c = await pool.connect();
  try{
    await c.query("BEGIN");
    await c.query(`CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );`);
    await c.query(`CREATE TABLE IF NOT EXISTS projects(
      id SERIAL PRIMARY KEY,
      owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      visibility TEXT NOT NULL DEFAULT 'private', -- 'private' or 'shared'
      created_at TIMESTAMP DEFAULT NOW()
    );`);
    await c.query("COMMIT");
  }catch(e){
    await c.query("ROLLBACK"); throw e;
  }finally{
    c.release();
  }
}
