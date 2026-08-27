// routes/results.js
const express = require("express");
const pool = require("../db/pool");
const { generatePersonalizedSuggestions, generateFollowupCoaching } = require("../services/groq");

const router = express.Router();

// GET /api/results/latest - powers the Dashboard status card + Results page
router.get("/api/results/latest", async (req, res) => {
  const userId = req.session ? req.session.userId : null;
  if (!userId) {
    return res.status(404).json({ error: "No check-ins yet." });
  }
  const result = await pool.query(
    `SELECT * FROM results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: "No check-ins yet." });
  res.json(result.rows[0]);
});

// GET /api/results/history - powers the Profile page trend chart
router.get("/api/results/history", async (req, res) => {
  const userId = req.session ? req.session.userId : null;
  if (!userId) {
    return res.json([]);
  }
  const result = await pool.query(
    `SELECT overall_wellbeing, anxiety_signal, academic_strain, risk_level, created_at
     FROM results WHERE user_id = $1 ORDER BY created_at ASC`,
    [userId]
  );
  res.json(result.rows);
});

// POST /api/results/ai-guidance - Generates real-time AI guidance & dynamic tailored suggestions using Groq
router.post("/api/results/ai-guidance", async (req, res) => {
  const assessmentData = req.body || {};
  try {
    const aiGuidance = await generatePersonalizedSuggestions(assessmentData);
    res.json(aiGuidance);
  } catch (err) {
    console.error("Failed to generate AI guidance:", err);
    res.status(500).json({ error: "Could not generate AI guidance right now." });
  }
});

// GET /api/results/:id/ai-guidance - Generates dynamic guidance for an existing result record
router.get("/api/results/:id/ai-guidance", async (req, res) => {
  try {
    const resultRow = await pool.query(`SELECT * FROM results WHERE id = $1`, [req.params.id]);
    if (resultRow.rows.length === 0) {
      return res.status(404).json({ error: "Result not found." });
    }
    const r = resultRow.rows[0];
    
    // Check if there's linked check-in data for granular inputs
    let checkin = {};
    if (r.checkin_id) {
      const cRow = await pool.query(`SELECT * FROM checkins WHERE id = $1`, [r.checkin_id]);
      if (cRow.rows.length > 0) checkin = cRow.rows[0];
    }

    const summary = {
      overallWellbeing: r.overall_wellbeing,
      anxietySignal: r.anxiety_signal,
      academicStrain: r.academic_strain,
      riskLevel: r.risk_level,
      factors: r.contributing_factors || [],
      sleepHours: checkin.sleep_hours || 6,
      examPressure: checkin.exam_pressure || 7,
      studyHours: checkin.study_hours_per_day || 5,
    };

    const aiGuidance = await generatePersonalizedSuggestions(summary);
    res.json(aiGuidance);
  } catch (err) {
    console.error("Failed to generate result AI guidance:", err);
    res.status(500).json({ error: "Could not generate AI guidance." });
  }
});

// POST /api/results/followup - Real-time conversational AI coaching when student shares what's going on
router.post("/api/results/followup", async (req, res) => {
  const { concern, assessmentSummary } = req.body;
  if (!concern || typeof concern !== "string" || concern.trim().length === 0) {
    return res.status(400).json({ error: "Concern text is required." });
  }

  try {
    const coaching = await generateFollowupCoaching(concern, assessmentSummary || {});
    res.json(coaching);
  } catch (err) {
    console.error("Failed to generate follow-up coaching:", err);
    res.status(500).json({ error: "Could not generate coaching response." });
  }
});

// GET /api/results/:id/resources - returns curated resources from DB as base reference
router.get("/api/results/:id/resources", async (req, res) => {
  try {
    const resultRow = await pool.query(
      `SELECT contributing_factors FROM results WHERE id = $1`,
      [req.params.id]
    );
    if (resultRow.rows.length === 0) return res.status(404).json({ error: "Result not found." });

    const factors = resultRow.rows[0].contributing_factors;
    if (!factors || factors.length === 0) return res.json([]);

    const resources = await pool.query(
      `SELECT id, factor_key, title, description, resource_type, url
       FROM resources WHERE factor_key = ANY($1) AND active = true
       LIMIT 3`,
      [factors]
    );
    res.json(resources.rows);
  } catch (err) {
    res.json([]);
  }
});

module.exports = router;
