// api/index.js - Vercel Serverless Function entry point for SAHARA API
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");

const authRoutes = require(path.join(__dirname, "../backend/routes/auth.js"));
const checkinRoutes = require(path.join(__dirname, "../backend/routes/checkins.js"));
const resultsRoutes = require(path.join(__dirname, "../backend/routes/results.js"));
const aiRoutes = require(path.join(__dirname, "../backend/routes/ai.js"));
const whatsappRoutes = require(path.join(__dirname, "../backend/routes/whatsapp.js"));
const counselorRoutes = require(path.join(__dirname, "../backend/routes/counselor.js"));
const adminRoutes = require(path.join(__dirname, "../backend/routes/admin.js"));
const privacyRoutes = require(path.join(__dirname, "../backend/routes/privacy.js"));
const notificationRoutes = require(path.join(__dirname, "../backend/routes/notifications.js"));

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "sahara-secret-session-v1-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
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

app.get("/api/health", (req, res) => res.json({ status: "ok", environment: "vercel-serverless", timestamp: new Date().toISOString() }));

export default app;
