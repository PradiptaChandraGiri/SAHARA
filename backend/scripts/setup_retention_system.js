require('dotenv').config({ path: './backend/.env' });
const pool = require('../db/pool');

async function setupRetention() {
  try {
    console.log('Running retention policy migration on Neon DB...');
    
    // Add columns to users table
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS retention_days INTEGER DEFAULT 30,
      ADD COLUMN IF NOT EXISTS retention_extended_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      ADD COLUMN IF NOT EXISTS last_retention_alert_at TIMESTAMP WITH TIME ZONE;
    `);

    // Add expires_at to results table
    await pool.query(`
      ALTER TABLE results 
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
    `);

    // Add expires_at to checkins table
    await pool.query(`
      ALTER TABLE checkins 
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
    `);

    // Populate expires_at on existing records (30 days from creation/submission)
    await pool.query(`
      UPDATE results 
      SET expires_at = created_at + INTERVAL '30 days'
      WHERE expires_at IS NULL;
    `);

    await pool.query(`
      UPDATE checkins 
      SET expires_at = submitted_at + INTERVAL '30 days'
      WHERE expires_at IS NULL;
    `);

    console.log('✅ Retention policy schema successfully created and backfilled.');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

setupRetention();
