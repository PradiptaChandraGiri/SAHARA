// routes/privacy.js
const express = require("express");
const pool = require("../db/pool");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/me/export - backs the "Download my data" button on Profile
router.get("/api/me/export", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const [user, checkins, results, chats] = await Promise.all([
    pool.query(`SELECT id, email, display_name, created_at FROM users WHERE id = $1`, [userId]),
    pool.query(`SELECT * FROM checkins WHERE user_id = $1`, [userId]),
    pool.query(`SELECT * FROM results WHERE user_id = $1`, [userId]),
    pool.query(`SELECT role, content, created_at FROM chat_messages WHERE user_id = $1`, [userId]),
  ]);

  res.setHeader("Content-Disposition", "attachment; filename=my_sahara_data.json");
  res.json({
    user: user.rows[0],
    checkins: checkins.rows,
    results: results.rows,
    chatHistory: chats.rows,
  });
});

// DELETE /api/me - backs the "Delete my data" button on Profile.
// Cascading deletes in the schema handle checkins/results/chat_messages
// automatically once the user row is removed.
router.delete("/api/me", requireAuth, async (req, res) => {
  await pool.query(`DELETE FROM users WHERE id = $1`, [req.session.userId]);
  req.session.destroy(() => {
    res.json({ ok: true, message: "Your data has been deleted." });
  });
});

module.exports = router;
