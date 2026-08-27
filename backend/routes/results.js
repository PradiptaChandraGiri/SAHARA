// routes/results.js
const express = require("express");
const pool = require("../db/pool");

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

// GET /api/results/:id/resources - returns real curated resources
// matched to that result's contributing factors.
router.get("/api/results/:id/resources", async (req, res) => {
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
});

module.exports = router;
