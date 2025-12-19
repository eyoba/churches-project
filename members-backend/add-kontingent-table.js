const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addKontingentTable() {
  try {
    console.log('Adding kontingent_payments table...\n');

    // Create kontingent_payments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kontingent_payments (
        id SERIAL PRIMARY KEY,
        member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        payment_month VARCHAR(7) NOT NULL,
        paid BOOLEAN DEFAULT false,
        payment_date DATE,
        amount DECIMAL(10,2),
        notes TEXT,
        recorded_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(member_id, payment_month)
      )
    `);
    console.log('✅ Created kontingent_payments table');

    // Create index for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_kontingent_member_month
      ON kontingent_payments(member_id, payment_month)
    `);
    console.log('✅ Created index on kontingent_payments');

    // Create index for payment_month queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_kontingent_month
      ON kontingent_payments(payment_month)
    `);
    console.log('✅ Created index on payment_month');

    console.log('\n✅ Kontingent table setup complete!');

  } catch (error) {
    console.error('❌ Error adding kontingent table:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

addKontingentTable()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
