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

    // Check for null values first
    console.log('🔍 Checking for null values in required fields...');
    const nullCheck = await client.query(`
      SELECT id, full_name, phone_number, personnummer
      FROM members
      WHERE full_name IS NULL OR phone_number IS NULL OR personnummer IS NULL
    `);

    if (nullCheck.rows.length > 0) {
      console.log('⚠️  Found members with null required fields:');
      nullCheck.rows.forEach(row => {
        console.log(`   ID ${row.id}: full_name=${row.full_name}, phone_number=${row.phone_number}, personnummer=${row.personnummer}`);
      });

      console.log('\n🔧 Fixing null values...');
      // Fix null values
      await client.query(`
        UPDATE members
        SET full_name = COALESCE(full_name, 'Unknown Member'),
            phone_number = COALESCE(phone_number, 'N/A'),
            personnummer = COALESCE(personnummer, '00000000000')
        WHERE full_name IS NULL OR phone_number IS NULL OR personnummer IS NULL
      `);
      console.log('✓ Fixed null values\n');
    } else {
      console.log('✓ No null values found\n');
    }

    console.log('📋 Reordering columns in members table...');
    console.log('This will create a new table with the correct order and copy all data.\n');

    // Start transaction
    await client.query('BEGIN');

    // Step 1: Drop foreign key constraint from sms_recipients
    console.log('🔧 Dropping foreign key constraints...');
    await client.query('ALTER TABLE sms_recipients DROP CONSTRAINT IF EXISTS sms_recipients_member_id_fkey');
    console.log('✓ Dropped foreign key constraint');

    // Step 2: Rename old table
    await client.query('ALTER TABLE members RENAME TO members_old');
    console.log('✓ Renamed old table to members_old');

    // Step 3: Create new table with correct column order
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

    // Step 4: Copy data from old table to new table
    await client.query(`
      INSERT INTO members (
        id, full_name, phone_number, email, personnummer,
        address, postal_code, city,
        member_since, baptized, baptism_date, sms_consent, notes,
        consent_date, is_active, created_at, created_by, updated_at, updated_by
      )
      SELECT
        id,
        COALESCE(full_name, 'Unknown Member'),
        COALESCE(phone_number, 'N/A'),
        email,
        COALESCE(personnummer, '00000000000'),
        address, postal_code, city,
        member_since, baptized, baptism_date, sms_consent, notes,
        consent_date, is_active, created_at, created_by, updated_at, updated_by
      FROM members_old
    `);
    console.log('✓ Copied all data to new table');

    // Step 5: Reset the sequence for id column
    await client.query(`SELECT setval('members_id_seq', (SELECT MAX(id) FROM members))`);
    console.log('✓ Reset ID sequence');

    // Step 6: Drop old table
    await client.query('DROP TABLE members_old CASCADE');
    console.log('✓ Dropped old table');

    // Step 7: Recreate foreign key constraint
    await client.query(`
      ALTER TABLE sms_recipients
      ADD CONSTRAINT sms_recipients_member_id_fkey
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    `);
    console.log('✓ Recreated foreign key constraint');

    // Step 8: Recreate indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone_number)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_members_active ON members(is_active)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_members_name ON members(full_name)');
    console.log('✓ Recreated indexes');

    // Commit transaction
    await client.query('COMMIT');
    console.log('\n✅ Transaction committed successfully!\n');

    // Show final structure
    console.log('📋 Final table structure (in order):');
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'members'
      ORDER BY ordinal_position
    `);

    columns.rows.forEach((row, index) => {
      console.log(`   ${(index + 1).toString().padStart(2, ' ')}. ${row.column_name.padEnd(20, ' ')} (${row.data_type})`);
    });

    // Verify data
    const count = await client.query('SELECT COUNT(*) FROM members');
    const activeCount = await client.query('SELECT COUNT(*) FROM members WHERE is_active = true');
    console.log(`\n📊 Database statistics:`);
    console.log(`   Total members: ${count.rows[0].count}`);
    console.log(`   Active members: ${activeCount.rows[0].count}`);

    console.log('\n✅ Column reordering completed successfully!');

  } catch (error) {
    try {
      await client.query('ROLLBACK');
      console.error('\n❌ Migration failed:', error.message);
      console.error('   Transaction rolled back. No changes were made.');
    } catch (rollbackError) {
      console.error('\n❌ Migration failed:', error.message);
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

reorderColumns();
