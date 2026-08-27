// routes/whatsapp.js
const express = require("express");
const twilio = require("twilio");
const pool = require("../db/pool");
const { scoreCheckin } = require("../services/model");
const { getChatReply } = require("../services/gemini");

const router = express.Router();
const MessagingResponse = twilio.twiml.MessagingResponse;

// Twilio signs every webhook request - validate it so random people can't
// POST fake messages to this endpoint and mess with your data.
function validateTwilioRequest(req, res, next) {
  const signature = req.headers["x-twilio-signature"];
  const url = `${process.env.PUBLIC_BACKEND_URL}/whatsapp-webhook`;
  const isValid = twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN, signature, url, req.body);
  if (!isValid && process.env.NODE_ENV === "production") {
    return res.status(403).send("Invalid Twilio signature");
  }
  next();
}

async function getOrCreateSession(phoneNumber) {
  const existing = await pool.query(`SELECT * FROM whatsapp_sessions WHERE phone_number = $1`, [phoneNumber]);
  if (existing.rows.length > 0) return existing.rows[0];
  const inserted = await pool.query(
    `INSERT INTO whatsapp_sessions (phone_number) VALUES ($1) RETURNING *`,
    [phoneNumber]
  );
  return inserted.rows[0];
}

async function saveSession(phoneNumber, step, answers) {
  await pool.query(
    `UPDATE whatsapp_sessions SET current_step = $2, answers = $3, updated_at = now()
     WHERE phone_number = $1`,
    [phoneNumber, step, JSON.stringify(answers)]
  );
}

// POST /whatsapp-webhook - Twilio calls this every time a message arrives.
router.post("/whatsapp-webhook", validateTwilioRequest, async (req, res) => {
  const from = req.body.From; // e.g. "whatsapp:+15551234567"
  const body = (req.body.Body || "").trim();
  const twiml = new MessagingResponse();

  try {
    const session = await getOrCreateSession(from);

    if (body.toLowerCase() === "checkin" || session.current_step === "start") {
      twiml.message(
        "Hi! I'm SAHARA. Let's do a quick wellbeing check-in — 5 short questions. " +
        "First: how many hours did you sleep last night?"
      );
      await saveSession(from, "awaiting_sleep", {});
    } else if (session.current_step === "awaiting_sleep") {
      const answers = { ...session.answers, sleep_hours: parseFloat(body) };
      twiml.message("Got it. On a scale of 0-10, how would you rate your stress level today?");
      await saveSession(from, "awaiting_stress", answers);
    } else if (session.current_step === "awaiting_stress") {
      const answers = { ...session.answers, stress_level: parseFloat(body) };
      twiml.message("Thanks. How many hours a day do you spend studying?");
      await saveSession(from, "awaiting_study", answers);
    } else if (session.current_step === "awaiting_study") {
      // Real flow: continue collecting the remaining fields the model
      // needs (exam_pressure, screen_time, etc.) the same way as above.
      // Shortened here for clarity - extend with the same pattern.
      const answers = { ...session.answers, study_hours_per_day: parseFloat(body) };

      // Once all required fields are collected, score it:
      const scored = await scoreCheckin({
        age: 20, gender: "Other", academic_year: 2, // TODO: collect these too
        sleep_hours: answers.sleep_hours,
        stress_level: answers.stress_level,
        study_hours_per_day: answers.study_hours_per_day,
        exam_pressure: 5, academic_performance: 70, physical_activity: 3,
        social_support: 5, screen_time: 5, internet_usage: 4,
        financial_stress: 4, family_expectation: 5,
      });

      twiml.message(
        `Your overall wellbeing signal today: ${scored.overallWellbeing}%. ` +
        `Risk level: ${scored.riskLevel}. Want study tips or someone to talk to? ` +
        `Reply "resources" or "counselor."`
      );
      await saveSession(from, "start", {}); // reset for next check-in
    } else if (body.toLowerCase() === "resources") {
      const reply = await getChatReply("Suggest a study tip and a sleep tip for a student.");
      twiml.message(reply.text);
    } else {
      // Fall through to general chat, with the same crisis-routing logic
      // used on the website.
      const reply = await getChatReply(body);
      twiml.message(reply.text);
    }
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    twiml.message("Sorry, something went wrong on our end. Please try again in a moment.");
  }

  res.type("text/xml").send(twiml.toString());
});

module.exports = router;
