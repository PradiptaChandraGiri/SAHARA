// server.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");
const cron = require("node-cron");
const pool = require("./db/pool");

// Phase 1: Environment & Startup Verification Check
console.log("\n================ SAHARA BACKEND INITIALIZATION ================");
const required = [
  "DATABASE_URL", "SESSION_SECRET", "GROQ_API_KEY",
  "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN",
  "VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY",
];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.warn("⚠️ Missing required environment variables:", missing);
} else {
  console.log("✅ All core environment variables verified.");
}

// Database Connection Verification
pool.query("SELECT NOW() as db_time")
  .then((res) => console.log(`✅ PostgreSQL Database connected (${res.rows[0].db_time})`))
  .catch((err) => console.error("❌ PostgreSQL Database connection failed:", err.message));

const authRoutes = require("./routes/auth");
const checkinRoutes = require("./routes/checkins");
const resultsRoutes = require("./routes/results");
const aiRoutes = require("./routes/ai");
const whatsappRoutes = require("./routes/whatsapp");
const counselorRoutes = require("./routes/counselor");
const adminRoutes = require("./routes/admin");
const privacyRoutes = require("./routes/privacy");
const notificationRoutes = require("./routes/notifications");

const { runSchedulerTick } = require("./jobs/notificationScheduler");

const app = express();

// Twilio sends form-encoded data; everything else is JSON.
app.use(express.urlencoded({ extended: false })); // for /whatsapp-webhook
app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like curl, mobile apps)
      if (!origin) return callback(null, true);
      // Allow localhost on any port
      if (
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.includes("onrender.com") ||
        origin.includes("vercel.app")
      ) {
        return callback(null, true);
      }
      callback(null, true);
    },
    credentials: true, // required so the session cookie is sent
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "sahara_session_secret_2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

app.use(passport.initialize());

app.use(authRoutes);
app.use(checkinRoutes);
app.use(resultsRoutes);
app.use(aiRoutes);
app.use(whatsappRoutes);
app.use(counselorRoutes);
app.use(adminRoutes);
app.use(privacyRoutes);
app.use(notificationRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Serve built frontend assets
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/auth") || req.path.startsWith("/health") || req.path.startsWith("/whatsapp")) {
    return next();
  }
  res.sendFile(path.join(distPath, "index.html"));
});

// Schedule notification reminder tick every 15 minutes (runs at :00, :15, :30, :45)
cron.schedule("*/15 * * * *", () => {
  runSchedulerTick().catch((err) => console.error("Cron scheduler error:", err));
});

// Nightly Automatic Data Retention Cleanup (Runs daily at 00:00 midnight)
cron.schedule("0 0 * * *", async () => {
  try {
    const delResults = await pool.query(`DELETE FROM results WHERE expires_at IS NOT NULL AND expires_at < now()`);
    const delCheckins = await pool.query(`DELETE FROM checkins WHERE expires_at IS NOT NULL AND expires_at < now()`);
    if (delResults.rowCount > 0 || delCheckins.rowCount > 0) {
      console.log(`[Nightly Storage Purge] Automatically cleaned up ${delResults.rowCount} expired results and ${delCheckins.rowCount} expired check-ins.`);
    }
  } catch (err) {
    console.error("Nightly retention cleanup error:", err.message);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`SAHARA backend running on port ${PORT}`));
