const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5178',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Database Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Connected to PostgreSQL database');
  }
});

// MessageBird Configuration
const MESSAGEBIRD_CONFIG = {
  api_url: 'https://rest.messagebird.com/messages',
  api_key: process.env.MESSAGEBIRD_API_KEY,
  sender: process.env.MESSAGEBIRD_SENDER || 'DEBREIYESUS'
};

// Check MessageBird configuration
let messageBirdConfigured = false;
if (process.env.MESSAGEBIRD_API_KEY) {
  messageBirdConfigured = true;
  console.log('✅ MessageBird configured');
  console.log(`📤 SMS Sender ID: ${MESSAGEBIRD_CONFIG.sender}`);
} else {
  console.log('⚠️  MessageBird not configured - SMS features will be disabled');
  console.log('   To enable SMS: Configure MESSAGEBIRD_API_KEY and MESSAGEBIRD_SENDER in .env');
}

// JWT Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Audit Logging Function
async function logAudit(userId, action, tableName, recordId, oldValues, newValues, ipAddress) {
  try {
    await pool.query(`
      INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [userId, action, tableName, recordId, JSON.stringify(oldValues), JSON.stringify(newValues), ipAddress]);
  } catch (err) {
    console.error('Audit logging error:', err);
  }
}

// ======================
// AUTH ROUTES
// ======================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM members_admins WHERE username = $1 AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ======================
// MEMBERS ROUTES
// ======================

// Get all members
app.get('/api/members', authenticateToken, async (req, res) => {
  try {
    const { search, active } = req.query;

    let query = 'SELECT * FROM members WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (active !== undefined) {
      query += ` AND is_active = $${paramCount}`;
      params.push(active === 'true');
      paramCount++;
    }

    if (search) {
      query += ` AND (full_name ILIKE $${paramCount} OR phone_number ILIKE $${paramCount} OR personnummer ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY full_name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get members error:', err);
    res.status(500).json({ error: 'Failed to retrieve members' });
  }
});

// Get single member
app.get('/api/members/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM members WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get member error:', err);
    res.status(500).json({ error: 'Failed to retrieve member' });
  }
});

// Create member
app.post('/api/members', authenticateToken, async (req, res) => {
  try {
    const {
      full_name, phone_number, email, personnummer,
      address, postal_code, city, member_since,
      baptized, baptism_date, sms_consent, notes
    } = req.body;

    // Validate personnummer (11 digits)
    if (!/^\d{11}$/.test(personnummer)) {
      return res.status(400).json({ error: 'Personnummer must be 11 digits' });
    }

    // Check for duplicate
    const duplicateCheck = await pool.query(
      'SELECT id FROM members WHERE phone_number = $1',
      [phone_number]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Member with this phone number already exists' });
    }

    const result = await pool.query(`
      INSERT INTO members (
        full_name, phone_number, email, personnummer,
        address, postal_code, city, member_since,
        baptized, baptism_date, sms_consent, notes,
        created_by, updated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)
      RETURNING id
    `, [
      full_name, phone_number, email || null, personnummer,
      address || null, postal_code || null, city || null, member_since || null,
      baptized || false, baptism_date || null, sms_consent !== undefined ? sms_consent : true,
      notes || null, req.user.username
    ]);

    const newId = result.rows[0].id;

    await logAudit(
      req.user.username,
      'CREATE',
      'members',
      newId,
      null,
      req.body,
      req.ip
    );

    res.status(201).json({ id: newId, message: 'Member created successfully' });
  } catch (err) {
    console.error('Create member error:', err);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// Update member
app.put('/api/members/:id', authenticateToken, async (req, res) => {
  try {
    const memberId = req.params.id;

    // Get old values for audit
    const oldResult = await pool.query(
      'SELECT * FROM members WHERE id = $1',
      [memberId]
    );

    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const {
      full_name, phone_number, email, personnummer,
      address, postal_code, city, member_since,
      baptized, baptism_date, sms_consent, is_active, notes
    } = req.body;

    await pool.query(`
      UPDATE members SET
        full_name = $1,
        phone_number = $2,
        email = $3,
        personnummer = $4,
        address = $5,
        postal_code = $6,
        city = $7,
        member_since = $8,
        baptized = $9,
        baptism_date = $10,
        sms_consent = $11,
        is_active = $12,
        notes = $13,
        updated_by = $14,
        updated_at = NOW()
      WHERE id = $15
    `, [
      full_name, phone_number, email || null, personnummer,
      address || null, postal_code || null, city || null, member_since || null,
      baptized || false, baptism_date || null, sms_consent !== undefined ? sms_consent : true,
      is_active !== undefined ? is_active : true, notes || null,
      req.user.username, memberId
    ]);

    await logAudit(
      req.user.username,
      'UPDATE',
      'members',
      memberId,
      oldResult.rows[0],
      req.body,
      req.ip
    );

    res.json({ message: 'Member updated successfully' });
  } catch (err) {
    console.error('Update member error:', err);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// Delete member (soft delete)
app.delete('/api/members/:id', authenticateToken, async (req, res) => {
  try {
    const memberId = req.params.id;

    await pool.query(`
      UPDATE members SET
        is_active = false,
        updated_by = $1,
        updated_at = NOW()
      WHERE id = $2
    `, [req.user.username, memberId]);

    await logAudit(
      req.user.username,
      'DELETE',
      'members',
      memberId,
      null,
      { is_active: false },
      req.ip
    );

    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    console.error('Delete member error:', err);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// ======================
// SMS ROUTES
// ======================

// Send SMS
app.post('/api/sms/send', authenticateToken, async (req, res) => {
  try {
    const { member_ids, message } = req.body;

    if (!member_ids || member_ids.length === 0) {
      return res.status(400).json({ error: 'No recipients selected' });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!messageBirdConfigured) {
      return res.status(503).json({ error: 'SMS service not configured' });
    }

    // Get members with SMS consent (support both old and new column names)
    const placeholders = member_ids.map((_, i) => `$${i + 1}`).join(',');
    const result = await pool.query(`
      SELECT id,
             COALESCE(full_name, name) as full_name,
             COALESCE(phone_number, phone) as phone_number
      FROM members
      WHERE id IN (${placeholders})
      AND sms_consent = true
      AND is_active = true
    `, member_ids);

    const recipients = result.rows;

    if (recipients.length === 0) {
      return res.status(400).json({ error: 'No eligible recipients found' });
    }

    // Format phone numbers (remove + and spaces)
    const phoneNumbers = recipients.map(r =>
      r.phone_number.replace(/\+/g, '').replace(/\s/g, '')
    );

    console.log(`\n📤 Sender SMS til ${recipients.length} medlemmer...`);
    console.log(`📝 Fra: ${MESSAGEBIRD_CONFIG.sender}\n`);

    // Send SMS via MessageBird API
    try {
      const response = await axios.post(
        MESSAGEBIRD_CONFIG.api_url,
        {
          originator: MESSAGEBIRD_CONFIG.sender,
          recipients: phoneNumbers,
          body: message
        },
        {
          headers: {
            'Authorization': `AccessKey ${MESSAGEBIRD_CONFIG.api_key}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Calculate cost (€0.016 per SMS = ~0.18 NOK per SMS)
      const cost_eur = recipients.length * 0.016;
      const cost_nok = cost_eur * 11.5;

      console.log(`✅ SMS sendt!`);
      console.log(`💰 Kostnad: €${cost_eur.toFixed(2)} (${cost_nok.toFixed(2)} NOK)`);
      console.log(`📊 Message ID: ${response.data.id}\n`);

      // Create SMS log entry
      const logResult = await pool.query(`
        INSERT INTO sms_logs (message, recipient_count, sent_by, cost_estimate)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [message, recipients.length, req.user.username, cost_nok]);

      const smsLogId = logResult.rows[0].id;

      // Log each recipient
      for (const recipient of recipients) {
        await pool.query(`
          INSERT INTO sms_recipients (sms_log_id, member_id, phone_number, status, twilio_sid)
          VALUES ($1, $2, $3, $4, $5)
        `, [smsLogId, recipient.id, recipient.phone_number, 'sent', response.data.id]);
      }

      res.json({
        message: `SMS sendt fra "${MESSAGEBIRD_CONFIG.sender}" til ${recipients.length} medlemmer!`,
        sent: recipients.length,
        failed: 0,
        cost: `${cost_nok.toFixed(2)} NOK`,
        sender: MESSAGEBIRD_CONFIG.sender,
        message_id: response.data.id
      });

    } catch (messageBirdError) {
      console.error('❌ MessageBird Error:', messageBirdError.response?.data || messageBirdError.message);

      // Log failed attempt
      const logResult = await pool.query(`
        INSERT INTO sms_logs (message, recipient_count, sent_by, cost_estimate)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [message, recipients.length, req.user.username, 0]);

      const smsLogId = logResult.rows[0].id;

      // Log all recipients as failed
      for (const recipient of recipients) {
        await pool.query(`
          INSERT INTO sms_recipients (sms_log_id, member_id, phone_number, status)
          VALUES ($1, $2, $3, $4)
        `, [smsLogId, recipient.id, recipient.phone_number, 'failed']);
      }

      throw new Error('SMS sending failed: ' + (messageBirdError.response?.data?.errors?.[0]?.description || messageBirdError.message));
    }

  } catch (err) {
    console.error('SMS send error:', err);
    res.status(500).json({ error: err.message || 'Failed to send SMS' });
  }
});

// Get SMS logs
app.get('/api/sms/logs', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT
        sl.*,
        json_agg(
          json_build_object(
            'id', sr.id,
            'full_name', COALESCE(m.full_name, m.name),
            'phone_number', sr.phone_number,
            'status', sr.status,
            'twilio_sid', sr.twilio_sid
          )
        ) FILTER (WHERE sr.id IS NOT NULL) as recipients
      FROM sms_logs sl
      LEFT JOIN sms_recipients sr ON sr.sms_log_id = sl.id
      LEFT JOIN members m ON sr.member_id = m.id
      GROUP BY sl.id
      ORDER BY sl.sent_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json(result.rows);
  } catch (err) {
    console.error('Get SMS logs error:', err);
    res.status(500).json({ error: 'Failed to retrieve SMS logs' });
  }
});

// Get SMS statistics
app.get('/api/sms/stats', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(SUM(recipient_count), 0)::integer as total_sent,
        COALESCE(SUM(CASE WHEN sent_at >= date_trunc('month', CURRENT_DATE) THEN recipient_count ELSE 0 END), 0)::integer as this_month,
        COALESCE(SUM(cost_estimate), 0) as total_cost
      FROM sms_logs
    `);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get SMS stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Members Management API',
    sms_provider: 'MessageBird',
    sms_enabled: messageBirdConfigured
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Members API server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🔐 JWT authentication enabled`);
});
