// server.js
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");

const authRoutes = require("./routes/auth");
const checkinRoutes = require("./routes/checkins");
const resultsRoutes = require("./routes/results");
const aiRoutes = require("./routes/ai");
const whatsappRoutes = require("./routes/whatsapp");
const counselorRoutes = require("./routes/counselor");
const adminRoutes = require("./routes/admin");
const privacyRoutes = require("./routes/privacy");

const app = express();

// Twilio sends form-encoded data; everything else is JSON.
app.use(express.urlencoded({ extended: false })); // for /whatsapp-webhook
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // required so the session cookie is sent
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
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

app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`SAHARA backend running on port ${PORT}`));
