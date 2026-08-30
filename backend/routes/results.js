const express = require("express");
const pool = require("../db/pool");
const { generatePersonalizedSuggestions, generateFollowupCoaching } = require("../services/groq");
const { verifyToken } = require("../helpers/token");

const router = express.Router();

// Helper to resolve user ID from session or Bearer authorization header
function getUserIdFromReq(req) {
  let uid = (req.session && req.session.userId) ? req.session.userId : null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const tokenStr = authHeader.substring(7).trim();
    const verified = verifyToken(tokenStr);
    if (verified && verified.userId) uid = verified.userId;
  }
  if (!uid) return null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(uid));
  return isUuid ? uid : null;
}

// GET /api/results/latest - powers the Dashboard status card + Results page
router.get("/api/results/latest", async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.json(null);
  }
  try {
    const result = await pool.query(
      `SELECT * FROM results WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > now()) ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    if (result.rows.length === 0) return res.json(null);
    res.json(result.rows[0]);
  } catch (err) {
    console.warn("results/latest query error:", err.message);
    res.json(null);
  }
});

// GET /api/results/history - powers the Profile page trend chart
router.get("/api/results/history", async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.json([]);
  }
  try {
    const result = await pool.query(
      `SELECT id, overall_wellbeing, anxiety_signal, academic_strain, risk_level, contributing_factors, created_at, expires_at
       FROM results WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > now()) ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.warn("results/history query error:", err.message);
    res.json([]);
  }
});

// GET /api/me/retention - retrieves data retention policy status, next expiration date, and alert notice
router.get("/api/me/retention", async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.json({
      retentionDays: 30,
      totalAssessments: 0,
      nextScheduledCleanupDate: null,
      daysRemainingUntilCleanup: 30,
      expiringCount: 0,
      isExpiringSoon: false,
      notificationAlert: null,
    });
  }

  try {
    const userRes = await pool.query(
      `SELECT id, email, display_name, retention_days, retention_extended_at, created_at FROM users WHERE id = $1`,
      [userId]
    );
    const user = userRes.rows[0];
    const retentionDays = user?.retention_days || 30;

    const assessmentsRes = await pool.query(
      `SELECT id, created_at, expires_at FROM results WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > now()) ORDER BY created_at ASC`,
      [userId]
    );
    const totalAssessments = assessmentsRes.rows.length;

    let nextCleanup = null;
    let daysRemaining = retentionDays;
    let expiringCount = 0;

    if (totalAssessments > 0) {
      const earliestExpiry = assessmentsRes.rows.reduce((earliest, r) => {
        const exp = r.expires_at ? new Date(r.expires_at).getTime() : new Date(r.created_at).getTime() + retentionDays * 86400000;
        return exp < earliest ? exp : earliest;
      }, Infinity);

      if (earliestExpiry !== Infinity) {
        nextCleanup = new Date(earliestExpiry).toISOString();
        daysRemaining = Math.max(0, Math.ceil((earliestExpiry - Date.now()) / (1000 * 60 * 60 * 24)));
      }

      expiringCount = assessmentsRes.rows.filter((r) => {
        const exp = r.expires_at ? new Date(r.expires_at).getTime() : new Date(r.created_at).getTime() + retentionDays * 86400000;
        const diffDays = (exp - Date.now()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }).length;
    }

    const isExpiringSoon = totalAssessments > 0 && (expiringCount > 0 || daysRemaining <= 7);

    res.json({
      retentionDays,
      totalAssessments,
      nextScheduledCleanupDate: nextCleanup,
      daysRemainingUntilCleanup: daysRemaining,
      expiringCount,
      isExpiringSoon,
      notificationAlert: isExpiringSoon
        ? `⚠️ Privacy & Data Retention Notice: ${expiringCount > 0 ? `${expiringCount} of your` : 'Your'} assessment record(s) will be automatically deleted in ${daysRemaining} days per your ${retentionDays}-day retention policy. You can extend retention or export your data anytime.`
        : null,
      lastExtendedAt: user?.retention_extended_at || null,
    });
  } catch (err) {
    console.error("Failed to fetch retention status:", err);
    res.status(500).json({ error: "Could not fetch retention details." });
  }
});

// POST /api/me/retention/extend - extends retention duration for all active assessments
router.post("/api/me/retention/extend", async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Authentication required." });

  try {
    const userRes = await pool.query(`SELECT retention_days FROM users WHERE id = $1`, [userId]);
    const retentionDays = userRes.rows[0]?.retention_days || 30;

    await pool.query(
      `UPDATE results SET expires_at = now() + ($2 || ' days')::INTERVAL WHERE user_id = $1`,
      [userId, retentionDays]
    );
    await pool.query(
      `UPDATE checkins SET expires_at = now() + ($2 || ' days')::INTERVAL WHERE user_id = $1`,
      [userId, retentionDays]
    );
    await pool.query(
      `UPDATE users SET retention_extended_at = now() WHERE id = $1`,
      [userId]
    );

    res.json({
      ok: true,
      message: `Your assessment data retention has been successfully extended by ${retentionDays} days from today.`,
      newExpiryDate: new Date(Date.now() + retentionDays * 86400000).toISOString(),
    });
  } catch (err) {
    console.error("Failed to extend retention:", err);
    res.status(500).json({ error: "Could not extend retention timeline." });
  }
});

// PATCH /api/me/retention/settings - updates user's preferred retention timeline
router.patch("/api/me/retention/settings", async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Authentication required." });

  const { retentionDays } = req.body;
  const validDays = [14, 30, 60, 90, 180, 365].includes(Number(retentionDays)) ? Number(retentionDays) : 30;

  try {
    await pool.query(
      `UPDATE users SET retention_days = $1, retention_extended_at = now() WHERE id = $2`,
      [validDays, userId]
    );
    await pool.query(
      `UPDATE results SET expires_at = now() + ($1 || ' days')::INTERVAL WHERE user_id = $2`,
      [validDays, userId]
    );
    await pool.query(
      `UPDATE checkins SET expires_at = now() + ($1 || ' days')::INTERVAL WHERE user_id = $2`,
      [validDays, userId]
    );

    res.json({
      ok: true,
      retentionDays: validDays,
      message: `Retention policy successfully updated to ${validDays} days.`,
    });
  } catch (err) {
    console.error("Failed to update retention setting:", err);
    res.status(500).json({ error: "Could not update retention settings." });
  }
});

// POST /api/me/retention/cleanup - purges expired assessment records
router.post("/api/me/retention/cleanup", async (req, res) => {
  try {
    const delResults = await pool.query(`DELETE FROM results WHERE expires_at IS NOT NULL AND expires_at < now()`);
    const delCheckins = await pool.query(`DELETE FROM checkins WHERE expires_at IS NOT NULL AND expires_at < now()`);
    res.json({
      ok: true,
      purgedResults: delResults.rowCount,
      purgedCheckins: delCheckins.rowCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Retention cleanup error:", err);
    res.status(500).json({ error: "Retention cleanup failed." });
  }
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

// GET /api/results/:id/videos - REAL, AI-curated video suggestions.
// Replaces the old static "resources" table lookup, which pointed to
// generic YouTube search-results pages instead of actual videos.
router.get("/api/results/:id/videos", async (req, res) => {
  try {
    const { id } = req.params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      return res.json([]);
    }

    const resultRow = await pool.query(
      `SELECT contributing_factors FROM results WHERE id = $1`,
      [id]
    );
    if (resultRow.rows.length === 0) return res.status(404).json({ error: "Result not found." });

    const factors = resultRow.rows[0].contributing_factors || [];
    if (factors.length === 0) return res.json([]);

    const { recommendVideoForFactor } = require("../services/videoRecommendation");
    // Get one AI-curated real video per contributing factor (capped at 3)
    const videos = await Promise.all(
      factors.slice(0, 3).map((factor) => recommendVideoForFactor(factor))
    );
    res.json(videos.filter(Boolean));
  } catch (err) {
    console.error("Video recommendation failed:", err);
    res.json([]);
  }
});

// POST /api/results/videos - Direct AI video recommendations for factors list
router.post("/api/results/videos", async (req, res) => {
  const { factors } = req.body || {};
  const factorList = Array.isArray(factors) ? factors : (typeof factors === "string" ? [factors] : ["general"]);

  try {
    const { recommendVideoForFactor } = require("../services/videoRecommendation");
    const videos = await Promise.all(
      factorList.slice(0, 3).map((factor) => recommendVideoForFactor(factor))
    );
    res.json(videos.filter(Boolean));
  } catch (err) {
    console.error("Direct video recommendation failed:", err);
    res.json([]);
  }
});

// GET /api/results/:id/resources - legacy compatibility fallback
router.get("/api/results/:id/resources", async (req, res) => {
  try {
    const resultRow = await pool.query(
      `SELECT contributing_factors FROM results WHERE id = $1`,
      [req.params.id]
    );
    if (resultRow.rows.length === 0) return res.status(404).json({ error: "Result not found." });

    const factors = resultRow.rows[0].contributing_factors;
    if (!factors || factors.length === 0) return res.json([]);

    const { recommendVideoForFactor } = require("../services/videoRecommendation");
    const videos = await Promise.all(
      factors.slice(0, 3).map((factor) => recommendVideoForFactor(factor))
    );
    res.json(videos.filter(Boolean));
  } catch (err) {
    res.json([]);
  }
});

module.exports = router;
