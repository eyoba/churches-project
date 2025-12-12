const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [process.env.WEBSITE_URL, process.env.SMS_APP_URL],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Twilio (optional - only initialize if credentials are provided)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ============================================
// AUTH MIDDLEWARE
// ============================================

const authenticateChurchAdmin = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.admin = decoded; // Contains admin_id and church_id
    next();
  });
};

// ============================================
// PUBLIC ROUTES - Church Website
// ============================================

// Get all active churches
app.get('/api/churches', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, slug, address, phone, email, pastor_name, description, logo_url FROM churches WHERE is_active = true ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single church by slug
app.get('/api/churches/:slug', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM churches WHERE slug = $1 AND is_active = true',
      [req.params.slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Church not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get church news (published only)
app.get('/api/churches/:slug/news', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT n.*, c.name as church_name, a.full_name as author_name
      FROM church_news n
      JOIN churches c ON n.church_id = c.id
      LEFT JOIN church_admins a ON n.author_id = a.id
      WHERE c.slug = $1 AND n.is_published = true
      ORDER BY n.published_date DESC
      LIMIT 10
    `, [req.params.slug]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get church events (upcoming)
app.get('/api/churches/:slug/events', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, c.name as church_name
      FROM church_events e
      JOIN churches c ON e.church_id = c.id
      WHERE c.slug = $1 AND e.event_date >= NOW()
      ORDER BY e.event_date ASC
    `, [req.params.slug]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get church photos
app.get('/api/churches/:slug/photos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*
      FROM church_photos p
      JOIN churches c ON p.church_id = c.id
      WHERE c.slug = $1
      ORDER BY p.display_order, p.created_at DESC
      LIMIT 50
    `, [req.params.slug]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CHURCH ADMIN AUTH
// ============================================

app.post('/api/church-admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM church_admins WHERE username = $1 AND is_active = true',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const admin = result.rows[0];
    const validPassword = await bcrypt.compare(password, admin.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { admin_id: admin.id, church_id: admin.church_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        full_name: admin.full_name,
        church_id: admin.church_id
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CHURCH ADMIN ROUTES (Protected)
// ============================================

// Get church dashboard stats
app.get('/api/church-admin/dashboard', authenticateChurchAdmin, async (req, res) => {
  try {
    const { church_id } = req.admin;
    
    const [church, newsCount, eventsCount, membersCount, photosCount] = await Promise.all([
      pool.query('SELECT * FROM churches WHERE id = $1', [church_id]),
      pool.query('SELECT COUNT(*) FROM church_news WHERE church_id = $1', [church_id]),
      pool.query('SELECT COUNT(*) FROM church_events WHERE church_id = $1 AND event_date >= NOW()', [church_id]),
      pool.query('SELECT COUNT(*) FROM members WHERE church_id = $1 AND is_active = true', [church_id]),
      pool.query('SELECT COUNT(*) FROM church_photos WHERE church_id = $1', [church_id])
    ]);
    
    res.json({
      church: church.rows[0],
      stats: {
        news: parseInt(newsCount.rows[0].count),
        upcoming_events: parseInt(eventsCount.rows[0].count),
        members: parseInt(membersCount.rows[0].count),
        photos: parseInt(photosCount.rows[0].count)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update church basic info
app.put('/api/church-admin/church-info', authenticateChurchAdmin, async (req, res) => {
  try {
    const { church_id } = req.admin;
    const {
      name, address, phone, email, website,
      pastor_name, pastor_phone, pastor_email, pastor_bio,
      sunday_service_time, wednesday_service_time, other_service_times,
      description, mission_statement
    } = req.body;
    
    const result = await pool.query(`
      UPDATE churches SET
        name = $1, address = $2, phone = $3, email = $4, website = $5,
        pastor_name = $6, pastor_phone = $7, pastor_email = $8, pastor_bio = $9,
        sunday_service_time = $10, wednesday_service_time = $11, other_service_times = $12,
        description = $13, mission_statement = $14,
        updated_at = NOW()
      WHERE id = $15
      RETURNING *
    `, [name, address, phone, email, website, pastor_name, pastor_phone, pastor_email,
        pastor_bio, sunday_service_time, wednesday_service_time, other_service_times,
        description, mission_statement, church_id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NEWS MANAGEMENT

// Get all news for church admin
app.get('/api/church-admin/news', authenticateChurchAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM church_news WHERE church_id = $1 ORDER BY created_at DESC',
      [req.admin.church_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create news
app.post('/api/church-admin/news', authenticateChurchAdmin, async (req, res) => {
  try {
    const { title, content, is_published } = req.body;
    const result = await pool.query(`
      INSERT INTO church_news (church_id, title, content, author_id, is_published, published_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [req.admin.church_id, title, content, req.admin.admin_id, is_published, 
        is_published ? new Date() : null]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update news
app.put('/api/church-admin/news/:id', authenticateChurchAdmin, async (req, res) => {
  try {
    const { title, content, is_published } = req.body;
    const result = await pool.query(`
      UPDATE church_news SET
        title = $1, content = $2, is_published = $3,
        published_date = CASE WHEN $3 = true AND published_date IS NULL THEN NOW() ELSE published_date END,
        updated_at = NOW()
      WHERE id = $4 AND church_id = $5
      RETURNING *
    `, [title, content, is_published, req.params.id, req.admin.church_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete news
app.delete('/api/church-admin/news/:id', authenticateChurchAdmin, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM church_news WHERE id = $1 AND church_id = $2',
      [req.params.id, req.admin.church_id]
    );
    res.json({ message: 'News deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// EVENTS MANAGEMENT

app.get('/api/church-admin/events', authenticateChurchAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM church_events WHERE church_id = $1 ORDER BY event_date DESC',
      [req.admin.church_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/church-admin/events', authenticateChurchAdmin, async (req, res) => {
  try {
    const { title, description, event_date, end_date, location, is_recurring, recurrence_pattern } = req.body;
    const result = await pool.query(`
      INSERT INTO church_events (church_id, title, description, event_date, end_date, location, is_recurring, recurrence_pattern, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [req.admin.church_id, title, description, event_date, end_date, location, is_recurring, recurrence_pattern, req.admin.admin_id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/church-admin/events/:id', authenticateChurchAdmin, async (req, res) => {
  try {
    const { title, description, event_date, end_date, location, is_recurring, recurrence_pattern } = req.body;
    const result = await pool.query(`
      UPDATE church_events SET
        title = $1, description = $2, event_date = $3, end_date = $4,
        location = $5, is_recurring = $6, recurrence_pattern = $7
      WHERE id = $8 AND church_id = $9
      RETURNING *
    `, [title, description, event_date, end_date, location, is_recurring, recurrence_pattern, req.params.id, req.admin.church_id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/church-admin/events/:id', authenticateChurchAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM church_events WHERE id = $1 AND church_id = $2', 
      [req.params.id, req.admin.church_id]);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PHOTO GALLERY MANAGEMENT

app.get('/api/church-admin/photos', authenticateChurchAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM church_photos WHERE church_id = $1 ORDER BY display_order, created_at DESC',
      [req.admin.church_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload photo (base64)
app.post('/api/church-admin/photos', authenticateChurchAdmin, async (req, res) => {
  try {
    const { title, description, image_base64 } = req.body;
    
    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(image_base64, {
      folder: `churches/${req.admin.church_id}`,
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    
    // Save to database
    const result = await pool.query(`
      INSERT INTO church_photos (church_id, title, description, image_url, thumbnail_url, uploaded_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [req.admin.church_id, title, description, uploadResult.secure_url, 
        uploadResult.secure_url, req.admin.admin_id]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/church-admin/photos/:id', authenticateChurchAdmin, async (req, res) => {
  try {
    // Get photo to delete from Cloudinary
    const photo = await pool.query(
      'SELECT image_url FROM church_photos WHERE id = $1 AND church_id = $2',
      [req.params.id, req.admin.church_id]
    );
    
    if (photo.rows.length > 0) {
      // Extract public_id from URL and delete from Cloudinary
      const publicId = photo.rows[0].image_url.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }
    
    // Delete from database
    await pool.query('DELETE FROM church_photos WHERE id = $1 AND church_id = $2',
      [req.params.id, req.admin.church_id]);
    
    res.json({ message: 'Photo deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SMS APP ROUTES (Church-specific)
// ============================================

// Get members for this church only
app.get('/api/sms/members', authenticateChurchAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM members WHERE church_id = $1 AND is_active = true ORDER BY name',
      [req.admin.church_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add member
app.post('/api/sms/members', authenticateChurchAdmin, async (req, res) => {
  try {
    const { name, phone, email, address, date_of_birth, notes } = req.body;
    const result = await pool.query(`
      INSERT INTO members (church_id, name, phone, email, address, date_of_birth, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [req.admin.church_id, name, phone, email, address, date_of_birth, notes]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update member
app.put('/api/sms/members/:id', authenticateChurchAdmin, async (req, res) => {
  try {
    const { name, phone, email, address, date_of_birth, notes } = req.body;
    const result = await pool.query(`
      UPDATE members SET
        name = $1, phone = $2, email = $3, address = $4,
        date_of_birth = $5, notes = $6, updated_at = NOW()
      WHERE id = $7 AND church_id = $8
      RETURNING *
    `, [name, phone, email, address, date_of_birth, notes, req.params.id, req.admin.church_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete member
app.delete('/api/sms/members/:id', authenticateChurchAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM members WHERE id = $1 AND church_id = $2',
      [req.params.id, req.admin.church_id]);
    res.json({ message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send SMS (only to church's members)
app.post('/api/sms/send', authenticateChurchAdmin, async (req, res) => {
  try {
    const { member_ids, message } = req.body;
    
    // Get members (verify they belong to this church)
    const result = await pool.query(
      'SELECT phone, name FROM members WHERE id = ANY($1) AND church_id = $2 AND is_active = true',
      [member_ids, req.admin.church_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'No valid members selected' });
    }
    
    const recipients = result.rows;
    const phoneNumbers = recipients.map(r => r.phone);
    const successfulSends = [];
    const failedSends = [];

    // Check if Twilio is configured
    if (!twilioClient) {
      return res.status(400).json({
        error: 'SMS service not configured. Please add Twilio credentials to .env file.'
      });
    }

    // Send SMS
    for (const recipient of recipients) {
      try {
        const smsResult = await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: recipient.phone
        });
        successfulSends.push({ name: recipient.name, phone: recipient.phone, status: smsResult.status });
      } catch (smsError) {
        failedSends.push({ name: recipient.name, phone: recipient.phone, error: smsError.message });
      }
    }
    
    // Log SMS
    const cost = successfulSends.length * 0.0075;
    await pool.query(`
      INSERT INTO sms_logs (church_id, sent_by, message, recipient_count, recipients, status, cost)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [req.admin.church_id, req.admin.admin_id, message, successfulSends.length, phoneNumbers, 'sent', cost]);
    
    res.json({
      success: true,
      sent: successfulSends.length,
      failed: failedSends.length,
      cost: `$${cost.toFixed(4)}`,
      details: { successful: successfulSends, failed: failedSends }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get SMS logs (church-specific)
app.get('/api/sms/logs', authenticateChurchAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sl.*, ca.full_name as sent_by_name
      FROM sms_logs sl
      LEFT JOIN church_admins ca ON sl.sent_by = ca.id
      WHERE sl.church_id = $1
      ORDER BY sl.sent_at DESC
      LIMIT 50
    `, [req.admin.church_id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// START SERVER
// ============================================

app.listen(port, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Multi-Church System Backend              ║
║   ✅ Running on port ${port}                ║
║   📡 API: http://localhost:${port}/api     ║
╚════════════════════════════════════════════╝
  `);
});