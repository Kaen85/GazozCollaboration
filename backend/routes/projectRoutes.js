const express = require('express');
const router = express.Router();
const db = require('../db'); 
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth'); 

// === MULTER AYARLARI ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// =================================
// YETKİ KONTROLÜ (MIDDLEWARE)
// =================================
const checkProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id; 
    const userId = req.user.id; 
    const userRole = req.user.role; 

    const projectCheck = await db.query(
      'SELECT is_public, owner_id, is_tasks_public FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const project = projectCheck.rows[0];

    if (userRole === 'admin') {
        req.projectId = projectId;
        req.memberRole = 'owner'; 
        req.projectSettings = project; 
        return next();
    }

    const memberCheck = await db.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    const memberRole = memberCheck.rows[0]?.role; 

    if (memberRole) {
      req.projectId = projectId;
      req.memberRole = memberRole;
      req.projectSettings = project; 
      next();
    } else if (project.is_public) {
      req.projectId = projectId;
      req.memberRole = 'public_viewer';
      req.projectSettings = project;
      next();
    } else {
      return res.status(403).json({ message: 'Access Denied.' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// =================================
// 1. PROJE LİSTELEME (GÜVENLİ ROTALAR)
// =================================

// @route   GET /api/projects/my-projects (SAHİBİ OLDUKLARIN)
router.get('/my-projects', auth, async (req, res) => {
  try {
    const projects = await db.query(`
      SELECT * FROM projects
      WHERE owner_id = $1
      ORDER BY last_updated_at DESC
    `, [req.user.id]);
    
    // Log atarak terminalden kontrol et: console.log("Owned Projects:", projects.rows);
    res.json(projects.rows);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   GET /api/projects/shared-projects (ÜYESİ OLDUKLARIN - KESİN KONTROL)
router.get('/shared-projects', auth, async (req, res) => {
  try {
    // Sadece project_members tablosunda kaydı olanları getirir. 
    // Üye olmadığın public projeler bu sorguya asla giremez.
    const projects = await db.query(`
      SELECT p.*, pm.role as user_role, pm.joined_at, u.username as owner_name
      FROM projects p
      INNER JOIN project_members pm ON p.id = pm.project_id
      INNER JOIN users u ON p.owner_id = u.id
      WHERE pm.user_id = $1 AND p.owner_id != $1
      ORDER BY p.last_updated_at DESC
    `, [req.user.id]);
    res.json(projects.rows);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   GET /api/projects/public-explorer (SADECE TÜM PUBLIC PROJELER)
router.get('/public-explorer', auth, async (req, res) => {
  try {
    const projects = await db.query(`
      SELECT p.*, u.username as owner_name
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      WHERE p.is_public = true
      ORDER BY p.created_at DESC
    `);
    res.json(projects.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/projects/user/all-tasks
router.get('/user/all-tasks', auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const query = `
      SELECT t.id, t.title, t.status, t.due_date, t.created_at, p.id as project_id, p.name as project_name
      FROM project_tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = $1
      ORDER BY t.created_at DESC
      LIMIT 10
    `;
    const result = await db.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// =================================
// 2. PROJE TEMEL İŞLEMLERİ
// =================================

router.post('/', auth, async (req, res) => {
  const { name, description } = req.body;
  const ownerId = req.user.id; 
  try {
    const existingProject = await db.query('SELECT id FROM projects WHERE name = $1', [name]);
    if (existingProject.rows.length > 0) return res.status(400).json({ message: 'A project with this name already exists.' });
    await db.query('BEGIN'); 
    const newProject = await db.query('INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING * ', [name, description, ownerId]);
    const projectId = newProject.rows[0].id;
    await db.query('INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)', [projectId, ownerId, 'owner']);
    await db.query('COMMIT'); 
    res.status(201).json(newProject.rows[0]);
  } catch (err) {
    await db.query('ROLLBACK'); 
    res.status(500).send('Server error');
  }
});

router.get('/:id', auth, checkProjectMember, async (req, res) => {
  try {
    const project = await db.query('SELECT * FROM projects WHERE id = $1', [req.projectId]);
    const data = project.rows[0];
    data.currentUserRole = req.memberRole; 
    res.json(data);
  } catch (err) { res.status(500).send('Server error'); }
});

router.put('/:id', auth, checkProjectMember, async (req, res) => {
  if (req.memberRole !== 'owner') return res.status(403).json({ message: 'Only owner can edit.' });
  const { name, description, long_description } = req.body;
  try {
    const updatedProject = await db.query('UPDATE projects SET name = $1, description = $2, long_description = $3, last_updated_at = NOW() WHERE id = $4 RETURNING *', [name, description, long_description, req.projectId]);
    const projectData = updatedProject.rows[0];
    projectData.currentUserRole = req.memberRole;
    res.json(projectData);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/:id', auth, checkProjectMember, async (req, res) => {
  if (req.memberRole !== 'owner') return res.status(403).json({ message: 'Only owner can delete.' });
  try {
    await db.query('DELETE FROM projects WHERE id = $1', [req.projectId]);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/:id/visibility', auth, checkProjectMember, async (req, res) => {
  if (req.memberRole !== 'owner') return res.status(403).json({ message: 'Only owner.' });
  try {
    const upd = await db.query('UPDATE projects SET is_public = $1 WHERE id = $2 RETURNING *', [req.body.is_public, req.projectId]);
    const data = upd.rows[0];
    data.currentUserRole = req.memberRole;
    res.json(data);
  } catch (err) { res.status(500).send('Server Error'); }
});

// =================================
// 3. TASKS
// =================================

router.get('/:id/tasks', auth, checkProjectMember, async (req, res) => {
  if (req.memberRole === 'public_viewer' && !req.projectSettings.is_tasks_public) return res.status(403).json({ message: 'Tasks are private.' });
  try {
    const tasks = await db.query('SELECT t.*, u.username as created_by_name FROM project_tasks t LEFT JOIN users u ON t.assignee_id = u.id WHERE t.project_id = $1 ORDER BY t.created_at ASC', [req.projectId]);
    res.json(tasks.rows);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/:id/tasks', auth, checkProjectMember, async (req, res) => {
  if (req.memberRole === 'public_viewer') return res.status(403).json({ message: 'Read-only.' });
  const { title, description, status, due_date } = req.body;
  try {
    const newTask = await db.query('INSERT INTO project_tasks (project_id, title, description, status, due_date, assignee_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [req.projectId, title, description, status || 'todo', due_date, req.user.id]);
    const user = await db.query('SELECT username FROM users WHERE id = $1', [req.user.id]);
    const taskObj = newTask.rows[0];
    taskObj.created_by_name = user.rows[0].username;
    res.status(201).json(taskObj);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/:id/tasks/:taskId', auth, checkProjectMember, async (req, res) => {
  if (req.memberRole === 'public_viewer') return res.status(403).json({ message: 'Read-only.' });
  const { title, status } = req.body;
  const { taskId } = req.params;
  try {
    let q, p;
    if (status) { q = 'UPDATE project_tasks SET status = $1 WHERE id = $2 RETURNING *'; p = [status, taskId]; }
    else { q = 'UPDATE project_tasks SET title = $1 WHERE id = $2 RETURNING *'; p = [title, taskId]; }
    const upd = await db.query(q, p);
    const taskObj = upd.rows[0];
    const user = await db.query('SELECT username FROM users WHERE id = $1', [taskObj.assignee_id]);
    taskObj.created_by_name = user.rows.length > 0 ? user.rows[0].username : 'Unknown';
    res.json(taskObj);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/:id/tasks/:taskId', auth, checkProjectMember, async (req, res) => {
  if (req.memberRole === 'public_viewer') return res.status(403).json({ message: 'Read-only.' });
  try {
    await db.query('DELETE FROM project_tasks WHERE id = $1', [req.params.taskId]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).send('Server Error'); }
});

// =================================
// 4. ISSUES
// =================================

router.get('/:id/issues', auth, checkProjectMember, async (req, res) => {
  try {
    const issues = await db.query('SELECT pi.*, u.username as created_by_name FROM project_issues pi JOIN users u ON pi.created_by_id = u.id WHERE pi.project_id = $1 ORDER BY pi.created_at DESC', [req.projectId]);
    res.json(issues.rows);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/:id/issues', auth, checkProjectMember, async (req, res) => {
  if (req.memberRole === 'viewer' || req.memberRole === 'public_viewer') return res.status(403).json({ message: 'No permission.' });
  try {
    const newIssue = await db.query('INSERT INTO project_issues (project_id, created_by_id, text) VALUES ($1, $2, $3) RETURNING *', [req.projectId, req.user.id, req.body.text]);
    const user = await db.query('SELECT username FROM users WHERE id = $1', [req.user.id]);
    const result = newIssue.rows[0];
    result.created_by_name = user.rows[0].username;
    res.status(201).json(result);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/:id/issues/:issueId', auth, checkProjectMember, async (req, res) => {
  if (req.memberRole !== 'owner' && req.memberRole !== 'editor') return res.status(403).json({ message: 'No permission.' });
  const { text, status } = req.body;
  try {
    let q, p;
    if (text !== undefined) { q = 'UPDATE project_issues SET text = $1 WHERE id = $2 RETURNING *'; p = [text, req.params.issueId]; }
    else { q = 'UPDATE project_issues SET status = $1 WHERE id = $2 RETURNING *'; p = [status, req.params.issueId]; }
    const upd = await db.query(q, p);
    const result = upd.rows[0];
    const userResult = await db.query('SELECT username FROM users WHERE id = $1', [result.created_by_id]);
    result.created_by_name = userResult.rows[0].username;
    res.json(result);
  } catch (err) { res.status(500).send('Server Error'); }
});

// =================================
// 5. COMMENTS & MEMBERS & FILES
// =================================

router.get('/:id/comments', auth, checkProjectMember, async (req, res) => {
  try {
    const comments = await db.query('SELECT c.*, u.username as author_name, c.likes_user_ids FROM comments c JOIN users u ON c.author_id = u.id WHERE c.project_id = $1 AND c.issue_id IS NULL ORDER BY c.created_at ASC', [req.projectId]);
    res.json(comments.rows);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/:id/comments', auth, checkProjectMember, async (req, res) => {
  try {
    const newComment = await db.query('INSERT INTO comments (project_id, author_id, text) VALUES ($1, $2, $3) RETURNING *', [req.projectId, req.user.id, req.body.text]);
    const user = await db.query('SELECT username FROM users WHERE id = $1', [req.user.id]);
    const result = newComment.rows[0];
    result.author_name = user.rows[0].username;
    result.likes_user_ids = [];
    res.status(201).json(result);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.get('/:id/members', auth, checkProjectMember, async (req, res) => {
  try {
    const m = await db.query('SELECT u.id, u.username, pm.role FROM project_members pm LEFT JOIN users u ON pm.user_id = u.id WHERE pm.project_id = $1', [req.projectId]);
    res.json(m.rows);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/:id/members', auth, checkProjectMember, async (req, res) => {
  if (req.memberRole !== 'owner' && req.memberRole !== 'editor') return res.status(403).json({message:'Denied'});
  const { username, role } = req.body;
  try {
    const u = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if(u.rows.length===0) return res.status(404).json({message:'User not found'});
    const uid = u.rows[0].id;
    const check = await db.query('SELECT * FROM project_members WHERE project_id=$1 AND user_id=$2', [req.projectId, uid]);
    if(check.rows.length>0) return res.status(400).json({message:'Already member'});
    const nm = await db.query('INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) RETURNING role', [req.projectId, uid, role]);
    res.status(201).json({id: uid, username, role: nm.rows[0].role});
  } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/:id/members/:userId', auth, checkProjectMember, async (req, res) => {
  if (req.memberRole !== 'owner') return res.status(403).json({message:'Denied'});
  if (req.params.userId === req.user.id) return res.status(400).json({message:'Cannot remove owner'});
  try {
    const del = await db.query('DELETE FROM project_members WHERE project_id=$1 AND user_id=$2 RETURNING *', [req.projectId, req.params.userId]);
    if(del.rows.length===0) return res.status(404).json({message:'Not found'});
    res.json({message:'Removed'});
  } catch (err) { res.status(500).send('Server Error'); }
});

router.get('/:id/files', auth, checkProjectMember, async (req, res) => {
  try {
    const f = await db.query('SELECT pf.*, u.username as uploader_name FROM project_files pf JOIN users u ON pf.uploader_id = u.id WHERE pf.project_id = $1 ORDER BY pf.created_at DESC', [req.projectId]);
    res.json(f.rows);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/:id/files', auth, checkProjectMember, upload.single('file'), async (req, res) => {
  if(req.memberRole!=='owner' && req.memberRole!=='editor') return res.status(403).json({message:'Denied'});
  if(!req.file) return res.status(400).json({message:'No file'});
  try {
    const nf = await db.query('INSERT INTO project_files (project_id, uploader_id, filename, file_path, file_type) VALUES ($1, $2, $3, $4, $5) RETURNING *', [req.projectId, req.user.id, req.file.originalname, req.file.path, req.file.mimetype]);
    const u = await db.query('SELECT username FROM users WHERE id=$1', [req.user.id]);
    const r = nf.rows[0];
    r.uploader_name = u.rows[0].username;
    res.status(201).json(r);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/:id/files/:fileId', auth, checkProjectMember, async (req, res) => {
  if(req.memberRole!=='owner' && req.memberRole!=='editor') return res.status(403).json({message:'Denied'});
  try {
    await db.query('DELETE FROM project_files WHERE id=$1', [req.params.fileId]);
    res.json({message:'Deleted'});
  } catch (err) { res.status(500).send('Server Error'); }
});

// backend/routes/projectRoutes.js
// Tüm projeleri getiren admin listesi
router.get('/admin/all-projects', auth, async (req, res) => {
  try {
    const [projects] = await db.execute(`
      SELECT 
        p.id, 
        p.name, 
        u.username as owner_name 
      FROM projects p 
      LEFT JOIN users u ON p.owner_id = u.id 
      ORDER BY p.updated_at DESC
    `);
    res.json(projects);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;