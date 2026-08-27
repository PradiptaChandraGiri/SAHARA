// routes/results.js
const express = require("express");
const pool = require("../db/pool");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/results/latest - powers the Dashboard status card + Results page
router.get("/api/results/latest", requireAuth, async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [req.session.userId]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: "No check-ins yet." });
  res.json(result.rows[0]);
});

// GET /api/results/history - powers the Profile page trend chart
router.get("/api/results/history", requireAuth, async (req, res) => {
  const result = await pool.query(
    `SELECT overall_wellbeing, anxiety_signal, academic_strain, risk_level, created_at
     FROM results WHERE user_id = $1 ORDER BY created_at ASC`,
    [req.session.userId]
  );
  res.json(result.rows);
});

// GET /api/results/:id/resources - replaces the frontend mock
// RESOURCE_LIBRARY from the earlier task. Returns real curated resources
// matched to that result's contributing factors.
router.get("/api/results/:id/resources", requireAuth, async (req, res) => {
  const resultRow = await pool.query(
    `SELECT contributing_factors FROM results WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.session.userId]
  );
  if (resultRow.rows.length === 0) return res.status(404).json({ error: "Result not found." });

  const factors = resultRow.rows[0].contributing_factors;
  if (factors.length === 0) return res.json([]);

  const resources = await pool.query(
    `SELECT id, factor_key, title, description, resource_type, url
     FROM resources WHERE factor_key = ANY($1) AND active = true
     LIMIT 3`,
    [factors]
  );
  res.json(resources.rows);
});

module.exports = router;
