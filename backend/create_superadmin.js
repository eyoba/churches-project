const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createSuperAdmin() {
  try {
    console.log('Connecting to Azure database...');

    // Create super_admins table if it doesn't exist
    console.log('Creating super_admins table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS super_admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Table created successfully');

    // Generate password hash for "superadmin123"
    console.log('Generating password hash...');
    const passwordHash = await bcrypt.hash('superadmin123', 10);
    console.log('✓ Password hash generated');

    // Insert super admin account (or update if exists)
    console.log('Inserting super admin account...');
    await pool.query(`
      INSERT INTO super_admins (username, password_hash, full_name, email)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username)
      DO UPDATE SET password_hash = $2, full_name = $3, email = $4;
    `, ['superadmin', passwordHash, 'Super Administrator', 'superadmin@church.local']);

    console.log('✓ Super admin account created successfully!');
    console.log('\n===========================================');
    console.log('Super Admin Credentials:');
    console.log('Username: superadmin');
    console.log('Password: superadmin123');
    console.log('Login URL: http://localhost:5178/super-admin/login');
    console.log('===========================================\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

createSuperAdmin();
