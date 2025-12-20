const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SmsClient } = require('@azure/communication-sms');
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

// Azure Communication Services SMS Client (optional - only if configured)
let smsClient = null;
if (process.env.AZURE_COMMUNICATION_CONNECTION_STRING &&
    !process.env.AZURE_COMMUNICATION_CONNECTION_STRING.includes('your_connection_string_here')) {
  try {
    smsClient = new SmsClient(process.env.AZURE_COMMUNICATION_CONNECTION_STRING);
    console.log('✅ Azure Communication Services SMS client initialized');
    console.log(`📱 Alphanumeric Sender ID: ${process.env.AZURE_SMS_SENDER_ID || 'Not configured'}`);
  } catch (err) {
    console.log('⚠️  Azure Communication Services initialization failed:', err.message);
    console.log('⚠️  SMS features will be disabled');
  }
} else {
  console.log('⚠️  Azure Communication Services not configured - SMS features will be disabled');
  console.log('   To enable SMS:');
  console.log('   1. Create a Communication Services resource in Azure Portal');
  console.log('   2. Get the connection string from Keys section');
  console.log('   3. Set AZURE_COMMUNICATION_CONNECTION_STRING in .env');
  console.log('   4. Register alphanumeric sender ID in Azure Portal');
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

// Super Admin Middleware
function requireSuperAdmin(req, res, next) {
  if (!req.user || !req.user.is_super_admin) {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
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
      { id: user.id, username: user.username, is_super_admin: user.is_super_admin || false },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        is_super_admin: user.is_super_admin || false
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ======================
// ADMIN MANAGEMENT ROUTES (Super Admin Only)
// ======================

// Get all admins
app.get('/api/admins', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, full_name, email, is_active, is_super_admin, created_at
      FROM members_admins
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Get admins error:', err);
    res.status(500).json({ error: 'Failed to retrieve admins' });
  }
});

// Create new admin
app.post('/api/admins', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { username, password, full_name, email, is_super_admin } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check for duplicate username
    const duplicateCheck = await pool.query(
      'SELECT id FROM members_admins WHERE username = $1',
      [username]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(`
      INSERT INTO members_admins (username, password_hash, full_name, email, is_super_admin)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, full_name, email, is_active, is_super_admin, created_at
    `, [username, passwordHash, full_name || null, email || null, is_super_admin || false]);

    await logAudit(
      req.user.username,
      'CREATE',
      'members_admins',
      result.rows[0].id,
      null,
      result.rows[0],
      req.ip
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

// Update admin
app.put('/api/admins/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const adminId = req.params.id;
    const { username, full_name, email, is_active, is_super_admin, password } = req.body;

    // Prevent disabling the last super admin
    if (is_super_admin === false) {
      const superAdminCount = await pool.query(
        'SELECT COUNT(*) FROM members_admins WHERE is_super_admin = true AND is_active = true AND id != $1',
        [adminId]
      );

      if (parseInt(superAdminCount.rows[0].count) === 0) {
        return res.status(400).json({ error: 'Cannot remove super admin status from the last super admin' });
      }
    }

    // Get old values
    const oldResult = await pool.query(
      'SELECT * FROM members_admins WHERE id = $1',
      [adminId]
    );

    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    let updateQuery = `
      UPDATE members_admins
      SET username = $1, full_name = $2, email = $3, is_active = $4, is_super_admin = $5
    `;
    let params = [username, full_name || null, email || null, is_active !== undefined ? is_active : true, is_super_admin !== undefined ? is_super_admin : false];

    // Update password if provided
    if (password && password.trim().length > 0) {
      const passwordHash = await bcrypt.hash(password, 10);
      updateQuery += `, password_hash = $${params.length + 1}`;
      params.push(passwordHash);
    }

    updateQuery += ` WHERE id = $${params.length + 1} RETURNING id, username, full_name, email, is_active, is_super_admin, created_at`;
    params.push(adminId);

    const result = await pool.query(updateQuery, params);

    await logAudit(
      req.user.username,
      'UPDATE',
      'members_admins',
      adminId,
      oldResult.rows[0],
      result.rows[0],
      req.ip
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update admin error:', err);
    res.status(500).json({ error: 'Failed to update admin' });
  }
});

// Delete admin (soft delete)
app.delete('/api/admins/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const adminId = req.params.id;

    // Prevent deleting yourself
    if (parseInt(adminId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' });
    }

    // Prevent deleting the last super admin
    const admin = await pool.query(
      'SELECT is_super_admin FROM members_admins WHERE id = $1',
      [adminId]
    );

    if (admin.rows.length > 0 && admin.rows[0].is_super_admin) {
      const superAdminCount = await pool.query(
        'SELECT COUNT(*) FROM members_admins WHERE is_super_admin = true AND is_active = true AND id != $1',
        [adminId]
      );

      if (parseInt(superAdminCount.rows[0].count) === 0) {
        return res.status(400).json({ error: 'Cannot delete the last super admin' });
      }
    }

    await pool.query(`
      UPDATE members_admins
      SET is_active = false
      WHERE id = $1
    `, [adminId]);

    await logAudit(
      req.user.username,
      'DELETE',
      'members_admins',
      adminId,
      null,
      { is_active: false },
      req.ip
    );

    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    console.error('Delete admin error:', err);
    res.status(500).json({ error: 'Failed to delete admin' });
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

    if (!smsClient) {
      return res.status(503).json({ error: 'SMS service not configured' });
    }

    // Get members with SMS consent
    const placeholders = member_ids.map((_, i) => `$${i + 1}`).join(',');
    const result = await pool.query(`
      SELECT id,
             full_name,
             phone_number
      FROM members
      WHERE id IN (${placeholders})
      AND sms_consent = true
      AND is_active = true
    `, member_ids);

    const recipients = result.rows;

    if (recipients.length === 0) {
      return res.status(400).json({ error: 'No eligible recipients found' });
    }

    // Create SMS log entry
    const costPerMessage = parseFloat(process.env.SMS_COST_PER_MESSAGE) || 0.16;
    const logResult = await pool.query(`
      INSERT INTO sms_logs (message, recipient_count, sent_by, cost_estimate)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [message, recipients.length, req.user.username, recipients.length * costPerMessage]);

    const smsLogId = logResult.rows[0].id;

    // Send SMS to each recipient using Azure Communication Services
    const sendPromises = recipients.map(async (recipient) => {
      try {
        // Use alphanumeric sender ID if configured, otherwise use default
        const senderID = process.env.AZURE_SMS_SENDER_ID || 'SMS';

        // Send SMS using Azure Communication Services
        const sendResults = await smsClient.send({
          from: senderID,
          to: [recipient.phone_number],
          message: message
        });

        const result = sendResults[0];

        if (result.successful) {
          console.log(`✅ SMS sendt med Azure (Sender: "${senderID}") til: ${recipient.phone_number}`);
          console.log(`   Message ID: ${result.messageId}`);

          // Log successful recipient
          await pool.query(`
            INSERT INTO sms_recipients (sms_log_id, member_id, phone_number, status, twilio_sid)
            VALUES ($1, $2, $3, $4, $5)
          `, [smsLogId, recipient.id, recipient.phone_number, 'sent', result.messageId]);

          return { success: true, recipient: recipient.full_name, messageId: result.messageId };
        } else {
          throw new Error(result.errorMessage || 'Unknown error');
        }
      } catch (err) {
        console.error(`❌ SMS send error for ${recipient.phone_number}:`, err.message);

        // Log failed recipient
        await pool.query(`
          INSERT INTO sms_recipients (sms_log_id, member_id, phone_number, status)
          VALUES ($1, $2, $3, $4)
        `, [smsLogId, recipient.id, recipient.phone_number, 'failed']);

        return { success: false, recipient: recipient.full_name, error: err.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;

    res.json({
      message: `SMS sent to ${successCount} of ${recipients.length} recipients`,
      sent: successCount,
      failed: recipients.length - successCount,
      details: results
    });
  } catch (err) {
    console.error('SMS send error:', err);
    res.status(500).json({ error: 'Failed to send SMS' });
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
            'full_name', m.full_name,
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

// ======================
// KONTINGENT ROUTES
// ======================

// Get kontingent payments for a specific month
app.get('/api/kontingent/:month', authenticateToken, async (req, res) => {
  try {
    const { month } = req.params; // Format: YYYY-MM

    const result = await pool.query(`
      SELECT
        m.id as member_id,
        m.full_name,
        m.phone_number,
        m.personnummer,
        COALESCE(kp.paid, false) as paid,
        kp.payment_date,
        kp.amount,
        kp.notes,
        kp.recorded_by,
        kp.id as payment_id
      FROM members m
      LEFT JOIN kontingent_payments kp ON kp.member_id = m.id AND kp.payment_month = $1
      WHERE m.is_active = true
      ORDER BY m.full_name ASC
    `, [month]);

    res.json(result.rows);
  } catch (err) {
    console.error('Get kontingent error:', err);
    res.status(500).json({ error: 'Failed to retrieve kontingent data' });
  }
});

// Update kontingent payment status
app.post('/api/kontingent/update', authenticateToken, async (req, res) => {
  try {
    const { memberId, month, paid, amount, notes } = req.body;

    if (!memberId || !month) {
      return res.status(400).json({ error: 'Member ID and month are required' });
    }

    const paymentDate = paid ? new Date().toISOString().split('T')[0] : null;

    const result = await pool.query(`
      INSERT INTO kontingent_payments (member_id, payment_month, paid, payment_date, amount, notes, recorded_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (member_id, payment_month)
      DO UPDATE SET
        paid = $3,
        payment_date = $4,
        amount = $5,
        notes = $6,
        recorded_by = $7,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [memberId, month, paid, paymentDate, amount || null, notes || null, req.user.username]);

    // Log audit
    await logAudit(
      req.user.username,
      paid ? 'MARK_PAID' : 'MARK_UNPAID',
      'kontingent_payments',
      result.rows[0].id,
      null,
      { memberId, month, paid, amount },
      req.ip
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update kontingent error:', err);
    res.status(500).json({ error: 'Failed to update kontingent payment' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Members Management API',
    sms: smsClient ? 'enabled (Azure Communication Services)' : 'disabled'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Members API server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🔐 JWT authentication enabled`);
});
