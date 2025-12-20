const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addSuperAdminRole() {
  console.log('🚀 Adding super_admin role to members_admins table...\n');

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database\n');

    // Add is_super_admin column if it doesn't exist
    await pool.query(`
      ALTER TABLE members_admins
      ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false
    `);
    console.log('✅ Added is_super_admin column\n');

    // Make the existing admin a super admin
    const result = await pool.query(`
      UPDATE members_admins
      SET is_super_admin = true
      WHERE username = 'admin'
      RETURNING id, username, full_name, is_super_admin
    `);

    if (result.rows.length > 0) {
      console.log('✅ Updated existing admin to super admin:');
      console.log(`   Username: ${result.rows[0].username}`);
      console.log(`   Name: ${result.rows[0].full_name}`);
      console.log(`   Super Admin: ${result.rows[0].is_super_admin}`);
    }

    console.log('\n✅ Super admin role setup complete!');
    console.log('   You can now manage admins from the Members Dashboard\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  } finally {
    await pool.end();
  }
}

addSuperAdminRole();
