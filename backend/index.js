const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());


app.get('/', (req,res) => res.send('Backend çalışıyor!adss'));

app.get('/dbtest', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(5000, () => console.log('Server 5000 portunda'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor.`));


// English: simple Express backend for task creation and basic CRUD.
// Türkçe: görev oluşturma ve temel CRUD işlemleri için basit Express backend.

// --- imports / require ---
// English: load required modules
// Türkçe: gerekli modülleri yükle
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config(); // English: load .env  // Türkçe: .env dosyasını oku

// --- app setup ---
// English: create express app and middleware
// Türkçe: express uygulaması ve ara katmanlar
const app = express();
app.use(cors()); // English: allow cross-origin (dev).  // Türkçe: geliştirme için CORS izinleri.
app.use(bodyParser.json()); // English: parse JSON bodies.  // Türkçe: JSON gövdelerini ayrıştır.

// --- database pool ---
// English: create a connection pool to PostgreSQL
// Türkçe: PostgreSQL bağlantı havuzu oluştur
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/projecthub'
});

// --- helper: basic input sanitizer (very small) ---
// English: small helper to trim strings & avoid null confusion
// Türkçe: stringleri trimlemek için küçük yardımcı
function normalizeString(s) {
  if (s === undefined || s === null) return null;
  if (typeof s === 'string') {
    const t = s.trim();
    return t.length === 0 ? null : t;
  }
  return s;
}

// --- Routes ---
// English: Healthcheck route (quick check the server is up).
// Türkçe: Sunucunun çalıştığını kontrol etmek için healthcheck endpoint'i.
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

/*
  English: Create Task endpoint
  Türkçe: Görev oluşturma endpoint'i
  - Expects JSON body with: project_id, title, description, status, priority, assignee_id, due_date, created_by
  - Returns created task row
*/
app.post('/api/tasks', async (req, res) => {
  // English: destructure input
  // Türkçe: input'u ayır
  try {
    const {
      project_id,
      title,
      description,
      status,
      priority,
      assignee_id,
      due_date,
      created_by
    } = req.body;

    // English: basic validation
    // Türkçe: temel doğrulama
    if (!project_id) return res.status(400).json({ error: 'project_id is required / project_id gerekli' });
    if (!title || (typeof title === 'string' && title.trim().length === 0)) {
      return res.status(400).json({ error: 'title is required / başlık gerekli' });
    }

    // English: normalize values (trim strings)
    // Türkçe: değerleri normalize et (stringleri kırp)
    const nTitle = normalizeString(title);
    const nDescription = normalizeString(description);
    const nStatus = normalizeString(status) || 'todo';
    const nPriority = normalizeString(priority) || 'normal';
    const nAssignee = assignee_id || null;
    const nDueDate = due_date || null;
    const nCreatedBy = created_by || null;

    // English: Insert the task into the DB and return the created row
    // Türkçe: Görevi DB'ye ekle ve oluşan satırı dön
    const q = `
      INSERT INTO tasks (project_id, title, description, status, priority, assignee_id, due_date, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `;
    const values = [project_id, nTitle, nDescription, nStatus, nPriority, nAssignee, nDueDate, nCreatedBy];
    const result = await pool.query(q, values);

    // English: respond with created task (201 Created)
    // Türkçe: oluşturulan görevle cevapla (201 Created)
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    // English: log error on server and return generic message
    // Türkçe: hatayı sunucuda logla ve kullanıcıya genel mesaj dön
    console.error('Error creating task:', err);
    return res.status(500).json({ error: 'Internal server error / Sunucu hatası' });
  }
});

/*
  English: Get tasks with optional filters: project_id, status, assignee_id
  Türkçe: Görevleri al (isteğe bağlı filtreler: project_id, status, assignee_id)
*/
app.get('/api/tasks', async (req, res) => {
  try {
    const { project_id, status, assignee_id } = req.query;

    const conditions = [];
    const values = [];
    let idx = 1;

    // English: add condition if provided
    // Türkçe: varsa koşul ekle
    if (project_id) {
      conditions.push(`project_id = $${idx++}`);
      values.push(project_id);
    }
    if (status) {
      conditions.push(`status = $${idx++}`);
      values.push(status);
    }
    if (assignee_id) {
      conditions.push(`assignee_id = $${idx++}`);
      values.push(assignee_id);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const q = `SELECT * FROM tasks ${where} ORDER BY created_at DESC LIMIT 500`;
    const result = await pool.query(q, values);

    // English: return list of tasks
    // Türkçe: görev listesini dön
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Internal server error / Sunucu hatası' });
  }
});

// English: Get single task by id
// Türkçe: id ile tek bir görevi al
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found / Görev bulunamadı' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting task:', err);
    res.status(500).json({ error: 'Internal server error / Sunucu hatası' });
  }
});

// English: Update task (partial updates allowed)
// Türkçe: Görev güncelleme (kısmi güncellemelere izin verilir)
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // English: allowed fields to update
    // Türkçe: güncellenmesine izin verilen alanlar
    const fields = ['title','description','status','priority','assignee_id','due_date'];
    const sets = [];
    const values = [];
    let idx = 1;

    // English: build dynamic SET clause
    // Türkçe: dinamik SET cümlesi oluştur
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        sets.push(`${f} = $${idx++}`);
        values.push(req.body[f]);
      }
    }
    if (sets.length === 0) return res.status(400).json({ error: 'No updatable fields / Güncellenecek alan yok' });

    values.push(id);
    const q = `UPDATE tasks SET ${sets.join(', ')}, updated_at = now() WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(q, values);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Internal server error / Sunucu hatası' });
  }
});

// English: Delete task
// Türkçe: Görevi sil
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found / Görev bulunamadı' });
    res.json({ deleted: true, id: result.rows[0].id });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Internal server error / Sunucu hatası' });
  }
});

// --- start server ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API listening on ${PORT}`); // English: server started
  console.log(`API listening on ${PORT} - Sunucu başladı`);
});