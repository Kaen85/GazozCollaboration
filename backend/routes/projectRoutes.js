// backend/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Veritabanı bağlantısı


// =================================
// MIDDLEWARE (KAPI BEKÇİSİ)
// =================================
// Bu fonksiyon, :id içeren rotalarda kullanıcının üye olup olmadığını VEYA projenin public olup olmadığını kontrol eder
const checkProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id; // URL'den proje ID'si
    const userId = req.user.id; // authMiddleware'den kullanıcı ID'si

    // 1. Önce projenin 'public' (genel) olup olmadığını kontrol et
    const projectCheck = await db.query(
      'SELECT is_public, owner_id FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const isPublic = projectCheck.rows[0].is_public;
    

    // 2. Kullanıcının o projede kayıtlı rolünü kontrol et
    const memberCheck = await db.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    const memberRole = memberCheck.rows[0]?.role; // 'owner', 'editor', 'viewer' veya 'undefined'

    // === GÜNCELLENMİŞ İZİN MANTIĞI ===
    if (memberRole) {
      // 3. EĞER KULLANICI ÜYE İSE (Zaten 'owner', 'editor' veya 'viewer')
      req.projectId = projectId;
      req.memberRole = memberRole;
      next();
    } else if (isPublic) {
      // 4. EĞER KULLANICI ÜYE DEĞİL, AMA PROJE 'PUBLIC' İSE
      req.projectId = projectId;
      req.memberRole = 'public_viewer'; // Yeni, geçici bir rol
      next();
    } else {
      // 5. EĞER KULLANICI ÜYE DEĞİL VE PROJE ÖZEL İSE
      return res.status(403).json({ message: 'Access Denied: You are not a member of this project.' });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// =================================
// ANA PROJE ROTALARI
// =================================

// @route   POST /api/projects
// @desc    Yeni proje oluştur
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  const ownerId = req.user.id; 

  try {
    await db.query('BEGIN'); 
    const newProjectQuery = `
      INSERT INTO projects (name, description, owner_id)
      VALUES ($1, $2, $3)
      RETURNING * `; 
    const newProject = await db.query(newProjectQuery, [name, description, ownerId]);
    const projectId = newProject.rows[0].id;
    const addMemberQuery = `
      INSERT INTO project_members (project_id, user_id, role)
      VALUES ($1, $2, $3)
    `;
    await db.query(addMemberQuery, [projectId, ownerId, 'owner']);
    await db.query('COMMIT'); 
    res.status(201).json(newProject.rows[0]);
  } catch (err) {
    await db.query('ROLLBACK'); 
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/projects
// @desc    Kullanıcının üye olduğu TÜM projeleri getir (Dashboard için)
router.get('/', async (req, res) => {
  const userId = req.user.id;
  try {
    const projectsQuery = `
      SELECT p.* FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = $1
      ORDER BY p.last_updated_at DESC
    `;
    const projects = await db.query(projectsQuery, [userId]);
    res.json(projects.rows);
  } catch (err) { 
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// @route   GET /api/projects/my-projects
// @desc    Kullanıcının SAHİBİ olduğu projeleri getir
router.get('/my-projects', async (req, res) => {
  const userId = req.user.id;
  try {
    const projectsQuery = `
      SELECT * FROM projects
      WHERE owner_id = $1
      ORDER BY last_updated_at DESC
    `;
    const projects = await db.query(projectsQuery, [userId]);
    res.json(projects.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/projects/shared-projects
// @desc    Kullanıcıya PAYLAŞILAN veya PUBLIC olan projeleri getir
router.get('/shared-projects', async (req, res) => {
  const userId = req.user.id;
  try {
    // 'UNION' komutu kullanarak iki sorgunun sonucunu birleştiriyoruz:
    const projectsQuery = `
      (
        -- 1. BANA ÖZEL PAYLAŞILANLAR (Private)
        -- 'users' tablosundan 'owner_name' (Sahibin Adı) alınır
        SELECT 
          p.id, p.name, p.description, p.owner_id, p.created_at, p.last_updated_at, p.is_public,
          pm.joined_at, -- Paylaşılma tarihi (artık frontend'de kullanılmayacak ama sorguda kalabilir)
          u.username as owner_name -- Sahibin adı (BUNU KULLANACAĞIZ)
        FROM projects p
        JOIN project_members pm ON p.id = pm.project_id
        JOIN users u ON p.owner_id = u.id -- Sahibi bulmak için
        WHERE pm.user_id = $1 AND p.owner_id != $1
      )
      UNION
      (
        -- 2. HERKESE AÇIK OLANLAR (Public)
        -- 'users' tablosundan 'owner_name' (Sahibin Adı) alınır
        SELECT 
          p.id, p.name, p.description, p.owner_id, p.created_at, p.last_updated_at, p.is_public,
          NULL as joined_at,
          u.username as owner_name -- Sahibin adı (BUNU KULLANACAĞIZ)
        FROM projects p
        JOIN users u ON p.owner_id = u.id
        WHERE p.is_public = true AND p.owner_id != $1
      )
      ORDER BY last_updated_at DESC
    `;
    const projects = await db.query(projectsQuery, [userId]);
    res.json(projects.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// @route   GET /api/projects/:id
// @desc    Tek bir projenin detaylarını ID ile getir
router.get('/:id', checkProjectMember, async (req, res) => {
  try {
    const projectResult = await db.query(
      'SELECT * FROM projects WHERE id = $1',
      [req.projectId] 
    );
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const projectData = projectResult.rows[0];
    // Rol bilgisini (owner, viewer, public_viewer) yanıta ekle
    projectData.currentUserRole = req.memberRole;
    res.json(projectData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/projects/:id/visibility
// @desc    Projenin 'is_public' bayrağını değiştir
router.put('/:id/visibility', checkProjectMember, async (req, res) => {
  // Sadece 'owner' (sahip) bu ayarı değiştirebilir
  if (req.memberRole !== 'owner') {
    return res.status(403).json({ message: 'Only the project owner can change visibility.' });
  }
  const { is_public } = req.body;
  if (is_public === undefined) {
    return res.status(400).json({ message: 'is_public field is required.' });
  }
  try {
    const updatedProject = await db.query(
      'UPDATE projects SET is_public = $1 WHERE id = $2 RETURNING *',
      [is_public, req.projectId]
    );
    // Rol bilgisini de ekleyip yolla
    const response = updatedProject.rows[0];
    response.currentUserRole = req.memberRole;
    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// =================================
// ISSUES API ROTALARI
// =================================

// @route   GET /api/projects/:id/issues
// @desc    Bir projeye ait tüm issue'ları getir
router.get('/:id/issues', checkProjectMember, async (req, res) => {
  // 'public_viewer' dahil herkes issue'ları okuyabilir
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
// @desc    Bir projeye yeni issue ekle
router.post('/:id/issues', checkProjectMember, async (req, res) => {
  const { text } = req.body;
  const authorId = req.user.id;
  // 'viewer' VEYA 'public_viewer' (Herkese açık bakanlar) issue ekleyemez
  if (req.memberRole === 'viewer' || req.memberRole === 'public_viewer') {
    return res.status(403).json({ message: 'You do not have permission to add issues.' });
  }
  try {
    const newIssue = await db.query(
      'INSERT INTO project_issues (project_id, created_by_id, text) VALUES ($1, $2, $3) RETURNING *',
      [req.projectId, authorId, text]
    );
    // Yazar adını da ekle
    const result = newIssue.rows[0];
    const author = await db.query('SELECT username FROM users WHERE id = $1', [result.created_by_id]);
    result.created_by_name = author.rows[0].username;
    res.status(201).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/projects/:id/issues/:issueId
// @desc    Bir "Issue"yu güncelle
router.put('/:id/issues/:issueId', checkProjectMember, async (req, res) => {
  // 'owner' veya 'editor' (public_viewer'ı engeller)
  if (req.memberRole !== 'owner' && req.memberRole !== 'editor') {
    return res.status(403).json({ message: 'Only project owners or editors can edit issues.' });
  }
  
  const { issueId } = req.params;
  const { text, status } = req.body; 
  let updateQuery, queryParams;

  if (text !== undefined) {
    updateQuery = 'UPDATE project_issues SET text = $1 WHERE id = $2 RETURNING *';
    queryParams = [text, issueId];
  } else if (status !== undefined) {
    updateQuery = 'UPDATE project_issues SET status = $1 WHERE id = $2 RETURNING *';
    queryParams = [status, issueId];
  } else {
    return res.status(400).json({ message: 'No update field provided (text or status).' });
  }

  try {
    const updatedIssue = await db.query(updateQuery, queryParams);
    if (updatedIssue.rows.length === 0) {
      return res.status(404).json({ message: 'Issue not found.' });
    }
    // Yazar adını da ekle
    const result = updatedIssue.rows[0];
    const author = await db.query('SELECT username FROM users WHERE id = $1', [result.created_by_id]);
    result.created_by_name = author.rows[0].username;
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// =================================
// COMMENTS API ROTALARI
// =================================

// @route   GET /api/projects/:id/comments
// @desc    Bir projeye ait GENEL yorumları getir (Discussions)
router.get('/:id/comments', checkProjectMember, async (req, res) => {
  // 'public_viewer' dahil herkes yorumları okuyabilir
  try {
    const comments = await db.query(
      // 'created_at DESC' (yeni üstte) yerine 'created_at ASC' (eski üstte)
      'SELECT c.*, u.username as author_name, c.likes_user_ids FROM comments c JOIN users u ON c.author_id = u.id WHERE c.project_id = $1 AND c.issue_id IS NULL ORDER BY c.created_at ASC',
      [req.projectId]
    );
    res.json(comments.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/projects/:id/comments
// @desc    Bir projeye GENEL yorum ekle
router.post('/:id/comments', checkProjectMember, async (req, res) => {
  // 'checkProjectMember'dan geçen herkes ('public_viewer' dahil) yorum yapabilir
  const { text } = req.body;
  const authorId = req.user.id; 
  try {
    const newCommentQuery = `
      INSERT INTO comments (project_id, author_id, text) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `; 
    const newComment = await db.query(newCommentQuery, [req.projectId, authorId, text]);
    
    // Yazarın adını ve (boş) beğeni listesini ekle
    const userResult = await db.query('SELECT username FROM users WHERE id = $1', [authorId]);
    const result = newComment.rows[0];
    result.author_name = userResult.rows[0].username; 
    result.likes_user_ids = []; // Yeni yorumun beğeni listesi boş başlar
    
    res.status(201).json(result); // Tam mesajı döndür
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// === ISSUE YORUM ROTALARI ===

// @route   GET /api/projects/:id/issues/:issueId/comments
// @desc    Spesifik bir "Issue"ya ait yorumları getir
router.get('/:id/issues/:issueId/comments', checkProjectMember, async (req, res) => {
  // 'public_viewer' dahil herkes yorumları okuyabilir
  const { issueId } = req.params; 
  try {
    const comments = await db.query(
      'SELECT c.*, u.username as author_name, c.likes_user_ids FROM comments c JOIN users u ON c.author_id = u.id WHERE c.issue_id = $1 ORDER BY c.created_at ASC',
      [issueId]
    );
    res.json(comments.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/projects/:id/issues/:issueId/comments
// @desc    Spesifik bir "Issue"ya yeni yorum ekle
router.post('/:id/issues/:issueId/comments', checkProjectMember, async (req, res) => {
  // 'checkProjectMember'dan geçen herkes ('public_viewer' dahil) yorum yapabilir
  const { issueId } = req.params;
  const { text } = req.body;
  const authorId = req.user.id;

  try {
    // 1. Yorum eklemeden önce Issue'nun durumunu (status) kontrol et
    const issueCheck = await db.query(
      'SELECT status FROM project_issues WHERE id = $1',
      [issueId]
    );

    if (issueCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Issue not found.' });
    }

    // 2. Eğer Issue'nun durumu 'Closed' (Kapalı) ise, hata ver
    if (issueCheck.rows[0].status === 'Closed') {
      return res.status(403).json({ message: 'Cannot comment on a closed issue.' });
    }

    // 3. Issue açıksa, yoruma devam et
    const newCommentQuery = `
      INSERT INTO comments (project_id, issue_id, author_id, text) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    const newComment = await db.query(newCommentQuery, [req.projectId, issueId, authorId, text]);
    
    // Yazarın adını da yanıta ekle
    const userResult = await db.query('SELECT username FROM users WHERE id = $1', [authorId]);
    const result = newComment.rows[0];
    result.author_name = userResult.rows[0].username; 
    
    res.status(201).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// === YENİ YORUM YÖNETİMİ ROTALARI ===

// @route   PUT /api/projects/:id/comments/:commentId
// @desc    Bir yorumu DÜZENLE (Edit)
router.put('/:id/comments/:commentId', checkProjectMember, async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;
  const userId = req.user.id;

  if (!text) {
    return res.status(400).json({ message: 'Text is required.' });
  }

  try {
    let updateQuery;
    let queryParams;

    // Proje Sahibi ('owner') HERKESİN yorumunu düzenleyebilir
    if (req.memberRole === 'owner') {
      updateQuery = 'UPDATE comments SET text = $1 WHERE id = $2 RETURNING *';
      queryParams = [text, commentId];
    } else {
      // Kullanıcılar SADECE KENDİ yorumlarını düzenleyebilir
      updateQuery = 'UPDATE comments SET text = $1 WHERE id = $2 AND author_id = $3 RETURNING *';
      queryParams = [text, commentId, userId];
    }

    const updatedComment = await db.query(updateQuery, queryParams);

    if (updatedComment.rows.length === 0) {
      // Ya yorum bulunamadı ya da kullanıcı bu yorumu düzenlemeye yetkili değil
      return res.status(403).json({ message: 'Comment not found or user not authorized to edit.' });
    }
    
    // Yorumu güncelledikten sonra yazar adını ve beğenileri ekleyip geri gönder
    const result = updatedComment.rows[0];
    const author = await db.query('SELECT username FROM users WHERE id = $1', [result.author_id]);
    result.author_name = author.rows[0].username;

    res.json(result);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/projects/:id/comments/:commentId
// @desc    Bir yorumu SİL (Delete)
router.delete('/:id/comments/:commentId', checkProjectMember, async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    let deleteQuery;
    let queryParams;

    // Proje Sahibi ('owner') HERKESİN yorumunu silebilir
    if (req.memberRole === 'owner') {
      deleteQuery = 'DELETE FROM comments WHERE id = $1 RETURNING *';
      queryParams = [commentId];
    } else {
      // Kullanıcılar SADECE KENDİ yorumlarını silebilir
      deleteQuery = 'DELETE FROM comments WHERE id = $1 AND author_id = $2 RETURNING *';
      queryParams = [commentId, userId];
    }

    const deletedComment = await db.query(deleteQuery, queryParams);

    if (deletedComment.rows.length === 0) {
      return res.status(403).json({ message: 'Comment not found or user not authorized to delete.' });
    }

    res.json({ message: 'Comment deleted' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/projects/:id/comments/:commentId/like
// @desc    Bir yorumu BEĞEN (Like) / BEĞENMEKTEN VAZGEÇ (Unlike)
router.post('/:id/comments/:commentId/like', checkProjectMember, async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id; 

  try {
    const commentCheck = await db.query(
      'SELECT likes_user_ids FROM comments WHERE id = $1',
      [commentId]
    );
    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    const likesArray = commentCheck.rows[0].likes_user_ids || [];
    
    let updatedComment;

    // Kullanıcı bu yorumu daha önce beğenmiş mi?
    if (likesArray.includes(userId)) {
      // EVET -> Beğenmekten vazgeç (ID'yi diziden çıkar)
      updatedComment = await db.query(
        'UPDATE comments SET likes_user_ids = array_remove(likes_user_ids, $1) WHERE id = $2 RETURNING likes_user_ids',
        [userId, commentId]
      );
    } else {
      // HAYIR -> Beğen (ID'yi diziye ekle)
      updatedComment = await db.query(
        'UPDATE comments SET likes_user_ids = array_append(likes_user_ids, $1) WHERE id = $2 RETURNING likes_user_ids',
        [userId, commentId]
      );
    }

    res.json(updatedComment.rows[0]); // Sadece güncel beğeni listesini döndür

  } catch (err) {
    console.error(err.message);
    res.status(5).send('Server Error');
  }
});

// =================================
// MEMBERS API ROTALARI
// =================================

// @route   GET /api/projects/:id/members
// @desc    Bir projenin tüm üyelerini getir
router.get('/:id/members', checkProjectMember, async (req, res) => {
  // 'public_viewer' dahil herkes üyeleri görebilmeli
  try {
    const membersQuery = `
      SELECT u.id, u.username, pm.role 
      FROM project_members pm
      LEFT JOIN users u ON pm.user_id = u.id 
      WHERE pm.project_id = $1
    `;
    const members = await db.query(membersQuery, [req.projectId]);
    res.json(members.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/projects/:id/members
// @desc    Bir projeye (username ile) yeni üye ekle/davet et
router.post('/:id/members', checkProjectMember, async (req, res) => {
  // Sadece 'owner' veya 'editor' rolündekiler üye ekleyebilir
  if (req.memberRole !== 'owner' && req.memberRole !== 'editor') {
    return res.status(403).json({ message: 'Only project owners or editors can add new members.' });
  }

  // 1. Artık 'role' de req.body'den geliyor
  const { username, role } = req.body; 
  if (!username || !role) { // Rolün de gelip gelmediğini kontrol et
    return res.status(400).json({ message: 'Please provide a username and a role.' });
  }

  // 2. Rolü doğrula (Kimse 'owner' rolü atayamaz)
  if (role !== 'editor' && role !== 'viewer') {
    return res.status(400).json({ message: "Invalid role. Must be 'editor' or 'viewer'." });
  }

  let userIdToAdd; 

  try {
    // 3. Kullanıcıyı bul
    const userToAddResult = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userToAddResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    userIdToAdd = userToAddResult.rows[0].id;
    
    // 4. Zaten üye mi kontrol et
    const memberCheck = await db.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [req.projectId, userIdToAdd]
    );
    if (memberCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User is already a member of this project.' });
    }

    // 5. Kullanıcıyı 'role' (rol) değişkeni ile ekle
    const newMemberQuery = `
      INSERT INTO project_members (project_id, user_id, role) 
      VALUES ($1, $2, $3) 
      RETURNING project_id, user_id, role
    `;
    const newMember = await db.query(newMemberQuery, [req.projectId, userIdToAdd, role]); // 'viewer' yerine 'role'
    
    res.status(201).json({ ...newMember.rows[0], username: username });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// === YENİ ROTA: ÜYE ÇIKARMA ===
// @route   DELETE /api/projects/:id/members/:userId
// @desc    Bir üyeyi projeden çıkar
router.delete('/:id/members/:userId', checkProjectMember, async (req, res) => {
  // Sadece 'owner' (sahip) üye çıkarabilir
  if (req.memberRole !== 'owner') {
    return res.status(403).json({ message: 'Only the project owner can remove members.' });
  }

  const { userId: userIdToRemove } = req.params; // Çıkarılacak kullanıcının ID'si
  const ownerId = req.user.id; // İşlemi yapan 'owner'ın ID'si

  // Sahip kendini projeden çıkaramaz (projeyi silmesi gerekir)
  if (userIdToRemove === ownerId) {
    return res.status(400).json({ message: 'Cannot remove the project owner.' });
  }

  try {
    const deleteQuery = `
      DELETE FROM project_members 
      WHERE project_id = $1 AND user_id = $2
      RETURNING *
    `;
    const deletedMember = await db.query(deleteQuery, [req.projectId, userIdToRemove]);

    if (deletedMember.rows.length === 0) {
      return res.status(404).json({ message: 'Member not found in this project.' });
    }

    res.json({ message: 'Member removed successfully' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Router'ı export et
module.exports = router;