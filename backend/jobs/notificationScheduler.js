// jobs/notificationScheduler.js
//
// Runs every 15 minutes (see server.js for the cron setup). For each
// student, checks: is it their configured morning/evening time RIGHT NOW
// in THEIR timezone, have they enabled this reminder type and channel,
// have they already been sent today, and are they not currently paused.
//
// Deliberately does NOT send more than 1 morning + 1 evening reminder
// per day per student, plus at most 1 contextual nudge — this matches
// the research finding that capping notifications (not maximizing them)
// is what actually improves wellbeing outcomes.

const pool = require("../db/pool");
const { generateReminderContent } = require("../services/notificationContent");
const { sendBrowserNotification } = require("../services/webpush");
const { sendWhatsAppReminder } = require("../services/whatsappOutbound");

async function alreadySentToday(userId, type) {
  try {
    const result = await pool.query(
      `SELECT 1 FROM notification_log
       WHERE user_id = $1 AND type = $2 AND sent_at::date = CURRENT_DATE`,
      [userId, type]
    );
    return result.rows.length > 0;
  } catch (e) {
    console.warn("alreadySentToday check error:", e.message);
    return false;
  }
}

async function sendReminder(pref, type) {
  if (await alreadySentToday(pref.user_id, type)) {
    return { skipped: true, reason: "already_sent_today" };
  }

  const content = await generateReminderContent(pref.user_id, type);
  const title = type === "morning" ? "Good morning from SAHARA" : type === "evening" ? "A moment before you rest" : "SAHARA Wellbeing Nudge";

  const results = {};

  if (pref.channel_browser) {
    const pushRes = await sendBrowserNotification(pref.user_id, title, content);
    results.browser = pushRes;
    await pool.query(
      `INSERT INTO notification_log (user_id, channel, type, content) VALUES ($1,'browser',$2,$3)`,
      [pref.user_id, type, content]
    );
  }

  if (pref.channel_whatsapp) {
    const waRes = await sendWhatsAppReminder(pref.user_id, content);
    results.whatsapp = waRes;
    await pool.query(
      `INSERT INTO notification_log (user_id, channel, type, content) VALUES ($1,'whatsapp',$2,$3)`,
      [pref.user_id, type, content]
    );
  }

  return { success: true, type, content, results };
}

async function runSchedulerTick() {
  try {
    const prefs = await pool.query(`
      SELECT * FROM notification_preferences
      WHERE (paused_until IS NULL OR paused_until < now())
        AND (channel_browser = true OR channel_whatsapp = true)
    `);

    for (const pref of prefs.rows) {
      // Compute "what time is it right now for THIS student", not server
      // time - critical, otherwise everyone gets pinged at once regardless
      // of their actual morning/evening.
      let nowInUserTz;
      try {
        nowInUserTz = new Date(
          new Date().toLocaleString("en-US", { timeZone: pref.timezone || "UTC" })
        );
      } catch (tzErr) {
        nowInUserTz = new Date();
      }

      // Match within a 15-minute window (this job runs every 15 min)
      const matchesTime = (configured) => {
        if (!configured) return false;
        const [h, m] = String(configured).split(":").map(Number);
        const configuredMinutes = h * 60 + (m || 0);
        const nowMinutes = nowInUserTz.getHours() * 60 + nowInUserTz.getMinutes();
        return Math.abs(nowMinutes - configuredMinutes) <= 8;
      };

      if (pref.morning_enabled && matchesTime(pref.morning_time)) {
        await sendReminder(pref, "morning");
      }
      if (pref.evening_enabled && matchesTime(pref.evening_time)) {
        await sendReminder(pref, "evening");
      }
    }
  } catch (err) {
    console.error("Scheduler tick error:", err.message);
  }
}

module.exports = { runSchedulerTick, sendReminder };
