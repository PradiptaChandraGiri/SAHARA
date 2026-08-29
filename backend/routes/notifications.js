// routes/notifications.js
const express = require("express");
const pool = require("../db/pool");
const { requireAuth } = require("../middleware/auth");
const { sendReminder } = require("../jobs/notificationScheduler");
const { sendBrowserNotification } = require("../services/webpush");
const { sendWhatsAppReminder } = require("../services/whatsappOutbound");

const router = express.Router();

// GET /api/notifications/preferences - loads current settings for Profile page
router.get("/api/notifications/preferences", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  try {
    const userRes = await pool.query(`SELECT whatsapp_number, phone FROM users WHERE id = $1`, [userId]);
    const user = userRes.rows[0] || {};
    const hasWhatsApp = !!(user.whatsapp_number || user.phone);

    const result = await pool.query(
      `SELECT * FROM notification_preferences WHERE user_id = $1`,
      [userId]
    );

    const isPaused = result.rows.length > 0 && result.rows[0].paused_until && new Date(result.rows[0].paused_until) > new Date();

    if (result.rows.length === 0) {
      return res.json({
        channel_browser: false,
        channel_whatsapp: false,
        morning_enabled: false,
        morning_time: "08:00",
        evening_enabled: false,
        evening_time: "21:00",
        contextual_enabled: false,
        timezone: "UTC",
        is_paused: false,
        paused_until: null,
        has_whatsapp: hasWhatsApp,
        whatsapp_number: user.whatsapp_number || user.phone || null,
        vapid_public_key: process.env.VAPID_PUBLIC_KEY || "",
      });
    }

    const row = result.rows[0];
    res.json({
      ...row,
      morning_time: row.morning_time ? String(row.morning_time).slice(0, 5) : "08:00",
      evening_time: row.evening_time ? String(row.evening_time).slice(0, 5) : "21:00",
      is_paused: isPaused,
      has_whatsapp: hasWhatsApp,
      whatsapp_number: user.whatsapp_number || user.phone || null,
      vapid_public_key: process.env.VAPID_PUBLIC_KEY || "",
    });
  } catch (err) {
    console.error("Error fetching notification preferences:", err);
    res.status(500).json({ error: "Could not fetch notification preferences." });
  }
});

// PUT /api/notifications/preferences - saves changes from the preference center
router.put("/api/notifications/preferences", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const {
    channel_browser,
    channel_whatsapp,
    morning_enabled,
    morning_time,
    evening_enabled,
    evening_time,
    contextual_enabled,
    timezone,
    whatsapp_number,
  } = req.body;

  try {
    if (whatsapp_number !== undefined) {
      await pool.query(`UPDATE users SET whatsapp_number = $1 WHERE id = $2`, [whatsapp_number, userId]);
    }

    await pool.query(
      `INSERT INTO notification_preferences
         (user_id, channel_browser, channel_whatsapp, morning_enabled, morning_time,
          evening_enabled, evening_time, contextual_enabled, timezone, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now())
       ON CONFLICT (user_id) DO UPDATE SET
         channel_browser = $2, channel_whatsapp = $3, morning_enabled = $4,
         morning_time = $5, evening_enabled = $6, evening_time = $7,
         contextual_enabled = $8, timezone = $9, updated_at = now()`,
      [
        userId,
        !!channel_browser,
        !!channel_whatsapp,
        !!morning_enabled,
        morning_time || "08:00",
        !!evening_enabled,
        evening_time || "21:00",
        !!contextual_enabled,
        timezone || "UTC",
      ]
    );

    res.json({ ok: true, message: "Notification preferences saved." });
  } catch (err) {
    console.error("Error saving notification preferences:", err);
    res.status(500).json({ error: "Failed to save preferences." });
  }
});

// POST /api/notifications/pause - "snooze all" for N days, no guilt-tripping
router.post("/api/notifications/pause", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { days, resume } = req.body;

  try {
    if (resume || days === 0) {
      await pool.query(
        `UPDATE notification_preferences SET paused_until = NULL WHERE user_id = $1`,
        [userId]
      );
      return res.json({ ok: true, is_paused: false, message: "Reminders resumed." });
    }

    const durationDays = Number(days) || 7;
    await pool.query(
      `UPDATE notification_preferences 
       SET paused_until = now() + ($2 || ' days')::interval, updated_at = now()
       WHERE user_id = $1`,
      [userId, durationDays]
    );

    const updated = await pool.query(
      `SELECT paused_until FROM notification_preferences WHERE user_id = $1`,
      [userId]
    );

    res.json({
      ok: true,
      is_paused: true,
      paused_until: updated.rows[0]?.paused_until,
      message: `Reminders paused for ${durationDays} days.`,
    });
  } catch (err) {
    console.error("Error pausing notifications:", err);
    res.status(500).json({ error: "Failed to pause notifications." });
  }
});

// POST /api/notifications/push-subscribe - browser calls this after permission is granted
router.post("/api/notifications/push-subscribe", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const subscription = req.body.subscription;

  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return res.status(400).json({ error: "Invalid subscription payload." });
  }

  try {
    const { endpoint, keys } = subscription;
    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh_key, auth_key)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (endpoint) DO UPDATE SET
         user_id = $1, p256dh_key = $3, auth_key = $4, created_at = now()`,
      [userId, endpoint, keys.p256dh, keys.auth]
    );

    // Also update notification preferences to set channel_browser = true
    await pool.query(
      `INSERT INTO notification_preferences (user_id, channel_browser, updated_at)
       VALUES ($1, true, now())
       ON CONFLICT (user_id) DO UPDATE SET channel_browser = true, updated_at = now()`,
      [userId]
    );

    res.status(201).json({ ok: true, message: "Push subscription registered." });
  } catch (err) {
    console.error("Error saving push subscription:", err);
    res.status(500).json({ error: "Failed to save push subscription." });
  }
});

// POST /api/notifications/test-send - triggers immediate test reminder for live validation
router.post("/api/notifications/test-send", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { channel, type } = req.body; // channel: 'browser' | 'whatsapp', type: 'morning' | 'evening' | 'contextual'

  try {
    const prefRes = await pool.query(`SELECT * FROM notification_preferences WHERE user_id = $1`, [userId]);
    const pref = prefRes.rows[0] || {
      user_id: userId,
      channel_browser: true,
      channel_whatsapp: true,
    };

    if (channel === 'browser') {
      const results = await sendBrowserNotification(
        userId,
        "🌿 SAHARA Wellbeing (Test)",
        "This is a test notification from your SAHARA student wellness space."
      );
      return res.json({ ok: true, channel: 'browser', results });
    }

    if (channel === 'whatsapp') {
      const waRes = await sendWhatsAppReminder(
        userId,
        "This is a test reminder from your SAHARA student wellbeing space."
      );
      return res.json({ ok: true, channel: 'whatsapp', result: waRes });
    }

    // Default test send
    const testResult = await sendReminder(
      { ...pref, user_id: userId, channel_browser: true },
      type || "morning"
    );
    res.json({ ok: true, testResult });
  } catch (err) {
    console.error("Error in test notification send:", err);
    res.status(500).json({ error: "Test notification failed." });
  }
});

// GET /api/notifications/log - returns recent send history for the student
router.get("/api/notifications/log", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  try {
    const logs = await pool.query(
      `SELECT id, channel, type, content, sent_at 
       FROM notification_log 
       WHERE user_id = $1 
       ORDER BY sent_at DESC LIMIT 10`,
      [userId]
    );
    res.json(logs.rows);
  } catch (err) {
    res.json([]);
  }
});

module.exports = router;
