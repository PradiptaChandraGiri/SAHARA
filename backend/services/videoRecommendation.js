// services/videoRecommendation.js
//
// This is the piece that hands the "figure out what to suggest" workload
// to the AI, per your request — but the AI's job is specifically to
// (1) turn a factor/topic into a good search query, and (2) pick and
// explain the best real result. It never invents a video or a URL itself
// — that's what caused the original bug. Real videos always come from
// services/youtube.js.

const Groq = require("groq-sdk");
const { searchYouTubeVideos } = require("./youtube");

let groq = null;
if (process.env.GROQ_API_KEY) {
  try {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  } catch (e) {
    console.warn("Groq initialization warning in videoRecommendation:", e.message);
  }
}

// Step 1: ask the AI for a good, specific search query
async function generateSearchQuery(context) {
  if (!groq) return context;
  try {
    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3.8-27b",
      messages: [
        {
          role: "system",
          content:
            "You turn a student's wellbeing context into ONE short, specific YouTube " +
            "search query (5-8 words) that would find a genuinely useful, calming, or " +
            "practical video for them. Reply with ONLY the search query text, nothing else " +
            "- no quotes, no explanation.",
        },
        { role: "user", content: context },
      ],
      temperature: 0.3,
      max_tokens: 30,
    });
    return completion.choices[0]?.message?.content?.trim() || context;
  } catch (e) {
    console.warn("generateSearchQuery fallback:", e.message);
    return context;
  }
}

// Step 2: given the REAL search results (never invented), ask the AI to
// pick the single best one and write a short, warm one-line reason.
async function pickBestVideo(videos, context) {
  if (!videos || videos.length === 0) return null;

  if (!groq) {
    return {
      ...videos[0],
      reason: `Recommended based on your recent check-in to support your wellbeing and daily routine.`,
    };
  }

  try {
    const videoList = videos
      .map((v, i) => `${i}. "${v.title}" by ${v.channelTitle} — ${v.description.slice(0, 100)}`)
      .join("\n");

    const completion = await groq.chat.completions.create({
      model: "qwen/qwen3.8-27b",
      messages: [
        {
          role: "system",
          content:
            "You pick the single most helpful video from a list for a student's situation, " +
            "and write ONE short, warm sentence explaining why. Reply in this exact format:\n" +
            "INDEX: <number>\nREASON: <one sentence>",
        },
        { role: "user", content: `Student's situation: ${context}\n\nOptions:\n${videoList}` },
      ],
      temperature: 0.5,
      max_tokens: 80,
    });

    const text = completion.choices[0]?.message?.content || "";
    const indexMatch = text.match(/INDEX:\s*(\d+)/i);
    const reasonMatch = text.match(/REASON:\s*(.+)/i);
    const index = indexMatch ? parseInt(indexMatch[1], 10) : 0;
    const reason = reasonMatch
      ? reasonMatch[1].trim()
      : `Recommended to support your focus and rest during study periods.`;

    const chosen = videos[Math.min(index, videos.length - 1)] || videos[0];
    return { ...chosen, reason };
  } catch (e) {
    console.warn("pickBestVideo fallback:", e.message);
    return {
      ...videos[0],
      reason: `Recommended based on your check-in factors to provide practical relief and focus.`,
    };
  }
}

// Full pipeline: context -> real, AI-curated video suggestion.
async function recommendVideo(context) {
  const query = await generateSearchQuery(context);
  const results = await searchYouTubeVideos(query, 5);
  if (!results || results.length === 0) return null;
  return pickBestVideo(results, context);
}

const FACTOR_CONTEXT = {
  high_exam_pressure: "This student is dealing with high exam pressure and stress about upcoming tests.",
  high_screen_time: "This student has high recreational screen time, possibly affecting sleep or focus.",
  insufficient_sleep: "This student isn't getting enough sleep and could use practical, gentle sleep guidance.",
  low_social_support: "This student reported feeling low on social support or connection lately.",
  academic_strain: "This student is feeling heavy coursework strain and academic overload.",
  financial_stress: "This student is managing academic demands while experiencing stress around living costs.",
};

async function recommendVideoForFactor(factorKey) {
  const normalized = String(factorKey).toLowerCase().replace(/\s+/g, "_");
  const context = FACTOR_CONTEXT[normalized] || `This student is navigating ${factorKey.replace(/_/g, " ")}.`;
  return recommendVideo(context);
}

module.exports = { recommendVideo, recommendVideoForFactor, generateSearchQuery };
