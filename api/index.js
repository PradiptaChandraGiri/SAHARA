// api/index.js - Vercel Serverless Function entry point for SAHARA API
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");

const authRoutes = require("../backend/routes/auth");
const checkinRoutes = require("../backend/routes/checkins");
const resultsRoutes = require("../backend/routes/results");
const aiRoutes = require("../backend/routes/ai");
const whatsappRoutes = require("../backend/routes/whatsapp");
const counselorRoutes = require("../backend/routes/counselor");
const adminRoutes = require("../backend/routes/admin");
const privacyRoutes = require("../backend/routes/privacy");

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

app.get("/api/health", (req, res) => res.json({ status: "ok", environment: "vercel-serverless" }));

module.exports = app;
