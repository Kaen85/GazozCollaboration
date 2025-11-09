  // backend/routes/projectRoutes.js
  const express = require('express');
  const router = express.Router();
  const db = require('../db'); // Veritabanı bağlantısı

  // =================================
  // MIDDLEWARE (KAPI BEKÇİSİ)
  // =================================
  // Bu fonksiyon, :id içeren rotalarda kullanıcının üye olup olmadığını kontrol eder
  const checkProjectMember = async (req, res, next) => {
    try {
      const projectId = req.params.id; // URL'den proje ID'si
      const userId = req.user.id; // authMiddleware'den kullanıcı ID'si

      const memberCheck = await db.query(
        'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, userId]
      );

      if (memberCheck.rows.length === 0) {
        // Üye değilse erişimi engelle
        return res.status(403).json({ message: 'Access Denied: You are not a member of this project.' });
      }

      // Üye ise, rolünü ve proje ID'sini 'req' objesine ekle
      req.projectId = projectId;
      req.memberRole = memberCheck.rows[0].role; // 'owner', 'viewer', vb.
      next(); // Rotanın kendisine devam et

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
    const ownerId = req.user.id; // authMiddleware'den

    try {
      await db.query('BEGIN'); // Transaction başlat

      // 1. Projeyi 'projects' tablosuna ekle
      const newProjectQuery = `
        INSERT INTO projects (name, description, owner_id)
        VALUES ($1, $2, $3)
        RETURNING * `; // Oluşturulan projenin tüm verisini döndür
      const newProject = await db.query(newProjectQuery, [name, description, ownerId]);
      const projectId = newProject.rows[0].id;

      // 2. Proje sahibini 'project_members' tablosuna 'owner' rolüyle ekle
      const addMemberQuery = `
        INSERT INTO project_members (project_id, user_id, role)
        VALUES ($1, $2, $3)
      `;
      await db.query(addMemberQuery, [projectId, ownerId, 'owner']);

      await db.query('COMMIT'); // İşlemi onayla

      res.status(201).json(newProject.rows[0]);

    } catch (err) {
      await db.query('ROLLBACK'); // Hata olursa geri al
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
    // === DÜZELTME BURADA: Eksik parantezler eklendi ===
    } catch (err) { 
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });


  // === YENİ ROTA 1: MY PROJECTS ===
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

  // === YENİ ROTA 2: SHARED PROJECTS ===
  // @route   GET /api/projects/shared-projects
  // @desc    Kullanıcıya PAYLAŞILAN (sahibi olmadığı) projeleri getir
  router.get('/shared-projects', async (req, res) => {
    const userId = req.user.id;
    try {
      const projectsQuery = `
        SELECT p.* FROM projects p
        JOIN project_members pm ON p.id = pm.project_id
        WHERE pm.user_id = $1 AND p.owner_id != $1
        ORDER BY p.last_updated_at DESC
      `;
      // Bu sorgu: Kullanıcının üye olduğu AMA sahibi olmadığı projeleri getirir.
      const projects = await db.query(projectsQuery, [userId]);
      res.json(projects.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });


  // @route   GET /api/projects/:id
  // @desc    Tek bir projenin detaylarını ID ile getir
  // @access  Sadece proje üyeleri (checkProjectMember middleware'i tarafından kontrol edilir)
  router.get('/:id', checkProjectMember, async (req, res) => {
  // ... (Bu rota, 'currentUserRole' eklemesiyle birlikte aynı kalıyor) ...
  try {
    const projectResult = await db.query(
      'SELECT * FROM projects WHERE id = $1',
      [req.projectId]
    );
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    const projectData = projectResult.rows[0];
    projectData.currentUserRole = req.memberRole;
    res.json(projectData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

  // =================================
  // ISSUES API ROTALARI
  // =================================

  // @route   GET /api/projects/:id/issues
  // @desc    Bir projeye ait tüm issue'ları getir
  router.get('/:id/issues', checkProjectMember, async (req, res) => {
    try {
      const issues = await db.query(
        // 'created_by_name' için 'users' tablosuyla JOIN yap
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

    try {
      // Sadece 'owner' (sahip) issue ekleyebilir
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
  // COMMENTS API ROTALARI
  // =================================

  // @route   GET /api/projects/:id/comments
  // @desc    Bir projeye ait tüm yorumları getir
  router.get('/:id/comments', checkProjectMember, async (req, res) => {
    try {
      const comments = await db.query(
        // 'author_name' için 'users' tablosuyla JOIN yap
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
  // @desc    Bir projeye yeni yorum ekle
  router.post('/:id/comments', checkProjectMember, async (req, res) => {
    const { text } = req.body;
    const authorId = req.user.id; // Herhangi bir üye yorum yapabilir

    try {
      const newCommentQuery = `
        INSERT INTO comments (project_id, author_id, text) 
        VALUES ($1, $2, $3) 
        RETURNING id, project_id, author_id, text, created_at
      `;
      const newComment = await db.query(newCommentQuery, [req.projectId, authorId, text]);
      
      // Yazarın adını da yanıta ekle (frontend'de tekrar sorgu atmamak için)
      const userResult = await db.query('SELECT username FROM users WHERE id = $1', [authorId]);
      const result = newComment.rows[0];
      result.author_name = userResult.rows[0].username; 
      
      res.status(201).json(result);

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

  // =================================
  // MEMBERS API ROTALARI
  // =================================

  // @route   GET /api/projects/:id/members
  // @desc    Bir projenin tüm üyelerini getir
  router.get('/:id', checkProjectMember, async (req, res) => {
    try {
      // Güvenlik kontrolü 'checkProjectMember' tarafından zaten yapıldı.
      const projectResult = await db.query(
        'SELECT * FROM projects WHERE id = $1',
        [req.projectId] // req.projectId, middleware'den gelir
      );
      
      if (projectResult.rows.length === 0) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Proje verisini al
      const projectData = projectResult.rows[0];

      // === DÜZELTME BURADA ===
      // Frontend'in kullanıcının rolünü bilmesi için
      // 'req.memberRole' (middleware'den gelen) verisini yanıta ekle
      projectData.currentUserRole = req.memberRole;

      // Hem proje detaylarını hem de kullanıcının rolünü gönder
      res.json(projectData);
  // backend/routes/projectRoutes.js
  const express = require('express');
  const router = express.Router();
  const db = require('../db'); // Veritabanı bağlantısı

  // =================================
  // MIDDLEWARE (KAPI BEKÇİSİ)
  // =================================
  const checkProjectMember = async (req, res, next) => {
    // ... (Bu fonksiyon aynı kalıyor, zaten doğru çalışıyor) ...
    try {
      const projectId = req.params.id;
      const userId = req.user.id;
      const memberCheck = await db.query(
        'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, userId]
      );
      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ message: 'Access Denied: You are not a member of this project.' });
      }
      req.projectId = projectId;
      req.memberRole = memberCheck.rows[0].role;
      next();
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };

  // =================================
  // ANA PROJE ROTALARI
  // =================================

  // ... (POST /, GET /, GET /my-projects, GET /shared-projects rotaları aynı kalıyor) ...

  // @route   GET /api/projects/:id
  // @desc    Tek bir projenin detaylarını ID ile getir
  router.get('/:id', checkProjectMember, async (req, res) => {
    // ... (Bu rota, 'currentUserRole' eklemesiyle birlikte aynı kalıyor) ...
    try {
      const projectResult = await db.query(
        'SELECT * FROM projects WHERE id = $1',
        [req.projectId]
      );
      if (projectResult.rows.length === 0) {
        return res.status(404).json({ message: 'Project not found' });
      }
      const projectData = projectResult.rows[0];
      projectData.currentUserRole = req.memberRole;
      res.json(projectData);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  // ... (ISSUES ve COMMENTS rotaları aynı kalıyor) ...

  // =================================
  // MEMBERS API ROTALARI
  // =================================

  // @route   GET /api/projects/:id/members
  // @desc    Bir projenin tüm üyelerini getir
  // === DÜZELTME BURADA ===
  router.get('/:id/members', checkProjectMember, async (req, res) => {
  try {
    // 'JOIN' (INNER JOIN) yerine 'LEFT JOIN' kullandık.
    // Bu, 'users' tablosunda bir sorun olsa bile
    // 'project_members' tablosundaki kaydı getirmeyi garanti eder.
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

  // ... (POST /:id/members rotası aynı kalıyor) ...


  // Router'ı export et
  module.exports = router;
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  // @route   POST /api/projects/:id/members
  // @desc    Bir projeye (username ile) yeni üye ekle/davet et
  router.post('/:id/members', checkProjectMember, async (req, res) => {
  // ... (Bu rotanın geri kalanı aynı) ...
  // ... (Sadece 'owner' veya 'editor' ekleyebilir) ...
  if (req.memberRole !== 'owner' && req.memberRole !== 'editor') {
    return res.status(403).json({ message: 'Only project owners or editors can add new members.' });
  }

  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Please provide a username to add.' });
  }

  let userIdToAdd; 

  try {
    // 1. Kullanıcıyı bul
    const userToAddResult = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userToAddResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    userIdToAdd = userToAddResult.rows[0].id;
    
    // 2. Zaten üye mi kontrol et
    const memberCheck = await db.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [req.projectId, userIdToAdd]
    );
    if (memberCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User is already a member of this project.' });
    }

    // 3. Kullanıcıyı ekle
    const newMemberQuery = `
      INSERT INTO project_members (project_id, user_id, role) 
      VALUES ($1, $2, $3) 
      RETURNING project_id, user_id, role
    `;
    const newMember = await db.query(newMemberQuery, [req.projectId, userIdToAdd, 'viewer']); 
    
    res.status(201).json({ ...newMember.rows[0], username: username });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


  // Router'ı export et
  module.exports = router;