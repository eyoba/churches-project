const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addMemberNumberColumn() {
  try {
    console.log('Adding member_number column to members table...\n');

    // Add member_number column
    await pool.query(`
      ALTER TABLE members
      ADD COLUMN IF NOT EXISTS member_number VARCHAR(50) UNIQUE
    `);
    console.log('✅ Added member_number column');

    // Create index for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_members_member_number
      ON members(member_number)
    `);
    console.log('✅ Created index on member_number');

    console.log('\n✅ Member number column setup complete!');

  } catch (error) {
    console.error('❌ Error adding member_number column:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

addMemberNumberColumn()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
