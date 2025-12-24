// backend/models/Project.js
import { pool } from "../config/db.js";

/**
 * 1. SAHİBİ OLDUĞUNUZ PROJELER
 * Sadece sizin oluşturduğunuz projeleri getirir.
 */
export async function listMyProjects(ownerId) {
  const { rows } = await pool.query(
    "SELECT * FROM projects WHERE owner_id = $1 ORDER BY created_at DESC",
    [ownerId]
  );
  return rows;
}

/**
 * 2. ÜYESİ OLDUĞUNUZ PROJELER (Shared listesi için)
 * Sahibi olmadığınız ama project_members tablosunda kaydınızın olduğu projeleri getirir.
 * Bu sayede üyesi olmadığınız hiçbir proje "My Projects" havuzuna sızamaz.
 */
export async function listSharedProjects(userId) {
  const { rows } = await pool.query(
    `SELECT p.*, pm.role as user_role 
     FROM projects p 
     INNER JOIN project_members pm ON p.id = pm.project_id 
     WHERE pm.user_id = $1 AND p.owner_id != $1 
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return rows;
}

/**
 * 3. SADECE GENEL (PUBLIC) PROJELER
 * SharedProjectsPage (Public Explorer) için kullanılır.
 * Sadece is_public = true olanları getirir.
 */
export async function listPublicProjects() {
  const { rows } = await pool.query(
    "SELECT * FROM projects WHERE is_public = true ORDER BY created_at DESC"
  );
  return rows;
}

/**
 * PROJE OLUŞTURMA
 */
export async function createProject(ownerId, { title, description, visibility }) {
  const { rows } = await pool.query(
    "INSERT INTO projects(owner_id, title, description, visibility) VALUES($1, $2, $3, $4) RETURNING *",
    [ownerId, title, description || null, visibility || "private"]
  );
  return rows[0];
}

/**
 * PROJE DETAYI
 */
export async function getProjectById(id) {
  const { rows } = await pool.query(
    "SELECT * FROM projects WHERE id = $1",
    [id]
  );
  return rows[0];
}