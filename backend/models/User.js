import { pool } from "../config/db.js";
export async function findUserByEmail(email){
  const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  return rows[0];
}
export async function createUser(name,email,hash){
  const { rows } = await pool.query(
    "INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING id,name,email,created_at",
    [name,email,hash]
  );
  return rows[0];
}
