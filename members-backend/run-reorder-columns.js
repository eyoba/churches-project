// Script to reorder columns in members table
const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function reorderColumns() {
  const client = new Client({ connectionString });

  try {
    console.log('🔗 Connecting to Azure PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    console.log('📋 Reordering columns in members table...');
    console.log('This will create a new table with the correct order and copy all data.\n');

    // Start transaction
    await client.query('BEGIN');

    // Step 1: Rename old table
    await client.query('ALTER TABLE members RENAME TO members_old');
    console.log('✓ Renamed old table to members_old');

    // Step 2: Create new table with correct column order
    await client.query(`
      CREATE TABLE members (
        -- Primary Key
        id SERIAL PRIMARY KEY,

        -- Personal Information (from form)
        full_name VARCHAR(200) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        personnummer VARCHAR(11) NOT NULL,

        -- Address (from form)
        address TEXT,
        postal_code VARCHAR(10),
        city VARCHAR(100),

        -- Member Information (from form)
        member_since DATE,
        baptized BOOLEAN DEFAULT false,
        baptism_date DATE,
        sms_consent BOOLEAN DEFAULT true,
        notes TEXT,

        -- System fields (not in form, but essential)
        consent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(100),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by VARCHAR(100)
      )
    `);
    console.log('✓ Created new table with correct column order');

    // Step 3: Copy data from old table to new table
    await client.query(`
      INSERT INTO members (
        id, full_name, phone_number, email, personnummer,
        address, postal_code, city,
        member_since, baptized, baptism_date, sms_consent, notes,
        consent_date, is_active, created_at, created_by, updated_at, updated_by
      )
      SELECT
        id, full_name, phone_number, email, personnummer,
        address, postal_code, city,
        member_since, baptized, baptism_date, sms_consent, notes,
        consent_date, is_active, created_at, created_by, updated_at, updated_by
      FROM members_old
    `);
    console.log('✓ Copied all data to new table');

    // Step 4: Reset the sequence for id column
    await client.query(`SELECT setval('members_id_seq', (SELECT MAX(id) FROM members))`);
    console.log('✓ Reset ID sequence');

    // Step 5: Drop old table
    await client.query('DROP TABLE members_old');
    console.log('✓ Dropped old table');

    // Step 6: Recreate indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone_number)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_members_active ON members(is_active)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_members_name ON members(full_name)');
    console.log('✓ Recreated indexes');

    // Commit transaction
    await client.query('COMMIT');
    console.log('\n✅ Transaction committed successfully!\n');

    // Show final structure
    console.log('📋 Final table structure:');
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'members'
      ORDER BY ordinal_position
    `);

    columns.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.column_name} (${row.data_type})`);
    });

    // Verify data
    const count = await client.query('SELECT COUNT(*) FROM members');
    console.log(`\n📊 Total members in table: ${count.rows[0].count}`);

    console.log('\n✅ Column reordering completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    console.error('   Transaction rolled back. No changes were made.');
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

reorderColumns();
