// backend/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Import our database connection

// =================================
// MIDDLEWARE (GATEKEEPER)
// =================================
// This function checks if the user is a member of the project.
// We will add this to all routes that include :id.
const checkProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id; // Get project ID from URL
    const userId = req.user.id; // Get user ID from authMiddleware

    const memberCheck = await db.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (memberCheck.rows.length === 0) {
      // If user is not a member, deny access
      return res.status(403).json({ message: 'Access Denied: You are not a member of this project.' });
    }

    // If user is a member, attach their role and project ID to the request object
    req.projectId = projectId;
    req.memberRole = memberCheck.rows[0].role;
    next(); // Pass to the next function (the main route)

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// =================================
// MAIN PROJECT ROUTES
// =================================

// @route   POST /api/projects
// @desc    Create a new project
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  const ownerId = req.user.id; // Comes from authMiddleware

  try {
    await db.query('BEGIN'); // Start transaction

    // 1. Insert the project into the 'projects' table
    const newProjectQuery = `
      INSERT INTO projects (name, description, owner_id)
      VALUES ($1, $2, $3)
      RETURNING id, name, description, owner_id, created_at
    `;
    const newProject = await db.query(newProjectQuery, [name, description, ownerId]);
    const projectId = newProject.rows[0].id;

    // 2. Add the project owner to the 'project_members' table with 'owner' role
    const addMemberQuery = `
      INSERT INTO project_members (project_id, user_id, role)
      VALUES ($1, $2, $3)
    `;
    await db.query(addMemberQuery, [projectId, ownerId, 'owner']);

    await db.query('COMMIT'); // Commit the transaction

    res.status(201).json(newProject.rows[0]);

  } catch (err) {
    await db.query('ROLLBACK'); // Rollback on error
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/projects
// @desc    Get all projects the user is a member of
// FIX: This route should be '/' not ':id'
router.get('/', async (req, res) => {
  const userId = req.user.id;
  try {
    const projectsQuery = `
      SELECT p.* FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = $1
      ORDER BY p.created_at DESC
    `;
    const projects = await db.query(projectsQuery, [userId]);
    res.json(projects.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/projects/:id
// @desc    Get a single project's details by ID
// FIX: This route now uses the 'checkProjectMember' gatekeeper
router.get('/:id', checkProjectMember, async (req, res) => {
  try {
    // Security check was already done by checkProjectMember.
    const project = await db.query(
      'SELECT * FROM projects WHERE id = $1',
      [req.projectId] // req.projectId comes from our middleware
    );
    
    if (project.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// =================================
// ISSUES API ROUTES
// =================================

// @route   GET /api/projects/:id/issues
// @desc    Get all issues for a project
router.get('/:id/issues', checkProjectMember, async (req, res) => {
  try {
    const issues = await db.query(
      'SELECT pi.*, u.username as created_by_name FROM project_issues pi JOIN users u ON pi.created_by_id = u.id WHERE pi.project_id = $1 ORDER BY pi.created_at DESC',
      [req.projectId]
    );
    res.json(issues.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/projects/:id/issues
// @desc    Add a new issue to a project
router.post('/:id/issues', checkProjectMember, async (req, res) => {
  const { text } = req.body;
  const authorId = req.user.id;

  try {
    // Only the project owner can add issues
    if (req.memberRole !== 'owner') {
      return res.status(403).json({ message: 'Only the project owner can add issues.' });
    }

    const newIssue = await db.query(
      'INSERT INTO project_issues (project_id, created_by_id, text) VALUES ($1, $2, $3) RETURNING *',
      [req.projectId, authorId, text]
    );

    res.status(201).json(newIssue.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// =================================
// COMMENTS API ROUTES
// =================================

// @route   GET /api/projects/:id/comments
// @desc    Get all comments for a project
router.get('/:id/comments', checkProjectMember, async (req, res) => {
  try {
    const comments = await db.query(
      'SELECT c.*, u.username as author_name FROM comments c JOIN users u ON c.author_id = u.id WHERE c.project_id = $1 ORDER BY c.created_at DESC',
      [req.projectId]
    );
    res.json(comments.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/projects/:id/comments
// @desc    Add a new comment to a project
router.post('/:id/comments', checkProjectMember, async (req, res) => {
  const { text } = req.body;
  const authorId = req.user.id; // Any member can comment

  try {
    const newCommentQuery = `
      INSERT INTO comments (project_id, author_id, text) 
      VALUES ($1, $2, $3) 
      RETURNING id, project_id, author_id, text, created_at
    `;
    const newComment = await db.query(newCommentQuery, [req.projectId, authorId, text]);
    
    // Also include the author's name in the response
    const result = newComment.rows[0];
    result.author_name = req.user.name; // This info comes from the auth token
    
    res.status(201).json(result);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// =================================
// MEMBERS API ROUTES
// =================================

// @route   GET /api/projects/:id/members
// @desc    Get all members of a project
router.get('/:id/members', checkProjectMember, async (req, res) => {
  try {
    const members = await db.query(
      'SELECT u.id, u.username, pm.role FROM project_members pm JOIN users u ON pm.user_id = u.id WHERE pm.project_id = $1',
      [req.projectId]
    );
    res.json(members.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/projects/:id/members
// @desc    Add (invite) a new member to a project
router.post('/:id/members', checkProjectMember, async (req, res) => {
  // Only 'owner' or 'editor' roles can add members
  if (req.memberRole !== 'owner' && req.memberRole !== 'editor') {
    return res.status(403).json({ message: 'Only project owners or editors can add new members.' });
  }

  const { username } = req.body; // We'll add users by their 'username'
  if (!username) {
    return res.status(400).json({ message: 'Please provide a username to add.' });
  }

  try {
    // 1. Find the user to add in the 'users' table
    const userToAdd = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userToAdd.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const userIdToAdd = userToAdd.rows[0].id;
    
    // Check if the user is already a member
    const memberCheck = await db.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [req.projectId, userIdToAdd]
    );
    if (memberCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User is already a member of this project.' });
    }

    // 2. Add the user to the 'project_members' table
    const newMemberQuery = `
      INSERT INTO project_members (project_id, user_id, role) 
      VALUES ($1, $2, $3) 
      RETURNING project_id, user_id, role
    `;
    const newMember = await db.query(newMemberQuery, [req.projectId, userIdToAdd, 'viewer']); // Default role is 'viewer'
    
    res.status(201).json({ ...newMember.rows[0], username: username });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// Export the router at the end of the file
module.exports = router;