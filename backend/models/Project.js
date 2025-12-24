
// backend/models/Project.js

// Üyesi olduğunuz (sahibi olmadığınız) projeler
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
export async function createProject(ownerId, { title, description, visibility }){
  const { rows } = await pool.query(
    "INSERT INTO projects(owner_id,title,description,visibility) VALUES($1,$2,$3,$4) RETURNING *",
    [ownerId, title, description || null, visibility || "private"]
  );
  return rows[0];
}
// SADECE Public olan projeler (SharedProjectsPage için)
export async function listPublicProjects() {
  const { rows } = await pool.query(
    "SELECT * FROM projects WHERE is_public = true ORDER BY created_at DESC"
  );
  return rows;
}