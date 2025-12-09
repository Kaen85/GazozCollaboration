const express = require('express');
const router = express.Router();
const db = require('../db'); // Database connection
const multer = require('multer');
const path = require('path');

// === FILE UPLOAD SETTINGS (MULTER) ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// =================================
// MIDDLEWARE (GATEKEEPER)
// =================================
const checkProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id; 
    const userId = req.user.id; 

    // 1. Check if project exists and is Public
    const projectCheck = await db.query(
      'SELECT is_public, owner_id, is_tasks_public FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const project = projectCheck.rows[0];

    // 2. Check membership
    const memberCheck = await db.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    const memberRole = memberCheck.rows[0]?.role; 

    // === PERMISSION LOGIC ===
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
// 1. PROJECT MANAGEMENT (MAIN ROUTES)
// =================================

// @route   POST /api/projects
// @desc    Create new project
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  const ownerId = req.user.id; 

  try {
    const existingProject = await db.query('SELECT id FROM projects WHERE name = $1', [name]);
    if (existingProject.rows.length > 0) {
      return res.status(400).json({ message: 'A project with this name already exists.' });
    }

    await db.query('BEGIN'); 
    
    const newProjectQuery = `
      INSERT INTO projects (name, description, owner_id)
      VALUES ($1, $2, $3)
      RETURNING * `; 
    const newProject = await db.query(newProjectQuery, [name, description, ownerId]);
    const projectId = newProject.rows[0].id;
    
    await db.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [projectId, ownerId, 'owner']
    );
    
    await db.query('COMMIT'); 
    res.status(201).json(newProject.rows[0]);
  } catch (err) {
    await db.query('ROLLBACK'); 
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/projects (All Projects I am a member of)
router.get('/', async (req, res) => {
  try {
    const projects = await db.query(`
      SELECT p.* FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = $1
      ORDER BY p.last_updated_at DESC
    `, [req.user.id]);
    res.json(projects.rows);
  } catch (err) { 
    res.status(500).send('Server error');
  }
});

// @route   GET /api/projects/my-projects (Projects I Own)
router.get('/my-projects', async (req, res) => {
  try {
    const projects = await db.query(`
      SELECT * FROM projects
      WHERE owner_id = $1
      ORDER BY last_updated_at DESC
    `, [req.user.id]);
    res.json(projects.rows);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   GET /api/projects/shared-projects (Shared + Public)
// === GÜNCELLEME BURADA: Public projeler için 'created_at' tarihini 'joined_at' olarak gönderiyoruz ===
router.get('/shared-projects', async (req, res) => {
  try {
    const projects = await db.query(`
      (
        -- 1. Private Shared (Joined date exists)
        SELECT p.id, p.name, p.description, p.owner_id, p.created_at, p.last_updated_at, p.is_public,
          pm.joined_at,
          u.username as owner_name
        FROM projects p
        JOIN project_members pm ON p.id = pm.project_id
        JOIN users u ON p.owner_id = u.id
        WHERE pm.user_id = $1 AND p.owner_id != $1
      )
      UNION
      (
        -- 2. Public Projects (Use created_at as joined_at)
        SELECT p.id, p.name, p.description, p.owner_id, p.created_at, p.last_updated_at, p.is_public,
          p.created_at as joined_at, -- NULL yerine created_at kullanıyoruz
          u.username as owner_name
        FROM projects p
        JOIN users u ON p.owner_id = u.id
        WHERE p.is_public = true AND p.owner_id != $1
      )
      ORDER BY last_updated_at DESC
    `, [req.user.id]);
    res.json(projects.rows);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   GET /api/projects/:id (Details)
router.get('/:id', checkProjectMember, async (req, res) => {
  try {
    const project = await db.query('SELECT * FROM projects WHERE id = $1', [req.projectId]);
    const data = project.rows[0];
    data.currentUserRole = req.memberRole; 
    res.json(data);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/projects/:id (Update)
router.put('/:id', checkProjectMember, async (req, res) => {
  if (req.memberRole !== 'owner') {
    return res.status(403).json({ message: 'Only the project owner can update details.' });
  }

  const { name, description, long_description } = req.body;

  try {
    const updatedProject = await db.query(
      'UPDATE projects SET name = $1, description = $2, long_description = $3, last_updated_at = NOW() WHERE id = $4 RETURNING *',
      [name, description, long_description, req.projectId]
    );
    
    const projectData = updatedProject.rows[0];
    projectData.currentUserRole = req.memberRole;
    
    res.json(projectData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/projects/:id (Delete)
router.delete('/:id', checkProjectMember, async (req, res) => {
  if (req.memberRole !== 'owner') {
    return res.status(403).json({ message: 'Only the project owner can delete the project.' });
  }

  try {
    await db.query('DELETE FROM projects WHERE id = $1', [req.projectId]);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /visibility (Public/Private)
router.put('/:id/visibility', checkProjectMember, async (req, res) => {
  if (req.memberRole !== 'owner') return res.status(403).json({ message: 'Only owner.' });
  try {
    const upd = await db.query(
      'UPDATE projects SET is_public = $1 WHERE id = $2 RETURNING *',
      [req.body.is_public, req.projectId]
    );
    const data = upd.rows[0];
    data.currentUserRole = req.memberRole;
    res.json(data);
  } catch (err) { res.status(500).send('Server Error'); }
});

// =================================
// 2. TASKS (KANBAN)
// =================================

router.put('/:id/settings/tasks-visibility', checkProjectMember, async (req, res) => {
  if (req.memberRole !== 'owner') return res.status(403).json({ message: 'Only owner.' });
  try {
    const upd = await db.query('UPDATE projects SET is_tasks_public = $1 WHERE id = $2 RETURNING is_tasks_public', [req.body.is_tasks_public, req.projectId]);
    res.json(upd.rows[0]);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.get('/:id/tasks', checkProjectMember, async (req, res) => {
  if (req.memberRole === 'public_viewer' && !req.projectSettings.is_tasks_public) {
    return res.status(403).json({ message: 'Tasks are private.' });
  }
  try {
    const tasks = await db.query(
      'SELECT t.*, u.username as created_by_name FROM project_tasks t LEFT JOIN users u ON t.assignee_id = u.id WHERE t.project_id = $1 ORDER BY t.created_at ASC',
      [req.projectId]
    );
    res.json(tasks.rows);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/:id/tasks', checkProjectMember, async (req, res) => {
  if (req.memberRole === 'public_viewer') return res.status(403).json({ message: 'Read-only.' });
  const { title, description, status, due_date } = req.body;
  try {
    const newTask = await db.query(
      'INSERT INTO project_tasks (project_id, title, description, status, due_date, assignee_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.projectId, title, description, status || 'todo', due_date, req.user.id]
    );
    const user = await db.query('SELECT username FROM users WHERE id = $1', [req.user.id]);
    const taskObj = newTask.rows[0];
    taskObj.created_by_name = user.rows[0].username;
    res.status(201).json(taskObj);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/:id/tasks/:taskId', checkProjectMember, async (req, res) => {
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

router.delete('/:id/tasks/:taskId', checkProjectMember, async (req, res) => {
  if (req.memberRole === 'public_viewer') return res.status(403).json({ message: 'Read-only.' });
  try {
    await db.query('DELETE FROM project_tasks WHERE id = $1', [req.params.taskId]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).send('Server Error'); }
});

// =================================
// 3. ISSUES
// =================================

router.get('/:id/issues', checkProjectMember, async (req, res) => {
  try {
    const issues = await db.query(
      'SELECT pi.*, u.username as created_by_name FROM project_issues pi JOIN users u ON pi.created_by_id = u.id WHERE pi.project_id = $1 ORDER BY pi.created_at DESC',
      [req.projectId]
    );
    res.json(issues.rows);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/:id/issues', checkProjectMember, async (req, res) => {
  if (req.memberRole === 'viewer' || req.memberRole === 'public_viewer') return res.status(403).json({ message: 'No permission.' });
  try {
    const newIssue = await db.query(
      'INSERT INTO project_issues (project_id, created_by_id, text) VALUES ($1, $2, $3) RETURNING *',
      [req.projectId, req.user.id, req.body.text]
    );
    const user = await db.query('SELECT username FROM users WHERE id = $1', [req.user.id]);
    const result = newIssue.rows[0];
    result.created_by_name = user.rows[0].username;
    res.status(201).json(result);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/:id/issues/:issueId', checkProjectMember, async (req, res) => {
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
// 4. COMMENTS
// =================================

router.get('/:id/comments', checkProjectMember, async (req, res) => {
  try {
    const comments = await db.query(
      'SELECT c.*, u.username as author_name, c.likes_user_ids FROM comments c JOIN users u ON c.author_id = u.id WHERE c.project_id = $1 AND c.issue_id IS NULL ORDER BY c.created_at ASC',
      [req.projectId]
    );
    res.json(comments.rows);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/:id/comments', checkProjectMember, async (req, res) => {
  try {
    const newComment = await db.query(
      'INSERT INTO comments (project_id, author_id, text) VALUES ($1, $2, $3) RETURNING *',
      [req.projectId, req.user.id, req.body.text]
    );
    const user = await db.query('SELECT username FROM users WHERE id = $1', [req.user.id]);
    const result = newComment.rows[0];
    result.author_name = user.rows[0].username;
    result.likes_user_ids = [];
    res.status(201).json(result);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.get('/:id/issues/:issueId/comments', checkProjectMember, async (req, res) => {
  try {
    const comments = await db.query(
      'SELECT c.*, u.username as author_name, c.likes_user_ids FROM comments c JOIN users u ON c.author_id = u.id WHERE c.issue_id = $1 ORDER BY c.created_at ASC',
      [req.params.issueId]
    );
    res.json(comments.rows);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/:id/issues/:issueId/comments', checkProjectMember, async (req, res) => {
  try {
    const issueCheck = await db.query('SELECT status FROM project_issues WHERE id = $1', [req.params.issueId]);
    if (issueCheck.rows[0].status === 'Closed') return res.status(403).json({ message: 'Issue is closed.' });
    
    const newComment = await db.query(
      'INSERT INTO comments (project_id, issue_id, author_id, text) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.projectId, req.params.issueId, req.user.id, req.body.text]
    );
    const userResult = await db.query('SELECT username FROM users WHERE id = $1', [req.user.id]);
    const result = newComment.rows[0];
    result.author_name = userResult.rows[0].username;
    res.status(201).json(result);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/:id/comments/:commentId', checkProjectMember, async (req, res) => {
  try {
    let q = 'UPDATE comments SET text = $1 WHERE id = $2 AND author_id = $3 RETURNING *';
    let p = [req.body.text, req.params.commentId, req.user.id];
    if (req.memberRole === 'owner') { q = 'UPDATE comments SET text = $1 WHERE id = $2 RETURNING *'; p = [req.body.text, req.params.commentId]; }
    const upd = await db.query(q, p);
    if(upd.rows.length===0) return res.status(403).json({message:'Denied'});
    const result = upd.rows[0];
    const userResult = await db.query('SELECT username FROM users WHERE id = $1', [result.author_id]);
    result.author_name = userResult.rows[0].username;
    res.json(result);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.delete('/:id/comments/:commentId', checkProjectMember, async (req, res) => {
  try {
    let q = 'DELETE FROM comments WHERE id = $1 AND author_id = $2 RETURNING *';
    let p = [req.params.commentId, req.user.id];
    if (req.memberRole === 'owner') { q = 'DELETE FROM comments WHERE id = $1 RETURNING *'; p = [req.params.commentId]; }
    const del = await db.query(q, p);
    if(del.rows.length===0) return res.status(403).json({message:'Denied'});
    res.json({message:'Deleted'});
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/:id/comments/:commentId/like', checkProjectMember, async (req, res) => {
   try {
     const c = await db.query('SELECT likes_user_ids FROM comments WHERE id = $1', [req.params.commentId]);
     if(c.rows.length===0) return res.status(404).json({message:'Not found'});
     const likes = c.rows[0].likes_user_ids || [];
     let q;
     if(likes.includes(req.user.id)) q = 'UPDATE comments SET likes_user_ids = array_remove(likes_user_ids, $1) WHERE id = $2 RETURNING likes_user_ids';
     else q = 'UPDATE comments SET likes_user_ids = array_append(likes_user_ids, $1) WHERE id = $2 RETURNING likes_user_ids';
     const upd = await db.query(q, [req.user.id, req.params.commentId]);
     res.json(upd.rows[0]);
   } catch (err) { res.status(500).send('Server Error'); }
});

// =================================
// 5. MEMBERS
// =================================
router.get('/:id/members', checkProjectMember, async (req, res) => {
  try {
    const m = await db.query('SELECT u.id, u.username, pm.role FROM project_members pm LEFT JOIN users u ON pm.user_id = u.id WHERE pm.project_id = $1', [req.projectId]);
    res.json(m.rows);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/:id/members', checkProjectMember, async (req, res) => {
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

router.delete('/:id/members/:userId', checkProjectMember, async (req, res) => {
  if (req.memberRole !== 'owner') return res.status(403).json({message:'Denied'});
  if (req.params.userId === req.user.id) return res.status(400).json({message:'Cannot remove owner'});
  try {
    const del = await db.query('DELETE FROM project_members WHERE project_id=$1 AND user_id=$2 RETURNING *', [req.projectId, req.params.userId]);
    if(del.rows.length===0) return res.status(404).json({message:'Not found'});
    res.json({message:'Removed'});
  } catch (err) { res.status(500).send('Server Error'); }
});

// =================================
// 6. FILES
// =================================
router.get('/:id/files', checkProjectMember, async (req, res) => {
  try {
    const f = await db.query('SELECT pf.*, u.username as uploader_name FROM project_files pf JOIN users u ON pf.uploader_id = u.id WHERE pf.project_id = $1 ORDER BY pf.created_at DESC', [req.projectId]);
    res.json(f.rows);
  } catch (err) { res.status(500).send('Server Error'); }
});

router.post('/:id/files', checkProjectMember, upload.single('file'), async (req, res) => {
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

router.delete('/:id/files/:fileId', checkProjectMember, async (req, res) => {
  if(req.memberRole!=='owner' && req.memberRole!=='editor') return res.status(403).json({message:'Denied'});
  try {
    await db.query('DELETE FROM project_files WHERE id=$1', [req.params.fileId]);
    res.json({message:'Deleted'});
  } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;