// routes/counselor.js
const express = require("express");
const pool = require("../db/pool");
const { requireAuth, requireRole, logAudit } = require("../middleware/auth");

const router = express.Router();

// GET /api/counselor/queue or /api/counselor/students - triage queue
const handleQueue = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (r.user_id)
        r.user_id, r.risk_level, r.overall_wellbeing, r.contributing_factors, r.created_at,
        u.display_name
      FROM results r
      JOIN users u ON u.id = r.user_id
      WHERE r.risk_level IN ('moderate', 'high')
      ORDER BY r.user_id, r.created_at DESC
    `);
    const rows = result.rows.sort((a, b) => {
      const order = { high: 0, moderate: 1 };
      return (order[a.risk_level] ?? 2) - (order[b.risk_level] ?? 2);
    });
    res.json(rows);
  } catch (err) {
    console.warn("Counselor queue query error:", err.message);
    res.json([]);
  }
};

router.get("/api/counselor/queue", requireAuth, requireRole("counselor", "admin"), handleQueue);
router.get("/api/counselor/students", requireAuth, requireRole("counselor", "admin"), handleQueue);

// GET /api/counselor/students/:userId - individual case view.
// Logs the access, per the audit requirement.
router.get("/api/counselor/students/:userId", requireAuth, requireRole("counselor", "admin"), async (req, res) => {
  const { userId } = req.params;

  await logAudit({
    actorId: req.session.userId,
    actorRole: req.session.role,
    action: "view_student_case",
    targetId: userId,
  });

  const history = await pool.query(
    `SELECT overall_wellbeing, anxiety_signal, academic_strain, risk_level,
            contributing_factors, created_at
     FROM results WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  const notes = await pool.query(
    `SELECT cn.*, u.display_name AS counselor_name FROM case_notes cn
     JOIN users u ON u.id = cn.counselor_id
     WHERE cn.student_id = $1 ORDER BY cn.created_at DESC`,
    [userId]
  );
  res.json({ history: history.rows, notes: notes.rows });
});

// POST /api/counselor/students/:userId/notes - add a case note / status update
router.post("/api/counselor/students/:userId/notes", requireAuth, requireRole("counselor", "admin"), async (req, res) => {
  const { userId } = req.params;
  const { note, status } = req.body;

  await logAudit({
    actorId: req.session.userId,
    actorRole: req.session.role,
    action: "add_case_note",
    targetId: userId,
  });

  const inserted = await pool.query(
    `INSERT INTO case_notes (student_id, counselor_id, note, status)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, req.session.userId, note, status || "open"]
  );
  res.status(201).json(inserted.rows[0]);
});

module.exports = router;
