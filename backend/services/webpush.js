// services/webpush.js
const webpush = require("web-push");
const pool = require("../db/pool");

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      "mailto:support@sahara.app",
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (err) {
    console.warn("Failed to set VAPID details:", err.message);
  }
} else {
  console.warn("VAPID keys not fully configured in environment.");
}

async function sendBrowserNotification(userId, title, body) {
  try {
    const subs = await pool.query(`SELECT * FROM push_subscriptions WHERE user_id = $1`, [userId]);
    if (subs.rows.length === 0) return [];

    const results = await Promise.allSettled(
      subs.rows.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh_key, auth: sub.auth_key },
          },
          JSON.stringify({
            title: title || "SAHARA Wellbeing",
            body: body || "A quiet moment whenever works for you.",
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            data: { url: "/dashboard" },
          })
        )
      )
    );

    // Clean up dead subscriptions (410 Gone / 404 Not Found)
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (
        result.status === "rejected" &&
        (result.reason?.statusCode === 410 || result.reason?.statusCode === 404)
      ) {
        await pool.query(`DELETE FROM push_subscriptions WHERE id = $1`, [subs.rows[i].id]);
      }
    }

    return results;
  } catch (err) {
    console.error("sendBrowserNotification error:", err.message);
    return [];
  }
}

module.exports = { sendBrowserNotification };
