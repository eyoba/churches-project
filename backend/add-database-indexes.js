const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addIndexes() {
  try {
    console.log('Adding database indexes for better performance...\n');

    // Index on churches table for the WHERE is_active query
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_churches_is_active
      ON churches(is_active)
      WHERE is_active = true;
    `);
    console.log('✅ Created index: idx_churches_is_active');

    // Index on churches table for ORDER BY
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_churches_display_order
      ON churches(display_order, name)
      WHERE is_active = true;
    `);
    console.log('✅ Created index: idx_churches_display_order');

    // Index on churches table for slug lookups (used frequently)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_churches_slug
      ON churches(slug)
      WHERE is_active = true;
    `);
    console.log('✅ Created index: idx_churches_slug');

    // Index on church_news for faster news queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_church_news_published
      ON church_news(church_id, published_date DESC)
      WHERE is_published = true;
    `);
    console.log('✅ Created index: idx_church_news_published');

    // Index on members table for faster SMS queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_members_sms_consent
      ON members(sms_consent, is_active)
      WHERE sms_consent = true AND is_active = true;
    `);
    console.log('✅ Created index: idx_members_sms_consent');

    console.log('\n✅ All indexes created successfully!');
    console.log('Your database queries should now be faster.');

  } catch (error) {
    console.error('❌ Error adding indexes:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

addIndexes()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
