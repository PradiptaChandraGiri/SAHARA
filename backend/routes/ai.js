// routes/ai.js — updated with persistent guest session + 48hr chat sync
const express = require("express");
const pool = require("../db/pool");
const { getChatReply, streamChatReply } = require("../services/groq");

const router = express.Router();

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

async function getOrCreateUserId(req) {
  let userId = req.session ? req.session.userId : null;
  if (!userId) {
    try {
      const guestUser = await pool.query(
        `INSERT INTO users (email, display_name, oauth_provider, oauth_id, role, last_login_at)
         VALUES ($1, $2, 'guest', $3, 'student', now())
         RETURNING *`,
        [`guest_${Date.now()}@sahara.local`, 'Student (Guest)', `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`]
      );
      userId = guestUser.rows[0].id;
      if (req.session) {
        req.session.userId = userId;
        req.session.role = 'student';
      }
    } catch (e) {
      console.warn("Could not create guest user:", e);
    }
  }
  return userId;
}

async function getStudentEvaluationContext(userId) {
  if (!userId) return null;
  try {
    const res = await pool.query(
      `SELECT overall_wellbeing, anxiety_signal, academic_strain, risk_level, contributing_factors
       FROM results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      overallWellbeing: r.overall_wellbeing,
      anxietySignal: r.anxiety_signal,
      academicStrain: r.academic_strain,
      riskLevel: r.risk_level,
      factors: r.contributing_factors || [],
    };
  } catch {
    return null;
  }
}

// POST /api/chat/stream - Server-Sent Events (SSE) streaming endpoint with contextual student evaluation
router.post("/api/chat/stream", async (req, res) => {
  const { message, clientContext } = req.body;
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message is required." });
  }

  const userId = await getOrCreateUserId(req);

  // Crisis check happens FIRST
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

    const studentContext = (await getStudentEvaluationContext(userId)) || clientContext || null;

    const fullText = await streamChatReply(
      message,
      history,
      (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      },
      studentContext
    );

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

// POST /api/chat - Non-streaming fallback + WhatsApp webhook router
router.post("/api/chat", async (req, res) => {
  const { message, clientContext } = req.body;
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message is required." });
  }

  const userId = await getOrCreateUserId(req);

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

    const studentContext = (await getStudentEvaluationContext(userId)) || clientContext || null;
    const reply = await getChatReply(message, history, studentContext);

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

// GET /api/chat/history - Fetches stored messages from past 48 hours
router.get("/api/chat/history", async (req, res) => {
  const userId = req.session ? req.session.userId : null;
  if (!userId) {
    return res.json([]);
  }
  try {
    const result = await pool.query(
      `SELECT role, content, created_at 
       FROM chat_messages 
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '48 hours'
       ORDER BY created_at ASC LIMIT 100`,
      [userId]
    );
    res.json(result.rows);
  } catch (e) {
    res.json([]);
  }
});

// DELETE /api/chat/history - Clear chat history
router.delete("/api/chat/history", async (req, res) => {
  const userId = req.session ? req.session.userId : null;
  if (userId) {
    try {
      await pool.query(`DELETE FROM chat_messages WHERE user_id = $1`, [userId]);
    } catch (e) {}
  }
  res.json({ success: true, message: "Chat history cleared." });
});

module.exports = router;
