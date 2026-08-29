// services/whatsappOutbound.js
//
// IMPORTANT constraint: WhatsApp/Twilio does NOT allow freely sending
// arbitrary text to a user outside a 24-hour window since their last
// message to you. Proactive reminders like these MUST use a pre-approved
// Message Template (Twilio Content API) - this is a WhatsApp platform
// rule, not a Twilio limitation, and there's no way around it for
// business-initiated conversations.
//
// Template name: sahara_wellness_reminder
// Category: UTILITY
// Body: "Hi! {{1}}"
//
// Approval typically takes anywhere from a few hours to a couple of days.
// Until it's approved, this logs clear status instead of failing silently.

const twilio = require("twilio");
const pool = require("../db/pool");

let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  } catch (e) {
    console.warn("Twilio client initialization warning:", e.message);
  }
}

const REMINDER_TEMPLATE_SID = process.env.CONTENT_SID_WELLNESS_REMINDER;

async function sendWhatsAppReminder(userId, message) {
  if (!client) {
    console.warn("[WhatsApp Outbound] Twilio credentials not configured.");
    return { ok: false, status: "twilio_not_configured" };
  }

  try {
    const userResult = await pool.query(
      `SELECT whatsapp_number, phone FROM users WHERE id = $1`,
      [userId]
    );
    const phoneNumber = userResult.rows[0]?.whatsapp_number || userResult.rows[0]?.phone;
    if (!phoneNumber) {
      return { ok: false, status: "no_phone_linked" };
    }

    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');

    // Check if approved content template SID is present
    if (REMINDER_TEMPLATE_SID && REMINDER_TEMPLATE_SID.startsWith("HX") && !REMINDER_TEMPLATE_SID.includes("pending")) {
      try {
        const twilioRes = await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886",
          to: cleanNumber.startsWith("whatsapp:") ? cleanNumber : `whatsapp:${cleanNumber}`,
          contentSid: REMINDER_TEMPLATE_SID,
          contentVariables: JSON.stringify({ "1": message }),
        });
        console.log("[WhatsApp Outbound] Reminder delivered via template:", twilioRes.sid);
        return { ok: true, sid: twilioRes.sid, status: "delivered_via_template" };
      } catch (templateErr) {
        console.warn("[WhatsApp Outbound] Template send failed, falling back to direct message if in session:", templateErr.message);
      }
    }

    // Direct message fallback (works within 24h conversation sandbox window)
    try {
      const directRes = await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886",
        to: cleanNumber.startsWith("whatsapp:") ? cleanNumber : `whatsapp:${cleanNumber}`,
        body: `🌿 *SAHARA Wellbeing Reminder*\n\n${message}\n\n_Reply 'stop' to pause or 'checkin' to start intake._`,
      });
      console.log("[WhatsApp Outbound] Direct session reminder sent:", directRes.sid);
      return { ok: true, sid: directRes.sid, status: "delivered_direct_sandbox" };
    } catch (directErr) {
      console.warn(
        `[WhatsApp Outbound] Outbound reminder could not be sent outside active 24h window without approved template. ` +
        `Template status: CONTENT_SID_WELLNESS_REMINDER (${REMINDER_TEMPLATE_SID || 'not set'}). Error: ${directErr.message}`
      );
      return {
        ok: false,
        status: "template_approval_required",
        error: directErr.message,
      };
    }
  } catch (err) {
    console.error("[WhatsApp Outbound] Unexpected error:", err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = { sendWhatsAppReminder };
