// Project model helpers
import { pool } from "../config/db.js";

export async function createProject(ownerId, { title, description, visibility }){
  const { rows } = await pool.query(
    "INSERT INTO projects(owner_id,title,description,visibility) VALUES($1,$2,$3,$4) RETURNING *",
    [ownerId, title, description || null, visibility || "private"]
  );
  return rows[0];
}

export async function listMyProjects(ownerId){
  const { rows } = await pool.query(
    "SELECT * FROM projects WHERE owner_id=$1 ORDER BY created_at DESC",
    [ownerId]
  );
  return rows;
}

export async function listSharedProjects(){
  const { rows } = await pool.query(
    "SELECT * FROM projects WHERE visibility='shared' ORDER BY created_at DESC"
  );
  return rows;
}

export async function getProjectById(id){
  const { rows } = await pool.query(
    "SELECT * FROM projects WHERE id=$1",
    [id]
  );
  return rows[0];
}
