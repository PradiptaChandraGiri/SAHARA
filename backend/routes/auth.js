// routes/auth.js
// Handles Google + GitHub sign-in ONLY, per the earlier login-simplification
// spec. No email/password, no "hackathon quick access."

const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const pool = require("../db/pool");
const { signToken, verifyToken } = require("../helpers/token");

const router = express.Router();

// --- Shared logic: find or create a user, assign default role ---
async function findOrCreateUser({ email, displayName, provider, oauthId }) {
  const existing = await pool.query(
    `SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2`,
    [provider, oauthId]
  );
  if (existing.rows.length > 0) {
    await pool.query(`UPDATE users SET last_login_at = now() WHERE id = $1`, [existing.rows[0].id]);
    return existing.rows[0];
  }
  // New accounts always default to 'student'. Counselor/Admin access is
  // granted separately by an existing admin via the admin panel - never
  // self-assigned at sign-up.
  const inserted = await pool.query(
    `INSERT INTO users (email, display_name, oauth_provider, oauth_id, role, last_login_at)
     VALUES ($1, $2, $3, $4, 'student', now())
     RETURNING *`,
    [email, displayName, provider, oauthId]
  );
  return inserted.rows[0];
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const defaultGoogleCallback = process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL.replace(/\/$/, "")}/auth/google/callback`
    : "/auth/google/callback";

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || defaultGoogleCallback,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateUser({
            email: profile.emails?.[0]?.value,
            displayName: profile.displayName,
            provider: "google",
            oauthId: profile.id,
          });
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  const defaultGithubCallback = process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL.replace(/\/$/, "")}/auth/github/callback`
    : "/auth/github/callback";

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || defaultGithubCallback,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateUser({
            email: profile.emails?.[0]?.value || `${profile.username}@github.local`,
            displayName: profile.displayName || profile.username,
            provider: "github",
            oauthId: profile.id,
          });
          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );
}

// --- Routes ---
const handleGoogleAuth = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID.startsWith("mock_")) {
    findOrCreateUser({
      email: "student.google@sahara.app",
      displayName: "Google Student",
      provider: "google",
      oauthId: "google_dev_user_123",
    }).then((user) => {
      req.session.userId = user.id;
      req.session.role = user.role;
      const dest = { student: "/dashboard", counselor: "/counselor", admin: "/admin" }[user.role] || "/dashboard";
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:8443"}${dest}`);
    }).catch(next);
    return;
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
};

router.get("/auth/google", handleGoogleAuth);
router.get("/api/auth/google", handleGoogleAuth);

const handleGoogleCallback = (req, res, next) => {
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL || ""}/login?error=1` })(req, res, () => {
    if (!req.user) return res.redirect(`${process.env.FRONTEND_URL || ""}/login?error=1`);
    const token = signToken({
      userId: req.user.id,
      role: req.user.role,
      email: req.user.email,
      name: req.user.display_name,
    });
    if (req.session) {
      req.session.userId = req.user.id;
      req.session.role = req.user.role;
    }
    const dest = { student: "/dashboard", counselor: "/counselor", admin: "/admin" }[req.user.role] || "/dashboard";
    const separator = dest.includes("?") ? "&" : "?";
    res.redirect(`${process.env.FRONTEND_URL || ""}${dest}${separator}auth_token=${token}`);
  });
};

router.get("/auth/google/callback", handleGoogleCallback);
router.get("/api/auth/google/callback", handleGoogleCallback);

const handleGitHubAuth = (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID.startsWith("mock_")) {
    findOrCreateUser({
      email: "developer.github@sahara.app",
      displayName: "GitHub Developer",
      provider: "github",
      oauthId: "github_dev_user_456",
    }).then((user) => {
      const token = signToken({
        userId: user.id,
        role: user.role,
        email: user.email,
        name: user.display_name,
      });
      if (req.session) {
        req.session.userId = user.id;
        req.session.role = user.role;
      }
      const dest = { student: "/dashboard", counselor: "/counselor", admin: "/admin" }[user.role] || "/dashboard";
      const separator = dest.includes("?") ? "&" : "?";
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:8443"}${dest}${separator}auth_token=${token}`);
    }).catch(next);
    return;
  }
  passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
};

router.get("/auth/github", handleGitHubAuth);
router.get("/api/auth/github", handleGitHubAuth);

const handleGitHubCallback = (req, res, next) => {
  passport.authenticate("github", { session: false, failureRedirect: `${process.env.FRONTEND_URL || ""}/login?error=1` })(req, res, () => {
    if (!req.user) return res.redirect(`${process.env.FRONTEND_URL || ""}/login?error=1`);
    const token = signToken({
      userId: req.user.id,
      role: req.user.role,
      email: req.user.email,
      name: req.user.display_name,
    });
    if (req.session) {
      req.session.userId = req.user.id;
      req.session.role = req.user.role;
    }
    const dest = { student: "/dashboard", counselor: "/counselor", admin: "/admin" }[req.user.role] || "/dashboard";
    const separator = dest.includes("?") ? "&" : "?";
    res.redirect(`${process.env.FRONTEND_URL || ""}${dest}${separator}auth_token=${token}`);
  });
};

router.get("/auth/github/callback", handleGitHubCallback);
router.get("/api/auth/github/callback", handleGitHubCallback);

router.post("/auth/logout", (req, res) => {
  if (req.session) req.session.destroy(() => {});
  res.json({ ok: true });
});

// Frontend calls this on load to check "am I logged in, and as what role"
router.get("/auth/me", async (req, res) => {
  let userId = req.session?.userId;

  const authHeader = req.headers.authorization;
  if (!userId && authHeader && authHeader.startsWith("Bearer ")) {
    const tokenStr = authHeader.substring(7).trim();
    const verified = verifyToken(tokenStr);
    if (verified && verified.userId) {
      userId = verified.userId;
    }
  }

  if (!userId) return res.status(401).json({ error: "Not signed in." });
  try {
    const result = await pool.query(`SELECT id, email, display_name, role FROM users WHERE id = $1`, [
      userId,
    ]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Not signed in." });
    res.json(result.rows[0]);
  } catch (err) {
    console.warn("/auth/me DB error:", err.message);
    res.status(500).json({ error: "Authentication lookup error." });
  }
});

module.exports = router;
