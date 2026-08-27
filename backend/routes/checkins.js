// routes/checkins.js
const express = require("express");
const pool = require("../db/pool");
const { requireAuth } = require("../middleware/auth");
const { scoreCheckin } = require("../services/model");

const router = express.Router();

const CHECKIN_FIELDS = [
  "age", "gender", "academic_year", "department",
  "sleep_hours", "study_hours_per_day", "exam_pressure", "academic_performance",
  "stress_level", "physical_activity", "social_support", "screen_time",
  "internet_usage", "financial_stress", "family_expectation",
];

// POST /api/checkins - submit a completed check-in (Step 5 "Submit").
// This is the ONE endpoint the whole 5-step flow submits to at the end;
// steps 1-4 just hold state in the frontend until Step 5 posts it all.
router.post("/api/checkins", async (req, res) => {
  let userId = req.session ? req.session.userId : null;
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

  // Basic validation - reject if required fields are missing rather than
  // silently scoring garbage data.
  const missing = CHECKIN_FIELDS.filter((f) => answers[f] === undefined || answers[f] === null);
  if (missing.length > 0) {
    return res.status(400).json({ error: "Missing required fields", missing });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const checkinResult = await client.query(
      `INSERT INTO checkins (user_id, age, gender, academic_year, department, sleep_hours,
         study_hours_per_day, exam_pressure, academic_performance, stress_level,
         physical_activity, social_support, screen_time, internet_usage,
         financial_stress, family_expectation)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING id`,
      [
        userId, answers.age, answers.gender, answers.academic_year, answers.department,
        answers.sleep_hours, answers.study_hours_per_day, answers.exam_pressure,
        answers.academic_performance, answers.stress_level, answers.physical_activity,
        answers.social_support, answers.screen_time, answers.internet_usage,
        answers.financial_stress, answers.family_expectation,
      ]
    );
    const checkinId = checkinResult.rows[0].id;

    // This calls the model service - per the earlier speed fix, this
    // should resolve in well under a second.
    const scored = await scoreCheckin(answers);

    const resultRow = await client.query(
      `INSERT INTO results (checkin_id, user_id, overall_wellbeing, anxiety_signal,
         academic_strain, risk_level, contributing_factors)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        checkinId, userId, scored.overallWellbeing, scored.anxietySignal,
        scored.academicStrain, scored.riskLevel, scored.contributingFactors,
      ]
    );

    await client.query("COMMIT");
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
