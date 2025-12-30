const express = require('express');
const router = express.Router();
const db = require('../db'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // <--- EKLENDİ (Klasör kontrolü için)
const auth = require('../middleware/auth'); 
const libre = require('libreoffice-convert');
const util = require('util');
const { exec } = require('child_process');



function convertToPdf(inputBuffer) {
    return new Promise((resolve, reject) => {
        libre.convert(inputBuffer, '.pdf', undefined, (err, done) => {
            if (err) {
                return reject(err);
            }
            resolve(done);
        });
    });
}

// === MULTER AYARLARI (GÜNCELLENDİ) ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
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
// 1. PROJE LİSTELEME
// =================================

router.get('/my-projects', auth, async (req, res) => {
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

router.get('/shared-projects', auth, async (req, res) => {
  try {
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

router.get('/user/all-tasks', auth, async (req, res) => {
  const userId = req.user.id;
  try {
    const query = `
      SELECT t.id, t.title, t.status, t.due_date, t.created_at, t.assignee_id, p.id as project_id, p.name as project_name
      FROM project_tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = $1 
      AND (t.assignee_id = $1 OR t.assignee_id IS NULL) -- Sadece bana atanan veya boşta olanlar
      AND t.status != 'done' -- Tamamlananları getirme (Opsiyonel)
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
  try {
    // DÜZELTME: t.assigned_to YERİNE t.assignee_id KULLANILDI
    const tasks = await db.query(`
      SELECT t.*, u.username as assignee_name 
      FROM project_tasks t
      LEFT JOIN users u ON t.assignee_id = u.id 
      WHERE t.project_id = $1
      ORDER BY t.created_at ASC
    `, [req.projectId]);
    res.json(tasks.rows);
  } catch (err) { 
    console.error("Task Get Error:", err);
    res.status(500).send('Server Error'); 
  }
});

router.post('/:id/tasks', auth, checkProjectMember, async (req, res) => {
  if (req.memberRole === 'public_viewer') return res.status(403).json({ message: 'Read-only.' });
  
  const { title, description, status, due_date, assigned_to } = req.body; // assigned_to frontend'den gelir

  try {
    // Boş gelirse NULL yap (Herkes seçeneği için)
    const assigneeId = assigned_to || null;

    // DÜZELTME: Kolon adı 'assignee_id', değer $6
    const newTask = await db.query(
      'INSERT INTO project_tasks (project_id, title, description, status, due_date, assignee_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', 
      [req.projectId, title, description, status || 'todo', due_date, assigneeId]
    );

    // Oluşturan kişinin adını da ekle
    const user = await db.query('SELECT username FROM users WHERE id = $1', [req.user.id]);
    const taskObj = newTask.rows[0];
    taskObj.created_by_name = user.rows[0].username;
    
    // Atanan kişinin ismini de bulup geri döndürelim (Frontend'de hemen görünmesi için)
    if (assigneeId) {
       const assignee = await db.query('SELECT username FROM users WHERE id = $1', [assigneeId]);
       taskObj.assignee_name = assignee.rows[0]?.username;
    }

    res.status(201).json(taskObj);
  } catch (err) { 
    console.error("Task Create Error:", err);
    res.status(500).send('Server Error'); 
  }
});

// ==========================================
// UPDATE TASK (Geliştirilmiş Versiyon)
// ==========================================
router.put('/:id/tasks/:taskId', auth, checkProjectMember, async (req, res) => {
  const { title, status, assigned_to, due_date } = req.body;
  const { taskId } = req.params;

  try {
    // 1. VERİ TEMİZLİĞİ: "Herkes" seçilirse (boş string) NULL yap
    let safeAssignee = assigned_to;
    if (assigned_to === "" || assigned_to === undefined) safeAssignee = null;

    let safeDate = due_date;
    if (due_date === "") safeDate = null;

    // 2. GÜNCELLEME SORGUSU
    // DÜZELTME: assigned_to = $3 YERİNE assignee_id = $3
    const updatedTask = await db.query(
      `UPDATE project_tasks SET 
        title = COALESCE($1, title), 
        status = COALESCE($2, status),
        assignee_id = $3, 
        due_date = $4      
       WHERE id = $5 AND project_id = $6 RETURNING *`,
      [
        title,           // $1
        status,          // $2
        safeAssignee,    // $3 (assignee_id kolonuna gider)
        safeDate,        // $4
        taskId,          // $5
        req.projectId    // $6
      ]
    );
    
    // 3. GÜNCEL VERİYİ KULLANICI ADIYLA DÖNDÜR
    // DÜZELTME: t.assigned_to YERİNE t.assignee_id
    const result = await db.query(`
      SELECT t.*, u.username as assignee_name 
      FROM project_tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.id = $1
    `, [taskId]);

    res.json(result.rows[0]);
  } catch (err) { 
    console.error("Task Update Error:", err); 
    res.status(500).send('Server Error'); 
  }
});

router.delete('/:id/tasks/:taskId', auth, checkProjectMember, async (req, res) => {
  if (req.memberRole === 'public_viewer') return res.status(403).json({ message: 'Read-only.' });
  try {
    await db.query('DELETE FROM project_tasks WHERE id = $1', [req.params.taskId]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).send('Server Error'); }
});

// =================================
//  COLUMNS (KOLON YÖNETİMİ) - YENİ
// =================================

// Kolonları Getir
router.get('/:id/columns', auth, checkProjectMember, async (req, res) => {
  try {
    // 1. Mevcut kolonları çekmeye çalış
    const result = await db.query(
      'SELECT * FROM project_columns WHERE project_id = $1 ORDER BY position ASC', 
      [req.projectId]
    );

    // 2. EĞER HİÇ KOLON YOKSA (Proje yeni açılmışsa)
    // Varsayılan kolonları (To Do, In Progress, Done) oluştur ve 'is_fixed' yap.
    if (result.rows.length === 0) {
      await db.query(`
        INSERT INTO project_columns (project_id, column_id, title, position, is_fixed)
        VALUES 
        ($1, 'todo', 'To Do', 0, true),
        ($1, 'in_progress', 'In Progress', 1, true),
        ($1, 'done', 'Done', 2, true)
      `, [req.projectId]);

      // Yeni oluşturulanları çekip gönder
      const newResult = await db.query(
        'SELECT * FROM project_columns WHERE project_id = $1 ORDER BY position ASC', 
        [req.projectId]
      );
      return res.json(newResult.rows);
    }

    // Zaten kolon varsa onları gönder
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
// Yeni Kolon Ekle
router.post('/:id/columns', auth, checkProjectMember, async (req, res) => {
  const { title, column_id, position } = req.body;
  try {
    const newCol = await db.query(
      'INSERT INTO project_columns (project_id, title, column_id, position) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.projectId, title, column_id, position || 0]
    );
    res.status(201).json(newCol.rows[0]);
  } catch (err) { res.status(500).send('Server Error'); }
});

// Kolon Sırasını Güncelle (Sürükle-Bırak sonrası)
router.put('/:id/columns/reorder', auth, checkProjectMember, async (req, res) => {
  const { newOrder } = req.body; // ['todo', 'in_progress', 'custom_1'] gibi array
  try {
    // Transaction başlatıp hepsini sırayla güncelle
    await db.query('BEGIN');
    for (let i = 0; i < newOrder.length; i++) {
      await db.query(
        'UPDATE project_columns SET position = $1 WHERE project_id = $2 AND column_id = $3',
        [i, req.projectId, newOrder[i]]
      );
    }
    await db.query('COMMIT');
    res.json({ message: 'Order updated' });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).send('Server Error');
  }
});

// Kolon Silme
router.delete('/:id/columns/:columnId', auth, checkProjectMember, async (req, res) => {
  const { columnId } = req.params;
  try {
    // 1. Önce bu kolonun 'is_fixed' (sabit) olup olmadığını kontrol edelim
    // (Opsiyonel: Eğer Todo/Done gibi kolonların silinmesini istemiyorsan)
    const check = await db.query(
        'SELECT is_fixed FROM project_columns WHERE project_id = $1 AND column_id = $2',
        [req.projectId, columnId]
    );

    if (check.rows.length > 0 && check.rows[0].is_fixed) {
        return res.status(400).json({ message: 'Sabit kolonlar silinemez.' });
    }

    // 2. Kolonu veritabanından sil
    await db.query(
      'DELETE FROM project_columns WHERE project_id = $1 AND column_id = $2',
      [req.projectId, columnId]
    );

    
    
    res.json({ message: 'Column deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
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

router.get('/:id/files/:fileId/preview', auth, checkProjectMember, async (req, res) => {
    try {
        await db.query('UPDATE project_files SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1', [req.params.fileId]);
        // 1. Fetch file data
        const fileResult = await db.query('SELECT * FROM project_files WHERE id = $1', [req.params.fileId]);
        if (fileResult.rows.length === 0) return res.status(404).send('File not found');

        const file = fileResult.rows[0];

        // 2. Construct file path
        // Fix Windows backslashes if necessary
        const filePath = path.join(__dirname, '..', file.file_path.replace(/\\/g, '/'));
        const outputDir = path.dirname(filePath); // PDF will be output to the same folder

        // 3. Check if file exists on disk
        if (!fs.existsSync(filePath)) {
            return res.status(404).send('File missing from disk');
        }

        const ext = path.extname(file.filename).toLowerCase();

        // 4. If already PDF or Image/Text, send directly
        if (['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.txt'].includes(ext)) {
            // Set content type specifically for PDF or default to image/text handling
            if (ext === '.pdf') {
                res.contentType('application/pdf');
            } else if (ext === '.txt') {
                res.contentType('text/plain');
            } else {
                res.contentType('image/jpeg'); // or generic image type
            }
            return res.sendFile(filePath);
        }

        // 5. IF OFFICE FILE -> Convert to PDF via Manual Command
        if (['.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls'].includes(ext)) {

            // Determine PDF filename (LibreOffice keeps the name, changes ext to pdf)
            // Example: uploads/file.docx -> uploads/file.pdf
            const pdfFileName = path.basename(filePath, ext) + '.pdf';
            const pdfFilePath = path.join(outputDir, pdfFileName);

            // If PDF was already created previously, send it directly (Performance optimization)
            if (fs.existsSync(pdfFilePath)) {
                res.contentType("application/pdf");
                return res.sendFile(pdfFilePath);
            }

            // --- MANUAL CONVERSION COMMAND ---
            // Path to LibreOffice (Default for Windows)
            // Change this path if it is installed elsewhere on your server!
            const sofficePath = 'C:\\Program Files\\LibreOffice\\program\\soffice.exe';

            // Command: soffice --headless --convert-to pdf --outdir "uploads/" "uploads/file.docx"
            const command = `"${sofficePath}" --headless --convert-to pdf --outdir "${outputDir}" "${filePath}"`;

            // Execute Command
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error("Conversion Error:", error);
                    console.error("Stderr:", stderr);
                    return res.status(500).send("PDF Conversion Failed: " + error.message);
                }

                // Conversion finished, check for the generated PDF and send it
                if (fs.existsSync(pdfFilePath)) {
                    res.contentType("application/pdf");

                    // Send the file
                    res.sendFile(pdfFilePath, (err) => {
                        if (err) console.error("Sending error:", err);
                        // Optional: fs.unlinkSync(pdfFilePath); // Delete PDF after sending if you don't want to cache it
                    });
                } else {
                    res.status(500).send("PDF file was not created by LibreOffice.");
                }
            });

        } else {
            res.status(400).send('Preview not supported');
        }

    } catch (err) {
        console.error("General Error:", err);
        res.status(500).send("Server Error");
    }
});

// =================================
// 5. COMMENTS & MEMBERS
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
    // DÜZELTME: 'pm.role' EKLENDİ.
    // Artık frontend'de member.role verisi dolu gelecek (editor/viewer).
    const members = await db.query(`
      SELECT u.id, u.username, u.email, u.profile_picture, pm.role
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = $1
    `, [req.projectId]);
    res.json(members.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.post('/:id/members', auth, checkProjectMember, async (req, res) => {
  // 1. Permission Check
  if (req.memberRole !== 'owner' && req.memberRole !== 'editor') {
      return res.status(403).json({ message: 'Denied. Only Owner or Editor can add members.' });
  }

  const { username, role } = req.body;

  try {
    // 2. Find User (Get ID AND Profile Picture)
    // We need profile_picture here to return it to the frontend for immediate display
    const u = await db.query('SELECT id, profile_picture FROM users WHERE username = $1', [username]);
    
    if (u.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    const uid = u.rows[0].id;
    const userProfilePic = u.rows[0].profile_picture;
    
    // 3. Check if already a member
    const check = await db.query('SELECT * FROM project_members WHERE project_id=$1 AND user_id=$2', [req.projectId, uid]);
    if (check.rows.length > 0) {
        return res.status(400).json({ message: 'Already member' });
    }
    
    // 4. Define Role (Fix for "Always Viewer" issue)
    // If role is undefined or empty string, default to 'viewer'
    const roleToAssign = role || 'viewer';

    // 5. Insert into Database
    const nm = await db.query(
        'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) RETURNING role', 
        [req.projectId, uid, roleToAssign]
    );
    
    // 6. Return Data (Including profile_picture)
    res.status(201).json({ 
        id: uid, 
        username, 
        role: nm.rows[0].role, 
        profile_picture: userProfilePic 
    });

  } catch (err) { 
      console.error(err); 
      res.status(500).send('Server Error'); 
  }
});
router.put('/:id/members/:userId', auth, checkProjectMember, async (req, res) => {
  if (req.memberRole !== 'owner') return res.status(403).json({ message: 'Only owner can change roles.' });
  if (req.params.userId === req.user.id.toString()) return res.status(400).json({ message: 'Cannot change owner role.' });
  const { role } = req.body;
  try {
    const updatedMember = await db.query(
      'UPDATE project_members SET role = $1 WHERE project_id = $2 AND user_id = $3 RETURNING *',
      [role, req.projectId, req.params.userId]
    );
    if (updatedMember.rows.length === 0) return res.status(404).json({ message: 'Member not found.' });
    res.json(updatedMember.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
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

// =================================
// 6. DOSYALAR (FILES) - GÜNCELLENDİ
// =================================

router.get('/:id/files', auth, checkProjectMember, async (req, res) => {
  try {
    const f = await db.query('SELECT pf.*, u.username as uploader_name FROM project_files pf JOIN users u ON pf.uploader_id = u.id WHERE pf.project_id = $1 ORDER BY pf.created_at DESC', [req.projectId]);
    res.json(f.rows);
  } catch (err) { res.status(500).send('Server Error'); }
});

// DOSYA YÜKLEME (500 Hatası çözümü burada)
router.post('/:id/files', auth, checkProjectMember, upload.single('file'), async (req, res) => {
  // 1. Yetki Kontrolü
  if (req.memberRole !== 'owner' && req.memberRole !== 'editor') {
      return res.status(403).json({ message: 'Denied' });
  }
  
  // 2. Dosya Kontrolü
  if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
  }
  
  try {
    const cleanPath = req.file.path.replace(/\\/g, '/');
    
    // --- DÜZELTME 1: Dosya boyutunu (size) değişkene alıyoruz ---
    const fileSize = req.file.size; 

    // Veritabanına Kayıt
    // --- DÜZELTME 2: VALUES kısmına $6 eklendi (file_size için) ---
    const nf = await db.query(
      `INSERT INTO project_files 
       (project_id, uploader_id, filename, file_path, file_type, file_size) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`, 
      [
        req.projectId || req.params.id, // Middleware req.projectId atamıyorsa req.params.id kullanılır
        req.user.id, 
        req.file.originalname, 
        cleanPath, 
        req.file.mimetype, 
        fileSize // Burası düzeltildi (eskiden 'size' yazıyordu ve tanımsızdı)
      ]
    );
    
    // Kullanıcı adını çekip cevaba ekle
    const u = await db.query('SELECT username FROM users WHERE id=$1', [req.user.id]);
    const r = nf.rows[0];
    
    if (u.rows.length > 0) {
        r.uploader_name = u.rows[0].username;
    } else {
        r.uploader_name = 'Unknown';
    }
    
    res.status(201).json(r);

  } catch (err) { 
    console.error("BACKEND HATASI (Dosya Yükleme):", err);
    res.status(500).json({ 
        message: 'Sunucu Hatası: ' + err.message,
        detail: err.detail 
    }); 
  }
});

router.delete('/:id/files/:fileId', auth, checkProjectMember, async (req, res) => {
  if(req.memberRole!=='owner' && req.memberRole!=='editor') return res.status(403).json({message:'Denied'});
  try {
    await db.query('DELETE FROM project_files WHERE id=$1', [req.params.fileId]);
    res.json({message:'Deleted'});
  } catch (err) { res.status(500).send('Server Error'); }
});

// =================================
// 7. ADMIN VE KULLANICILAR
// =================================

router.get('/admin/all-projects', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }

  try {
    const result = await db.query(`
      SELECT 
        p.id, 
        p.name, 
        p.description,
        p.created_at,
        p.is_public,
        p.last_updated_at,
        u.username as owner_name,
        (
            SELECT COALESCE(SUM(file_size), 0) 
            FROM project_files 
            WHERE project_id = p.id
        ) as total_size
      FROM projects p 
      LEFT JOIN users u ON p.owner_id = u.id 
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get('/users', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const result = await db.query(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error("User list error:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;