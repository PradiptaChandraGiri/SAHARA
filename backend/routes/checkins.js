// routes/checkins.js
const express = require("express");
const pool = require("../db/pool");
const { requireAuth } = require("../middleware/auth");
const { scoreCheckin } = require("../services/model");
const { parseSymptomsFromText } = require("../services/groq");
const { verifyToken } = require("../helpers/token");

const router = express.Router();

const CHECKIN_FIELDS = [
  "age", "gender", "academic_year", "department",
  "sleep_hours", "study_hours_per_day", "exam_pressure", "academic_performance",
  "stress_level", "physical_activity", "social_support", "screen_time",
  "internet_usage", "financial_stress", "family_expectation",
];

// POST /api/checkins/parse-symptoms - Ada Health / Claude AI style free-text NLP symptom & strain parser
router.post("/api/checkins/parse-symptoms", async (req, res) => {
  const { freeText } = req.body;
  if (!freeText || typeof freeText !== "string" || freeText.trim().length === 0) {
    return res.status(400).json({ error: "Free text symptom description is required." });
  }

  try {
    const parsed = await parseSymptomsFromText(freeText);
    res.json(parsed);
  } catch (err) {
    console.error("NLP symptom parsing failed:", err);
    res.status(500).json({ error: "Could not parse symptoms. Please use the step-by-step form." });
  }
});

// POST /api/checkins - submit a completed check-in (Step 5 "Submit").
router.post("/api/checkins", async (req, res) => {
  let userId = req.session ? req.session.userId : null;
  const authHeader = req.headers.authorization;
  if (!userId && authHeader && authHeader.startsWith("Bearer ")) {
    const tokenStr = authHeader.substring(7).trim();
    const verified = verifyToken(tokenStr);
    if (verified && verified.userId) {
      userId = verified.userId;
    }
  }

  if (!userId) {
    // Automatically provision a guest student record in DB
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
  }

  const answers = req.body;

  const missing = CHECKIN_FIELDS.filter((f) => answers[f] === undefined || answers[f] === null);
  if (missing.length > 0) {
    return res.status(400).json({ error: "Missing required fields", missing });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Fetch user's active retention duration (default 30 days)
    let retentionDays = 30;
    try {
      const uRes = await client.query(`SELECT retention_days FROM users WHERE id = $1`, [userId]);
      if (uRes.rows.length > 0 && uRes.rows[0].retention_days) {
        retentionDays = Number(uRes.rows[0].retention_days);
      }
    } catch (e) {
      console.warn("Could not fetch user retention_days:", e.message);
    }
    const retentionInterval = `${retentionDays} days`;

    const checkinResult = await client.query(
      `INSERT INTO checkins (user_id, age, gender, academic_year, department, sleep_hours,
         study_hours_per_day, exam_pressure, academic_performance, stress_level,
         physical_activity, social_support, screen_time, internet_usage,
         financial_stress, family_expectation, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16, now() + ($17 || ' days')::INTERVAL)
       RETURNING id`,
      [
        userId, answers.age, answers.gender, answers.academic_year, answers.department,
        answers.sleep_hours, answers.study_hours_per_day, answers.exam_pressure,
        answers.academic_performance, answers.stress_level, answers.physical_activity,
        answers.social_support, answers.screen_time, answers.internet_usage,
        answers.financial_stress, answers.family_expectation, retentionDays,
      ]
    );
    const checkinId = checkinResult.rows[0].id;

    // Call ML model service
    const scored = await scoreCheckin(answers);

    const resultRow = await client.query(
      `INSERT INTO results (checkin_id, user_id, overall_wellbeing, anxiety_signal,
         academic_strain, risk_level, contributing_factors, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7, now() + ($8 || ' days')::INTERVAL)
       RETURNING *`,
      [
        checkinId, userId, scored.overallWellbeing, scored.anxietySignal,
        scored.academicStrain, scored.riskLevel, scored.contributingFactors,
        retentionDays,
      ]
    );

    await client.query("COMMIT");

    // Optional Contextual Nudge (if enabled, delayed ~4 hours or logged, respecting daily cap)
    setTimeout(async () => {
      try {
        const prefRes = await pool.query(
          `SELECT * FROM notification_preferences 
           WHERE user_id = $1 AND contextual_enabled = true 
             AND (paused_until IS NULL OR paused_until < now())
             AND (channel_browser = true OR channel_whatsapp = true)`,
          [userId]
        );
        if (prefRes.rows.length > 0) {
          const pref = prefRes.rows[0];
          // Check daily cap
          const sentCountRes = await pool.query(
            `SELECT count(*) FROM notification_log WHERE user_id = $1 AND sent_at::date = CURRENT_DATE`,
            [userId]
          );
          const sentCount = Number(sentCountRes.rows[0]?.count || 0);
          if (sentCount < 2) {
            const { sendReminder } = require("../jobs/notificationScheduler");
            await sendReminder(pref, "contextual");
          }
        }
      } catch (nudgeErr) {
        console.warn("Contextual nudge evaluation error:", nudgeErr.message);
      }
    }, 5000); // Trigger in background safely

    res.status(201).json(resultRow.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Check-in submission failed:", err);
    res.status(500).json({ error: "Something went wrong scoring your check-in. Please try again." });
  } finally {
    client.release();
  }
});

module.exports = router;
