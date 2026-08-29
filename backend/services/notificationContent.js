// services/notificationContent.js
//
// Generates the actual text for a reminder. Every message here is
// deliberately written in "cold" framing (calm, inviting, no urgency) —
// research on stress-management notifications specifically warns against
// alarm-style framing for exactly this kind of product. Nothing here
// references streaks, missed days, or guilt — matches the Dashboard's
// existing "You're doing okay" voice.

const pool = require("../db/pool");

// Maps a contributing factor to a specific, useful evening/morning
// suggestion — reuses the same factor keys as the resource library and
// the runtime YouTube search feature, so this stays in sync with those.
const FACTOR_SUGGESTIONS = {
  insufficient_sleep: {
    evening: "A wind-down routine can make a real difference tonight — even 10 quiet minutes before bed helps.",
    morning: "How did last night's sleep feel? A short walk in daylight early on can help reset your rhythm.",
  },
  high_exam_pressure: {
    evening: "If exams are weighing on you, a short breathing reset before you stop for the night might help you actually rest.",
    morning: "A quick Pomodoro session (25 min focus, 5 min break) can make today's studying feel more manageable.",
  },
  high_screen_time: {
    evening: "An easy one for tonight: try stepping away from screens 30 minutes before bed.",
    morning: "No pressure today — just a gentle nudge to build in a few screen-free minutes if you can.",
  },
  low_social_support: {
    evening: "Reaching out to one person today, even briefly, can genuinely help.",
    morning: "Something small: is there someone you could check in with today?",
  },
  high_study_load: {
    evening: "You've worked hard today. Giving your mind space to pause tonight helps consolidate what you've learned.",
    morning: "Break today's study goals into 2 small priorities. Small, steady steps reduce overwhelm.",
  },
  academic_stress: {
    evening: "Remember you're more than your coursework. Allow yourself permission to recharge tonight.",
    morning: "Take 3 deep breaths before opening your notes today. You've got this, one step at a time.",
  }
};

// Generic fallbacks used when there's no specific flagged factor yet
// (e.g. brand-new student, or their last check-in was "doing okay").
const GENERIC = {
  morning: "Good morning. A 2-minute check-in can help you start the day with a clearer picture of how you're doing — totally optional, whenever works for you.",
  evening: "However today went, a short wind-down moment before bed is worth it. Your SAHARA space is here whenever you want it.",
  contextual: "Just checking in — no pressure, just here if you want a moment to reset.",
};

async function getLatestFactors(userId) {
  try {
    const result = await pool.query(
      `SELECT contributing_factors FROM results WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    return result.rows[0]?.contributing_factors || [];
  } catch (e) {
    console.warn("getLatestFactors error:", e.message);
    return [];
  }
}

async function generateReminderContent(userId, type) {
  // type: 'morning' | 'evening' | 'contextual'
  const factors = await getLatestFactors(userId);

  if (factors.length > 0) {
    // Pick ONE factor to focus on, not a list — a single, specific
    // suggestion is more actionable and less overwhelming than several.
    for (const factor of factors) {
      const normalizedFactor = String(factor).toLowerCase().replace(/\s+/g, '_');
      const suggestion = FACTOR_SUGGESTIONS[normalizedFactor];
      if (suggestion && suggestion[type]) {
        return suggestion[type];
      }
    }
  }

  return GENERIC[type] || GENERIC.contextual;
}

module.exports = { generateReminderContent };
