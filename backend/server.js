const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Helper function to get base URL (works for both local and Azure deployment)
const getBaseUrl = (req) => {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL; // Use env variable if set (for Azure)
  }
  // Fallback to request host for local development
  const protocol = req.protocol || 'http';
  const host = req.get('host') || `localhost:${port}`;
  return `${protocol}://${host}`;
};

// Middleware
app.use(cors({
  origin: [process.env.WEBSITE_URL, process.env.SMS_APP_URL],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Serve static files from uploads directory (with absolute path)
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Database connection pool with proper configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Always use SSL for Azure PostgreSQL
  // Connection pool settings to handle idle connections
  max: 20, // Maximum number of clients in the pool
  min: 4, // Minimum number of clients in the pool (increased to keep more connections alive)
  idleTimeoutMillis: 60000, // Close idle clients after 60 seconds (increased from 30s)
  connectionTimeoutMillis: 15000, // Return an error after 15 seconds (increased from 10s for Azure)
  // Keep connections alive to prevent Azure from closing them
  keepAlive: true,
  keepAliveInitialDelayMillis: 5000, // Start keepalive earlier (reduced from 10s to 5s)
  // Add statement timeout to prevent hanging queries
  statement_timeout: 30000 // Kill queries that take longer than 30 seconds
});

// Handle pool errors to prevent app crashes
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit - let the connection pool handle reconnection
});

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully at', res.rows[0].now);
  }
});

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ============================================
// BIRD.COM (NEW MESSAGEBIRD) SMS CONFIGURATION
// ============================================
const BIRD_CONFIG = {
  api_url: 'https://api.bird.com',
  api_key: process.env.BIRD_API_KEY,
  workspace_id: process.env.BIRD_WORKSPACE_ID,
  channel_id: process.env.BIRD_CHANNEL_ID,
  sender: process.env.BIRD_SENDER || 'DEBREIYESUS'
};

// Check Bird configuration
let birdConfigured = false;
if (process.env.BIRD_API_KEY && process.env.BIRD_WORKSPACE_ID && process.env.BIRD_CHANNEL_ID) {
  birdConfigured = true;
  console.log('✅ Bird.com SMS configured');
  console.log(`📤 Workspace: ${BIRD_CONFIG.workspace_id}`);
  console.log(`📤 Channel ID: ${BIRD_CONFIG.channel_id}`);
  console.log(`📤 SMS Sender ID: ${BIRD_CONFIG.sender}`);
} else {
  console.log('⚠️  Bird.com not configured - SMS features will be disabled');
  console.log('   To enable SMS: Configure BIRD_API_KEY, BIRD_WORKSPACE_ID, BIRD_CHANNEL_ID, and BIRD_SENDER in .env');
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

const authenticateSuperAdmin = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    if (!decoded.is_super_admin) return res.status(403).json({ error: 'Super admin access required' });
    req.superAdmin = decoded; // Contains super_admin_id and is_super_admin flag
    next();
  });
};

// ============================================
// PUBLIC ROUTES - Church Website
// ============================================

// Get all active churches
app.get('/api/churches', async (req, res) => {
  const startTime = Date.now();
  try {
    console.log('📍 GET /api/churches - Fetching churches...');
    const result = await pool.query(
      'SELECT id, name, slug, address, phone, email, pastor_name, description, logo_url, field_labels, display_order, facebook FROM churches WHERE is_active = true ORDER BY display_order ASC, name ASC'
    );
    const duration = Date.now() - startTime;
    console.log(`✅ Churches fetched: ${result.rows.length} churches in ${duration}ms`);
    res.json(result.rows);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Error fetching churches after ${duration}ms:`, error.message);
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
      WHERE c.slug = $1 AND e.event_date >= NOW() AND e.is_published = true
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
      WHERE c.slug = $1 AND p.is_published = true
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
// SUPER ADMIN AUTH & ROUTES
// ============================================

// Super Admin Login
app.post('/api/super-admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM super_admins WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const superAdmin = result.rows[0];
    const validPassword = await bcrypt.compare(password, superAdmin.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { super_admin_id: superAdmin.id, is_super_admin: true },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      superAdmin: {
        id: superAdmin.id,
        username: superAdmin.username,
        full_name: superAdmin.full_name,
        email: superAdmin.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get site settings (Public)
app.get('/api/site-settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT setting_key, setting_value FROM site_settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update site settings (Super Admin)
app.put('/api/super-admin/site-settings', authenticateSuperAdmin, async (req, res) => {
  try {
    const { setting_key, setting_value } = req.body;

    const result = await pool.query(`
      INSERT INTO site_settings (setting_key, setting_value, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (setting_key)
      DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [setting_key, setting_value]);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload logo file (Super Admin)
app.post('/api/super-admin/upload-logo', authenticateSuperAdmin, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fs = require('fs');
    const path = require('path');

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save file to disk
    const fileName = `logo-${Date.now()}${path.extname(req.file.originalname)}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, req.file.buffer);

    // Generate URL for the uploaded file
    const logoUrl = `${getBaseUrl(req)}/uploads/${fileName}`;

    // Update site settings with new logo URL
    await pool.query(`
      INSERT INTO site_settings (setting_key, setting_value, updated_at)
      VALUES ('site_logo_url', $1, CURRENT_TIMESTAMP)
      ON CONFLICT (setting_key)
      DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
    `, [logoUrl]);

    res.json({
      url: logoUrl,
      message: 'Logo uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all churches (Super Admin)
app.get('/api/super-admin/churches', authenticateSuperAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM church_admins WHERE church_id = c.id) as admin_count,
        (SELECT COUNT(*) FROM church_news WHERE church_id = c.id) as news_count
      FROM churches c
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single church details (Super Admin)
app.get('/api/super-admin/churches/:id', authenticateSuperAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM churches WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Church not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new church (Super Admin)
app.post('/api/super-admin/churches', authenticateSuperAdmin, async (req, res) => {
  try {
    const {
      name,
      slug,
      address,
      phone,
      email,
      pastor_name,
      pastor_title,
      description,
      logo_url,
      website,
      service_times,
      is_active,
      background_color
    } = req.body;

    // Check if slug already exists
    const existingChurch = await pool.query('SELECT id FROM churches WHERE slug = $1', [slug]);
    if (existingChurch.rows.length > 0) {
      return res.status(400).json({ error: 'Church slug already exists' });
    }

    const result = await pool.query(`
      INSERT INTO churches (
        name, slug, address, phone, email, pastor_name, pastor_title,
        description, logo_url, website, sunday_service_time, is_active, background_color
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [name, slug, address, phone, email, pastor_name, pastor_title, description, logo_url, website, service_times, is_active !== false, background_color || '#3b82f6']);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update church (Super Admin)
app.put('/api/super-admin/churches/:id', authenticateSuperAdmin, async (req, res) => {
  try {
    const {
      name,
      slug,
      address,
      phone,
      email,
      pastor_name,
      pastor_title,
      description,
      logo_url,
      website,
      service_times,
      is_active,
      background_color
    } = req.body;

    // Check if new slug conflicts with another church
    const existingChurch = await pool.query(
      'SELECT id FROM churches WHERE slug = $1 AND id != $2',
      [slug, req.params.id]
    );
    if (existingChurch.rows.length > 0) {
      return res.status(400).json({ error: 'Church slug already exists' });
    }

    const result = await pool.query(`
      UPDATE churches SET
        name = $1,
        slug = $2,
        address = $3,
        phone = $4,
        email = $5,
        pastor_name = $6,
        pastor_title = $7,
        description = $8,
        logo_url = $9,
        website = $10,
        sunday_service_time = $11,
        is_active = $12,
        background_color = $13,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
    `, [name, slug, address, phone, email, pastor_name, pastor_title, description, logo_url, website, service_times, is_active, background_color, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Church not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete church (Super Admin)
app.delete('/api/super-admin/churches/:id', authenticateSuperAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM churches WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Church not found' });
    }
    res.json({ message: 'Church deleted successfully', church: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get church admins for a specific church (Super Admin)
app.get('/api/super-admin/churches/:id/admins', authenticateSuperAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, full_name, email, is_active, created_at FROM church_admins WHERE church_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create church admin (Super Admin)
app.post('/api/super-admin/churches/:id/admins', authenticateSuperAdmin, async (req, res) => {
  try {
    const { username, password, full_name, email } = req.body;
    const churchId = req.params.id;

    // Check if username exists
    const existingAdmin = await pool.query('SELECT id FROM church_admins WHERE username = $1', [username]);
    if (existingAdmin.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(`
      INSERT INTO church_admins (church_id, username, password_hash, full_name, email, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id, username, full_name, email, is_active, created_at
    `, [churchId, username, passwordHash, full_name, email]);

    res.status(201).json(result.rows[0]);
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
      pool.query('SELECT COUNT(*) FROM members WHERE is_active = true'),
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
      name, address, phone, email, website, logo_url,
      pastor_name, pastor_phone, pastor_email, pastor_bio,
      sunday_service_time, wednesday_service_time, other_service_times,
      description, mission_statement, field_labels, display_order, facebook, background_color
    } = req.body;

    console.log('Received background_color from client:', background_color);
    console.log('Full req.body:', req.body);

    const result = await pool.query(`
      UPDATE churches SET
        name = $1, address = $2, phone = $3, email = $4, website = $5, logo_url = $6,
        pastor_name = $7, pastor_phone = $8, pastor_email = $9, pastor_bio = $10,
        sunday_service_time = $11, wednesday_service_time = $12, other_service_times = $13,
        description = $14, mission_statement = $15, field_labels = $16, display_order = $17,
        facebook = $18, background_color = $19, updated_at = NOW()
      WHERE id = $20
      RETURNING *
    `, [name, address, phone, email, website, logo_url, pastor_name, pastor_phone, pastor_email,
        pastor_bio, sunday_service_time, wednesday_service_time, other_service_times,
        description, mission_statement, field_labels ? JSON.stringify(field_labels) : null,
        display_order || 0, facebook, background_color || '#3b82f6', church_id]);

    console.log('Updated church background_color in DB:', result.rows[0].background_color);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload church logo
app.post('/api/admin/upload-church-logo', authenticateChurchAdmin, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fs = require('fs');
    const path = require('path');

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save file to disk
    const fileName = `church-logo-${req.admin.church_id}-${Date.now()}${path.extname(req.file.originalname)}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, req.file.buffer);

    // Generate URL for the uploaded file
    const logoUrl = `${getBaseUrl(req)}/uploads/${fileName}`;

    res.json({
      url: logoUrl,
      message: 'Logo uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading church logo:', error);
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
    const { title, description, event_date, end_date, location, is_recurring, recurrence_pattern, is_published } = req.body;
    const result = await pool.query(`
      INSERT INTO church_events (church_id, title, description, event_date, end_date, location, is_recurring, recurrence_pattern, created_by, is_published)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [req.admin.church_id, title, description, event_date, end_date, location, is_recurring, recurrence_pattern, req.admin.admin_id, is_published]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/church-admin/events/:id', authenticateChurchAdmin, async (req, res) => {
  try {
    const { title, description, event_date, end_date, location, is_recurring, recurrence_pattern, is_published } = req.body;
    const result = await pool.query(`
      UPDATE church_events SET
        title = $1, description = $2, event_date = $3, end_date = $4,
        location = $5, is_recurring = $6, recurrence_pattern = $7, is_published = $8
      WHERE id = $9 AND church_id = $10
      RETURNING *
    `, [title, description, event_date, end_date, location, is_recurring, recurrence_pattern, is_published, req.params.id, req.admin.church_id]);
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
    const { title, description, photo_url, image_base64, caption, is_published } = req.body;

    let imageUrl;
    let thumbnailUrl;

    // Check if photo_url is provided (URL-based upload)
    if (photo_url) {
      // Use the provided URL directly
      imageUrl = photo_url;
      thumbnailUrl = photo_url;
    }
    // Check if image_base64 is provided (file upload)
    else if (image_base64) {
      // Check if Cloudinary is configured
      const cloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
                                    process.env.CLOUDINARY_API_KEY &&
                                    process.env.CLOUDINARY_API_SECRET &&
                                    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

      if (!cloudinaryConfigured) {
        return res.status(500).json({
          error: 'Cloudinary is not configured. Please set up Cloudinary credentials in the .env file or use URL upload instead.'
        });
      }

      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(image_base64, {
        folder: `churches/${req.admin.church_id}`,
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      imageUrl = uploadResult.secure_url;
      thumbnailUrl = uploadResult.secure_url;
    }
    else {
      return res.status(400).json({ error: 'Either photo_url or image_base64 must be provided' });
    }

    // Use caption if provided, otherwise use description (for backward compatibility)
    const finalCaption = caption || description || title;

    // Save to database
    const result = await pool.query(`
      INSERT INTO church_photos (church_id, title, description, image_url, thumbnail_url, uploaded_by, is_published)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [req.admin.church_id, title, finalCaption, imageUrl, thumbnailUrl, req.admin.admin_id, is_published]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload photo using FormData (like logo upload - no Cloudinary needed)
app.post('/api/admin/upload-gallery-photo', authenticateChurchAdmin, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fs = require('fs');
    const path = require('path');

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save file to disk
    const fileName = `church-photo-${req.admin.church_id}-${Date.now()}${path.extname(req.file.originalname)}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, req.file.buffer);

    // Generate URL for the uploaded file
    const photoUrl = `${getBaseUrl(req)}/uploads/${fileName}`;

    // Get additional data from request body
    const { caption, is_published } = req.body;
    const title = caption || fileName;

    // Save to database
    const result = await pool.query(`
      INSERT INTO church_photos (church_id, title, description, image_url, thumbnail_url, uploaded_by, is_published)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [req.admin.church_id, title, caption || '', photoUrl, photoUrl, req.admin.admin_id, is_published === 'true' || is_published === true]);

    res.json({
      photo: result.rows[0],
      message: 'Photo uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading gallery photo:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/church-admin/photos/:id', authenticateChurchAdmin, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');

    // Get photo to delete
    const photo = await pool.query(
      'SELECT image_url FROM church_photos WHERE id = $1 AND church_id = $2',
      [req.params.id, req.admin.church_id]
    );

    if (photo.rows.length > 0) {
      const imageUrl = photo.rows[0].image_url;

      // Check if it's a local file (starts with http://localhost)
      if (imageUrl.includes('localhost') && imageUrl.includes('/uploads/')) {
        // Extract filename from URL and delete local file
        const filename = imageUrl.split('/uploads/')[1];
        const filePath = path.join(__dirname, 'public', 'uploads', filename);

        // Delete file if it exists
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      // If it's a Cloudinary URL, try to delete from Cloudinary (only if configured)
      else if (imageUrl.includes('cloudinary')) {
        const cloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
                                      process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';
        if (cloudinaryConfigured) {
          const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }
      }
      // Otherwise it's an external URL - just delete from database
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

    if (!member_ids || member_ids.length === 0) {
      return res.status(400).json({ error: 'No recipients selected' });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!birdConfigured) {
      return res.status(503).json({ error: 'SMS service not configured' });
    }

    // Get members (verify they belong to this church)
    const result = await pool.query(
      'SELECT id, phone, name FROM members WHERE id = ANY($1) AND church_id = $2 AND is_active = true',
      [member_ids, req.admin.church_id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'No valid members selected' });
    }

    const recipients = result.rows;

    // Format phone numbers for Bird API (remove + and spaces)
    const phoneNumbers = recipients.map(r =>
      r.phone.replace(/\+/g, '').replace(/\s/g, '')
    );

    console.log(`\n📤 Sending SMS to ${recipients.length} members via Bird.com...`);
    console.log(`📝 Workspace: ${BIRD_CONFIG.workspace_id}`);
    console.log(`📝 Sender: ${BIRD_CONFIG.sender}\n`);

    // Send SMS via Bird.com API
    try {
      // Format contacts for Bird API
      const contacts = phoneNumbers.map(phone => ({
        identifierKey: 'phonenumber',
        identifierValue: phone
      }));

      const requestBody = {
        receiver: {
          contacts: contacts
        },
        body: {
          type: 'text',
          text: {
            text: message
          }
        }
      };

      console.log('📤 Bird.com request:', JSON.stringify(requestBody, null, 2));

      const response = await axios.post(
        `${BIRD_CONFIG.api_url}/workspaces/${BIRD_CONFIG.workspace_id}/channels/${BIRD_CONFIG.channel_id}/messages`,
        requestBody,
        {
          headers: {
            'Authorization': `AccessKey ${BIRD_CONFIG.api_key}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Calculate cost (€0.016 per SMS = ~0.18 NOK per SMS)
      const cost_eur = recipients.length * 0.016;
      const cost_nok = cost_eur * 11.5;

      console.log(`✅ SMS sent to ${recipients.length} members!`);
      console.log(`💰 Cost: €${cost_eur.toFixed(2)} (${cost_nok.toFixed(2)} NOK)`);
      console.log(`📊 Message ID: ${response.data.id}\n`);

      // Log SMS
      await pool.query(`
        INSERT INTO sms_logs (church_id, sent_by, message, recipient_count, recipients, status, cost)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [req.admin.church_id, req.admin.admin_id, message, recipients.length, phoneNumbers, 'sent', cost_nok]);

      res.json({
        success: true,
        message: `SMS sent from "${BIRD_CONFIG.sender}" to ${recipients.length} members!`,
        sent: recipients.length,
        failed: 0,
        cost: `${cost_nok.toFixed(2)} NOK`,
        sender: BIRD_CONFIG.sender,
        message_id: response.data.id
      });

    } catch (birdError) {
      console.error('❌ Bird.com API Error:');
      console.error('Status:', birdError.response?.status);
      console.error('Data:', birdError.response?.data);
      console.error('Message:', birdError.message);

      // Log failed attempt
      await pool.query(`
        INSERT INTO sms_logs (church_id, sent_by, message, recipient_count, recipients, status, cost)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [req.admin.church_id, req.admin.admin_id, message, recipients.length, phoneNumbers, 'failed', 0]);

      // Better error messages
      let errorMessage = 'SMS sending failed';
      if (birdError.response?.data?.message) {
        errorMessage = `Bird API: ${birdError.response.data.message}`;
      } else if (birdError.response?.data?.error) {
        errorMessage = `Bird API: ${birdError.response.data.error}`;
      } else if (birdError.message) {
        errorMessage = `SMS sending failed: ${birdError.message}`;
      }

      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('SMS send error:', error);
    res.status(500).json({ error: error.message || 'Failed to send SMS' });
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