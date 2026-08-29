require('dotenv').config({ path: './backend/.env' });
const pool = require('../db/pool');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Running notifications migration on Neon DB...');
    
    // Ensure users table has whatsapp_number
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
    `);

    // Run notifications schema
    const sqlPath = path.join(__dirname, '../../sahara_backend (2)/sahara_backend/db/notifications_schema.sql');
    let sql;
    if (fs.existsSync(sqlPath)) {
      sql = fs.readFileSync(sqlPath, 'utf8');
    } else {
      sql = `
        CREATE TABLE IF NOT EXISTS notification_preferences (
            user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            channel_browser     BOOLEAN NOT NULL DEFAULT false,
            channel_whatsapp    BOOLEAN NOT NULL DEFAULT false,
            morning_enabled     BOOLEAN NOT NULL DEFAULT false,
            morning_time        TIME NOT NULL DEFAULT '08:00',
            evening_enabled     BOOLEAN NOT NULL DEFAULT false,
            evening_time        TIME NOT NULL DEFAULT '21:00',
            contextual_enabled  BOOLEAN NOT NULL DEFAULT false,
            timezone            TEXT NOT NULL DEFAULT 'UTC',
            paused_until        TIMESTAMPTZ,
            updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS push_subscriptions (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            endpoint    TEXT UNIQUE NOT NULL,
            p256dh_key  TEXT NOT NULL,
            auth_key    TEXT NOT NULL,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS notification_log (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            channel     TEXT NOT NULL CHECK (channel IN ('browser', 'whatsapp')),
            type        TEXT NOT NULL CHECK (type IN ('morning', 'evening', 'contextual')),
            content     TEXT NOT NULL,
            sent_at     TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_notification_log_user_day
            ON notification_log(user_id, sent_at);
      `;
    }

    await pool.query(sql);
    console.log('✅ Notification tables (notification_preferences, push_subscriptions, notification_log) successfully created in Neon DB.');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

runMigration();
