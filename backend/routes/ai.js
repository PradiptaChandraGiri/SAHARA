// routes/ai.js
const express = require("express");
const pool = require("../db/pool");
const { getChatReply } = require("../services/gemini");

const router = express.Router();

// POST /api/chat - AI Support page proxy to Gemini.
// Works seamlessly for both authenticated students and guest sessions.
router.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    let userId = req.session ? req.session.userId : null;
    let history = [];

    if (userId) {
      // Pull recent history for context (last 10 messages)
      const historyResult = await pool.query(
        `SELECT role, content FROM chat_messages WHERE user_id = $1
         ORDER BY created_at DESC LIMIT 10`,
        [userId]
      );
      history = historyResult.rows.reverse();

      await pool.query(
        `INSERT INTO chat_messages (user_id, role, content) VALUES ($1, 'user', $2)`,
        [userId, message]
      );
    }

    const reply = await getChatReply(message, history);

    if (userId) {
      await pool.query(
        `INSERT INTO chat_messages (user_id, role, content, flagged_crisis)
         VALUES ($1, 'assistant', $2, $3)`,
        [userId, reply.text, reply.flaggedCrisis]
      );
    }

    res.json(reply);
  } catch (err) {
    console.error("AI chat failed:", err);
    res.status(500).json({ error: "Couldn't reach SAHARA AI right now. Please try again." });
  }
});

// GET /api/chat/history - loads previous messages when the page opens
router.get("/api/chat/history", async (req, res) => {
  const userId = req.session ? req.session.userId : null;
  if (!userId) {
    return res.json([]);
  }
  const result = await pool.query(
    `SELECT role, content, created_at FROM chat_messages WHERE user_id = $1
     ORDER BY created_at ASC LIMIT 50`,
    [userId]
  );
  res.json(result.rows);
});

module.exports = router;
