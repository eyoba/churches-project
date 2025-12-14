const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixLogoUrls() {
  try {
    console.log('Fixing logo URLs in database...');

    // Update all logo URLs from port 5180 to 3001
    const result = await pool.query(`
      UPDATE churches
      SET logo_url = REPLACE(logo_url, 'http://localhost:5180', 'http://localhost:3001')
      WHERE logo_url LIKE 'http://localhost:5180%'
      RETURNING id, name, logo_url;
    `);

    console.log(`✓ Updated ${result.rowCount} churches`);
    console.log('\nUpdated churches:');
    result.rows.forEach(row => {
      console.log(`  - ${row.name}`);
      console.log(`    New URL: ${row.logo_url}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixLogoUrls();
