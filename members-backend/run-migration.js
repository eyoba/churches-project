// Script to run the members table migration
const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function runMigration() {
  const client = new Client({ connectionString });

  try {
    console.log('🔗 Connecting to Azure PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Step 1: Show current columns
    console.log('📋 Current table structure:');
    const currentColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'members'
      ORDER BY ordinal_position
    `);
    console.log('Columns:', currentColumns.rows.map(r => r.column_name).join(', '));
    console.log('Total columns:', currentColumns.rows.length);
    console.log();

    // Step 2: Drop unused columns
    console.log('🗑️  Removing unused columns...');

    const columnsToRemove = ['church_id', 'phone', 'date_of_birth', 'name', 'family_id'];

    for (const column of columnsToRemove) {
      try {
        await client.query(`ALTER TABLE members DROP COLUMN IF EXISTS ${column}`);
        console.log(`   ✓ Removed: ${column}`);
      } catch (err) {
        console.log(`   ⚠ Could not remove ${column}: ${err.message}`);
      }
    }
    console.log();

    // Step 3: Show updated columns
    console.log('📋 Updated table structure:');
    const updatedColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'members'
      ORDER BY ordinal_position
    `);

    console.log('Remaining columns:');
    updatedColumns.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });
    console.log();

    // Step 4: Count records
    console.log('📊 Database statistics:');
    const totalCount = await client.query('SELECT COUNT(*) FROM members');
    const activeCount = await client.query('SELECT COUNT(*) FROM members WHERE is_active = true');
    console.log(`   Total members: ${totalCount.rows[0].count}`);
    console.log(`   Active members: ${activeCount.rows[0].count}`);
    console.log();

    console.log('✅ Migration completed successfully!');
    console.log();
    console.log('Expected columns (matching Add Member form):');
    console.log('   - id, full_name, phone_number, email, personnummer');
    console.log('   - address, postal_code, city');
    console.log('   - member_since, baptized, baptism_date, sms_consent, notes');
    console.log('   - consent_date, is_active, created_at, created_by, updated_at, updated_by');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

runMigration();
