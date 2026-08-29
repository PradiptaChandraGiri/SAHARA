// server.js
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");
const cron = require("node-cron");

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

// Schedule notification reminder tick every 15 minutes (runs at :00, :15, :30, :45)
cron.schedule("*/15 * * * *", () => {
  runSchedulerTick().catch((err) => console.error("Cron scheduler error:", err));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`SAHARA backend running on port ${PORT}`));
