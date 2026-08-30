// middleware/auth.js
const pool = require("../db/pool");

const { verifyToken } = require("../helpers/token");

// Reads the logged-in user from Bearer header or session.
function requireAuth(req, res, next) {
  let userId = req.session ? req.session.userId : null;
  let role = req.session ? req.session.role : null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const tokenStr = authHeader.substring(7).trim();
    const verified = verifyToken(tokenStr);
    if (verified && verified.userId) {
      userId = verified.userId;
      role = verified.role || role;
    }
  }

  if (!userId) {
    return res.status(401).json({ error: "Not signed in." });
  }

  req.userId = userId;
  req.userRole = role;
  if (req.session) {
    req.session.userId = userId;
    req.session.role = role;
  }
  next();
}

// Restricts a route to specific roles. Use AFTER requireAuth.
// Example: router.get('/admin/stats', requireAuth, requireRole('admin'), handler)
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.session.role)) {
      return res.status(403).json({ error: "You don't have access to this." });
    }
    next();
  };
}

// A student can only ever act on their own records. Use this on any route
// that takes a :userId or similar param, so a student can't read someone
// else's data just by changing the URL.
function requireSelfOrStaff(paramName = "userId") {
  return (req, res, next) => {
    const targetId = req.params[paramName];
    const isSelf = targetId === req.session.userId;
    const isStaff = req.session.role === "counselor" || req.session.role === "admin";
    if (!isSelf && !isStaff) {
      return res.status(403).json({ error: "You can only access your own data." });
    }
    next();
  };
}

// Logs every time a counselor or admin views a specific student's data.
// Call this explicitly inside a route handler after confirming access -
// don't log every single request, only ones that touch another person's
// sensitive data.
async function logAudit({ actorId, actorRole, action, targetId }) {
  try {
    await pool.query(
      `INSERT INTO audit_log (actor_id, actor_role, action, target_id)
       VALUES ($1, $2, $3, $4)`,
      [actorId, actorRole, action, targetId || null]
    );
  } catch (err) {
    // Never let a logging failure break the actual request -
    // just log the failure itself for later investigation.
    console.error("Failed to write audit log:", err);
  }
}

module.exports = { requireAuth, requireRole, requireSelfOrStaff, logAudit };
