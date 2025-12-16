const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database\n');

    // Create tables directly
    console.log('📋 Creating database tables...');

    // Create members table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(200) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        personnummer VARCHAR(11) NOT NULL,
        address VARCHAR(500),
        postal_code VARCHAR(10),
        city VARCHAR(100),
        member_since DATE,
        baptized BOOLEAN DEFAULT false,
        baptism_date DATE,
        family_id INTEGER,
        sms_consent BOOLEAN DEFAULT true,
        consent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(100),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by VARCHAR(100)
      )
    `);

    // Create SMS logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sms_logs (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        recipient_count INTEGER NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sent_by VARCHAR(100),
        cost_estimate DECIMAL(10,2)
      )
    `);

    // Create SMS recipients table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sms_recipients (
        id SERIAL PRIMARY KEY,
        sms_log_id INTEGER NOT NULL REFERENCES sms_logs(id) ON DELETE CASCADE,
        member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        phone_number VARCHAR(20) NOT NULL,
        status VARCHAR(50) DEFAULT 'sent',
        twilio_sid VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create audit log table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100),
        action VARCHAR(100),
        table_name VARCHAR(100),
        record_id INTEGER,
        old_values JSONB,
        new_values JSONB,
        ip_address VARCHAR(50),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create admin users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS members_admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(200),
        email VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone_number)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_members_active ON members(is_active)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_members_name ON members(full_name)
    `);

    console.log('✅ Tables created\n');

    // Generate admin user
    console.log('👤 Creating admin user...');
    const username = 'admin';
    const password = 'admin123'; // ENDRE DETTE I PRODUKSJON!
    const fullName = 'System Administrator';
    const email = 'admin@church.no';

    const hash = await bcrypt.hash(password, 10);

    await pool.query(`
      INSERT INTO members_admins (username, password_hash, full_name, email)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username)
      DO UPDATE SET password_hash = $2, full_name = $3, email = $4
    `, [username, hash, fullName, email]);

    console.log('✅ Admin user created');
    console.log('\n=== Login Credentials ===');
    console.log(`Brukernavn: ${username}`);
    console.log(`Passord: ${password}`);
    console.log('========================\n');

    // Check if sample data exists
    const memberCount = await pool.query('SELECT COUNT(*) FROM members');
    console.log(`📊 Current members in database: ${memberCount.rows[0].count}\n`);

    console.log('✅ Database setup complete!');
    console.log('\n🚀 You can now start the server with: npm start');

  } catch (err) {
    console.error('❌ Setup error:', err.message);
    console.error(err);
  } finally {
    await pool.end();
  }
}

setupDatabase();
