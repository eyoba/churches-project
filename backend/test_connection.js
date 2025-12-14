const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('Testing connection to Azure database...');
    console.log('Database URL:', process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@'));

    // Test basic connection
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Connected successfully!');
    console.log('Server time:', result.rows[0].now);

    // Check for super_admins table
    console.log('\n--- Checking super_admins table ---');
    const superAdmins = await pool.query('SELECT id, username, full_name FROM super_admins');
    console.log('Super admins found:', superAdmins.rows.length);
    console.log(superAdmins.rows);

    // Check for churches
    console.log('\n--- Checking churches table ---');
    const churches = await pool.query('SELECT id, name, slug, is_active FROM churches ORDER BY id');
    console.log('Churches found:', churches.rows.length);
    console.log(churches.rows);

    // Check for church admins
    console.log('\n--- Checking church_admins table ---');
    const admins = await pool.query('SELECT id, church_id, username, full_name, is_active FROM church_admins ORDER BY id');
    console.log('Church admins found:', admins.rows.length);
    console.log(admins.rows);

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

testConnection();
