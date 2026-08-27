// routes/admin.js
const express = require("express");
const pool = require("../db/pool");
const { requireAuth, requireRole, logAudit } = require("../middleware/auth");

const router = express.Router();

// GET /api/admin/stats - population-level trends ONLY, no individual
// student data by default, per the earlier privacy-first admin spec.
router.get("/api/admin/stats", requireAuth, requireRole("admin"), async (req, res) => {
  const distribution = await pool.query(`
    SELECT risk_level, COUNT(DISTINCT user_id) AS student_count
    FROM (
      SELECT DISTINCT ON (user_id) user_id, risk_level
      FROM results ORDER BY user_id, created_at DESC
    ) latest
    GROUP BY risk_level
  `);

  const trend = await pool.query(`
    SELECT date_trunc('day', created_at) AS day,
           ROUND(AVG(overall_wellbeing)) AS avg_wellbeing,
           COUNT(*) AS checkin_count
    FROM results
    WHERE created_at > now() - interval '90 days'
    GROUP BY day ORDER BY day
  `);

  const counselorLoad = await pool.query(`
    SELECT u.display_name, COUNT(cn.id) AS open_cases
    FROM users u
    LEFT JOIN case_notes cn ON cn.counselor_id = u.id AND cn.status != 'resolved'
    WHERE u.role = 'counselor'
    GROUP BY u.id, u.display_name
  `);

  res.json({
    riskDistribution: distribution.rows,
    trend: trend.rows,
    counselorLoad: counselorLoad.rows,
  });
});

// GET /api/admin/system-health - model + integration status, ties into
// the earlier "confirm what's real vs mockup" audit.
router.get("/api/admin/system-health", requireAuth, requireRole("admin"), async (req, res) => {
  const checks = {};

  try {
    const modelBase = (process.env.MODEL_SERVICE_URL || "http://127.0.0.1:8000").replace(/\/predict\/?$/, "");
    const modelResp = await fetch(`${modelBase}/health`);
    checks.modelService = { status: modelResp.ok ? "ok" : "error", responseMs: Date.now() - t0 };
  } catch {
    checks.modelService = { status: "unreachable" };
  }

  checks.geminiConfigured = Boolean(process.env.GEMINI_API_KEY);
  checks.twilioConfigured = Boolean(process.env.TWILIO_ACCOUNT_SID);
  checks.databaseConfigured = Boolean(process.env.DATABASE_URL);

  res.json(checks);
});

// GET /api/admin/students/:userId - drill into an individual student.
// This is the ONE place admins can see individual data, and it's logged
// every time, per the earlier "requires a specific, logged reason" rule.
router.get("/api/admin/students/:userId", requireAuth, requireRole("admin"), async (req, res) => {
  const { reason } = req.query;
  if (!reason) {
    return res.status(400).json({ error: "A reason is required to view individual student data." });
  }
  await logAudit({
    actorId: req.session.userId,
    actorRole: "admin",
    action: `view_individual_student_data: ${reason}`,
    targetId: req.params.userId,
  });

  const results = await pool.query(
    `SELECT * FROM results WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.params.userId]
  );
  res.json(results.rows);
});

// GET /api/admin/audit-log
router.get("/api/admin/audit-log", requireAuth, requireRole("admin"), async (req, res) => {
  const result = await pool.query(`
    SELECT al.*, u.display_name AS actor_name
    FROM audit_log al JOIN users u ON u.id = al.actor_id
    ORDER BY al.created_at DESC LIMIT 100
  `);
  res.json(result.rows);
});

module.exports = router;
