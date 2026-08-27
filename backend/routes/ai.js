// routes/ai.js — updated to use Groq + streaming
const express = require("express");
const pool = require("../db/pool");
const { getChatReply, streamChatReply } = require("../services/groq");

const router = express.Router();

// Same crisis-keyword check as before - runs BEFORE any AI call, on either
// the streaming or non-streaming path. Provider-independent on purpose.
const CRISIS_KEYWORDS = [
  "kill myself", "suicide", "end my life", "self harm", "self-harm",
  "hurt myself", "want to die", "no reason to live", "can't go on",
];

function containsCrisisLanguage(text) {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

const CRISIS_RESPONSE = {
  text:
    "It sounds like you're going through something really heavy right now, " +
    "and I want to make sure you get support from someone who can really help. " +
    "Please reach out to a crisis line right now — you don't have to handle this alone.",
  crisisResources: [
    { name: "24/7 Student Helpline", contact: "14416" },
    { name: "Campus Counseling Center", contact: "See your Profile page for direct contact" },
  ],
};

// POST /api/chat/stream - Server-Sent Events (SSE) streaming endpoint
router.post("/api/chat/stream", async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message is required." });
  }

  const userId = req.session ? req.session.userId : null;

  // Crisis check happens FIRST, before opening the stream or calling Groq.
  if (containsCrisisLanguage(message)) {
    if (userId) {
      await pool.query(`INSERT INTO chat_messages (user_id, role, content) VALUES ($1, 'user', $2)`, [userId, message]);
      await pool.query(
        `INSERT INTO chat_messages (user_id, role, content, flagged_crisis) VALUES ($1, 'assistant', $2, true)`,
        [userId, CRISIS_RESPONSE.text]
      );
    }
    return res.json({ ...CRISIS_RESPONSE, flaggedCrisis: true, streamed: false });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  try {
    let history = [];
    if (userId) {
      const historyResult = await pool.query(
        `SELECT role, content FROM chat_messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
        [userId]
      );
      history = historyResult.rows.reverse();
      await pool.query(`INSERT INTO chat_messages (user_id, role, content) VALUES ($1, 'user', $2)`, [userId, message]);
    }

    const fullText = await streamChatReply(message, history, (chunk) => {
      // SSE format: each event is "data: <json>\n\n"
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });

    if (userId) {
      await pool.query(
        `INSERT INTO chat_messages (user_id, role, content, flagged_crisis) VALUES ($1, 'assistant', $2, false)`,
        [userId, fullText]
      );
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Streaming chat failed:", err);
    res.write(`data: ${JSON.stringify({ error: "Something went wrong with AI streaming. Please try again." })}\n\n`);
    res.end();
  }
});

// POST /api/chat - Non-streaming fallback + used by WhatsApp bot
router.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message is required." });
  }

  const userId = req.session ? req.session.userId : null;

  if (containsCrisisLanguage(message)) {
    return res.json({ ...CRISIS_RESPONSE, flaggedCrisis: true });
  }

  try {
    let history = [];
    if (userId) {
      const historyResult = await pool.query(
        `SELECT role, content FROM chat_messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
        [userId]
      );
      history = historyResult.rows.reverse();
      await pool.query(`INSERT INTO chat_messages (user_id, role, content) VALUES ($1, 'user', $2)`, [userId, message]);
    }

    const reply = await getChatReply(message, history);

    if (userId) {
      await pool.query(
        `INSERT INTO chat_messages (user_id, role, content, flagged_crisis) VALUES ($1, 'assistant', $2, $3)`,
        [userId, reply.text, reply.flaggedCrisis]
      );
    }

    res.json(reply);
  } catch (err) {
    console.error("AI chat failed:", err);
    res.status(500).json({ error: "Couldn't reach SAHARA AI right now. Please try again." });
  }
});

router.get("/api/chat/history", async (req, res) => {
  const userId = req.session ? req.session.userId : null;
  if (!userId) {
    return res.json([]);
  }
  const result = await pool.query(
    `SELECT role, content, created_at FROM chat_messages WHERE user_id = $1 ORDER BY created_at ASC LIMIT 50`,
    [userId]
  );
  res.json(result.rows);
});

module.exports = router;
