// services/groq.js
// Groq: sub-second latency, 14,400 free requests/day, OpenAI-compatible SDK.
// Fast conversational responses + Dynamic AI Guidance & Rich YouTube Video/Notes Generator.

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
  defaultHeaders: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },
});

const BASE_SYSTEM_PROMPT =
  "You are SAHARA, a warm, supportive, and professional AI student wellbeing & academic success companion for university " +
  "students. Keep responses concise (2-4 sentences), calm, empathetic, and non-clinical. " +
  "You are not a therapist and should not attempt to diagnose. For topics like study techniques, exam stress, " +
  "sleep, or subject revision, be practical, and when helpful, provide structured bulleted notes or mention proven " +
  "learning protocols (like Pomodoro 25/5, Feynman technique, Active Recall, or Box Breathing). " +
  "Use minimal markdown - **bold** for emphasis, concise bullet points for study notes. Keep formatting clean and supportive.";

const GROQ_MODEL = "qwen/qwen3.8-27b";
const FALLBACK_MODEL = "openai/gpt-oss-120b";

function logGroqError(context, err) {
  if (err?.status === 429) {
    console.error(`[Groq Rate Limit (429)] ${context}: Rate limit or TPM quota reached.`, err.message);
  } else if (err?.status === 401) {
    console.error(`[Groq Auth Error (401)] ${context}: API key invalid or missing.`, err.message);
  } else if (err?.status === 404) {
    console.error(`[Groq Model Not Found (404)] ${context}: Model ${GROQ_MODEL} unavailable.`, err.message);
  } else if (err?.status >= 500) {
    console.error(`[Groq Server Error (${err.status})] ${context}:`, err.message);
  } else {
    console.error(`[Groq Error] ${context}:`, err?.message || err);
  }
}

// Verified YouTube resources catalog for university students across mental wellbeing & core disciplines
const VERIFIED_YT_MAP = {
  dsa_coding: {
    youtubeId: "8hly31xKli0",
    videoTitle: "Dynamic Programming & Algorithmic Problem Breakdown - freeCodeCamp",
    fallbackNotes: [
      "Identify the recursive subproblem structure and recognize overlapping subproblems.",
      "Draw the recursion state tree on paper to visualize base cases and branching.",
      "Apply a memoization hash/array table to collapse exponential time O(2^n) to polynomial O(n)."
    ]
  },
  calculus_math: {
    youtubeId: "WUvTyaaNkzM",
    videoTitle: "Calculus & Visual Intuition Problem Breakdown - 3Blue1Brown",
    fallbackNotes: [
      "Build geometric intuition for equations before memorizing mechanical steps.",
      "Work backward from sample questions to isolate prerequisite algebra gaps.",
      "Use spaced flashcard sprints to drill standard derivative/integral forms."
    ]
  },
  chemistry_science: {
    youtubeId: "Qp3xR7kYj34",
    videoTitle: "Organic Chemistry Mechanisms & Problem Solving - Professor Dave",
    fallbackNotes: [
      "Focus on electron density flow: track electron-rich nucleophiles attacking electrophiles.",
      "Practice drawing curved-arrow mechanisms on a whiteboard from memory.",
      "Test yourself on synthesis pathways without referencing textbook answer keys."
    ]
  },
  coursework_triage: {
    youtubeId: "4x7MkLDGnu8",
    videoTitle: "How to Manage Heavy University Coursework & Deadlines - College Info Geek",
    fallbackNotes: [
      "Triage assignments by grading percentage and immediate deadline priority.",
      "Dedicate the first 45 minutes of each day to the highest-weight deliverable.",
      "Eliminate decision fatigue by scheduling specific calendar slots for each module."
    ]
  },
  sleep: {
    youtubeId: "pL02HRFk2vo",
    videoTitle: "10-Minute Non-Sleep Deep Rest (NSDR) Protocol - Dr. Andrew Huberman",
    fallbackNotes: [
      "Engages parasympathetic tone to restore neuro-chemical energy and lower systemic cortisol.",
      "Practice double nasal inhales followed by one long unhurried exhale through the mouth.",
      "Helps offset the cognitive fatigue of 3-4 hours of lost sleep within 15 minutes."
    ]
  },
  breathing: {
    youtubeId: "m3-O74xEmVE",
    videoTitle: "Physiological Sigh: Fast Autonomic Nervous System Reset",
    fallbackNotes: [
      "Two rapid inhales through the nose, followed by one long, slow mouth exhalation.",
      "Instantly re-opens collapsed lung alveoli and drops elevated heart rate.",
      "Do 3-5 rounds right before walking into an exam or starting an assignment."
    ]
  },
  pomodoro: {
    youtubeId: "mNBmG24djoY",
    videoTitle: "How to Focus & Study Deeply with the 25/5 Pomodoro Method",
    fallbackNotes: [
      "Commit to exactly 25 minutes of single-task focus with zero digital notifications.",
      "Take 5 minutes of restorative break (water, walking, stretching) between sprints.",
      "4 sprints equals 100 minutes of high-retention study without cognitive burnout."
    ]
  },
  exam_stress: {
    youtubeId: "5qap5aO4i9A",
    videoTitle: "How to Eliminate Test Anxiety & Exam Panic - Dr. K",
    fallbackNotes: [
      "Reframe nervousness as physiological readiness rather than impending failure.",
      "Use the 5-4-3-2-1 sensory grounding technique if your mind goes blank.",
      "Tackle easiest 2 problems first to activate associative memory pathways."
    ]
  },
  active_recall: {
    youtubeId: "ukLnPbIffxE",
    videoTitle: "How to Study with Active Recall & Spaced Repetition - Ali Abdaal",
    fallbackNotes: [
      "Close your textbook/notes and write down everything you remember on a blank sheet.",
      "Only re-read sections where you found specific knowledge gaps.",
      "Review high-difficulty concepts 24h, 3 days, and 7 days before the exam."
    ]
  },
  procrastination: {
    youtubeId: "4x7MkLDGnu8",
    videoTitle: "How to Stop Procrastinating on Hard Assignments - Thomas Frank",
    fallbackNotes: [
      "Lower the activation threshold: commit to working on the task for just 2 minutes.",
      "Break the assignment into atomic steps (e.g., write the first heading).",
      "Motivation follows physical action, not the other way around."
    ]
  }
};

function enrichSuggestionWithVideo(sug) {
  const text = `${sug.title} ${sug.tag} ${sug.description}`.toLowerCase();
  let match = VERIFIED_YT_MAP.pomodoro;

  if (text.includes("dynamic programming") || text.includes("recursion") || text.includes("algorithm") || text.includes("dsa") || text.includes("coding") || text.includes("code") || text.includes("data structure")) {
    match = VERIFIED_YT_MAP.dsa_coding;
  } else if (text.includes("calculus") || text.includes("math") || text.includes("integral") || text.includes("derivative") || text.includes("algebra")) {
    match = VERIFIED_YT_MAP.calculus_math;
  } else if (text.includes("chemistry") || text.includes("organic") || text.includes("reaction") || text.includes("physics") || text.includes("biology")) {
    match = VERIFIED_YT_MAP.chemistry_science;
  } else if (text.includes("coursework") || text.includes("assignment") || text.includes("deadline") || text.includes("essay")) {
    match = VERIFIED_YT_MAP.coursework_triage;
  } else if (text.includes("sleep") || text.includes("night") || text.includes("insomnia") || text.includes("rest")) {
    match = VERIFIED_YT_MAP.sleep;
  } else if (text.includes("breath") || text.includes("sigh") || text.includes("panic") || text.includes("nervous")) {
    match = VERIFIED_YT_MAP.breathing;
  } else if (text.includes("exam") || text.includes("test") || text.includes("anxiety") || text.includes("stress")) {
    match = VERIFIED_YT_MAP.exam_stress;
  } else if (text.includes("recall") || text.includes("memor") || text.includes("notes") || text.includes("study") || text.includes("feynman")) {
    match = VERIFIED_YT_MAP.active_recall;
  } else if (text.includes("procrastinat") || text.includes("start") || text.includes("overwhelm")) {
    match = VERIFIED_YT_MAP.procrastination;
  }

  return {
    ...sug,
    youtubeId: sug.youtubeId || match.youtubeId,
    videoTitle: sug.videoTitle || match.videoTitle,
    keyNotes: Array.isArray(sug.keyNotes) && sug.keyNotes.length > 0 ? sug.keyNotes : match.fallbackNotes,
  };
}

// Non-streaming version - kept for WhatsApp bot and fallback endpoints
async function getChatReply(userMessage, conversationHistory = [], studentContext = null) {
  let systemPrompt = BASE_SYSTEM_PROMPT;
  if (studentContext) {
    systemPrompt += `\n[Student Evaluation Context: Wellbeing ${studentContext.overallWellbeing}%, Anxiety ${studentContext.anxietySignal}%, Primary Strains: ${(studentContext.factors || []).join(", ") || "General pressure"}. If student asks for revision notes, study strategies, or video recommendations, provide clear bulleted takeaway notes and actionable steps.]`;
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory
      .filter((m) => m && m.content)
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    { role: "user", content: userMessage },
  ];

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 300,
    });
    return { text: completion.choices[0].message.content, flaggedCrisis: false };
  } catch (err) {
    logGroqError("getChatReply (primary)", err);
    try {
      const completion = await groq.chat.completions.create({
        model: FALLBACK_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 300,
      });
      return { text: completion.choices[0].message.content, flaggedCrisis: false };
    } catch (e2) {
      logGroqError("getChatReply (fallback)", e2);
      return {
        text: "I hear you. Academic pressure can feel overwhelming, but taking a 5-minute break and organizing your top priority into a 25/5 Pomodoro sprint will help you regain focus. Let me know what subject you want to work on next!",
        flaggedCrisis: false,
        isFallback: true
      };
    }
  }
}

// Streaming version - used by the web AI Support page
async function streamChatReply(userMessage, conversationHistory = [], onChunk, studentContext = null) {
  let systemPrompt = BASE_SYSTEM_PROMPT;
  if (studentContext) {
    systemPrompt += `\n[Student Evaluation Context: Wellbeing ${studentContext.overallWellbeing}%, Anxiety ${studentContext.anxietySignal}%, Primary Strains: ${(studentContext.factors || []).join(", ") || "General pressure"}. If student asks for study notes, concepts, or videos, format key takeaway notes with clean bullet points.]`;
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory
      .filter((m) => m && m.content)
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    { role: "user", content: userMessage },
  ];

  let stream;
  try {
    stream = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 320,
      stream: true,
    });
  } catch (err) {
    logGroqError("streamChatReply (primary)", err);
    try {
      stream = await groq.chat.completions.create({
        model: FALLBACK_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 320,
        stream: true,
      });
    } catch (e2) {
      logGroqError("streamChatReply (fallback)", e2);
      const fallbackReply = "I hear you. 💚 When study demands peak, try a 25-minute Pomodoro focus block followed by 5 minutes of restorative breathing. What subject or task feels heaviest today?";
      for (const word of fallbackReply.split(" ")) {
        onChunk(word + " ");
        await new Promise((r) => setTimeout(r, 20));
      }
      return fallbackReply;
    }
  }

  let fullText = "";
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || "";
    if (delta) {
      fullText += delta;
      onChunk(delta);
    }
  }
  return fullText;
}

// Generates dynamic, real-time AI guidance & custom suggestions + full video & notes analysis
async function generatePersonalizedSuggestions(assessmentSummary) {
  const prompt = `Provide your response as a valid JSON object.
You are SAHARA AI, an elite university academic wellbeing and mental resilience specialist.
A student just completed their wellbeing check-in with these exact metrics:
- Overall Wellbeing Score: ${assessmentSummary.overallWellbeing || 65}%
- Anxiety Signal: ${assessmentSummary.anxietySignal || 60}%
- Academic Strain: ${assessmentSummary.academicStrain || 55}%
- Risk Classification: ${assessmentSummary.riskLevel || 'Moderate'}
- Identified Factors: ${(assessmentSummary.factors || []).join(', ') || 'Academic workload'}
- Daily Sleep: ${assessmentSummary.sleepHours || 6} hours
- Exam Pressure (0-10): ${assessmentSummary.examPressure || 7}
- Study Hours/day: ${assessmentSummary.studyHours || 5}

Generate an individualized guidance package formatted as strict JSON with this exact schema:
{
  "aiSynthesis": "2-3 sentence deeply empathetic analysis explaining how their specific sleep, exam pressure, and study combination impacts their nervous system, and identifying their single highest leverage recovery point this week.",
  "suggestions": [
    {
      "id": "sug_1",
      "title": "Creative, compelling, actionable title",
      "tag": "Category (e.g. Sleep Optimization, Exam Grounding, Focus Rhythm, Nervous System Reset, Academic Pacing)",
      "type": "video",
      "duration": "5 min protocol",
      "description": "2-sentence practical explanation tailored precisely to their metrics.",
      "actionStep": "One concrete physical or cognitive micro-action they can do in the next 2 minutes.",
      "videoTitle": "Recommended educational/mindfulness video title",
      "keyNotes": [
        "1st concise core study/wellbeing note explaining the mechanism",
        "2nd actionable takeaway on how to apply it during exam prep",
        "3rd common mistake to avoid"
      ]
    },
    {
      "id": "sug_2",
      "title": "Second compelling title",
      "tag": "Category",
      "type": "video",
      "duration": "4 min reset",
      "description": "2-sentence practical explanation.",
      "actionStep": "One concrete micro-action.",
      "videoTitle": "Video or Protocol Title",
      "keyNotes": [
        "Core mechanism note",
        "Step-by-step application note",
        "Key takeaway"
      ]
    },
    {
      "id": "sug_3",
      "title": "Third compelling title",
      "tag": "Category",
      "type": "video",
      "duration": "3 min guide",
      "description": "2-sentence practical explanation.",
      "actionStep": "One concrete micro-action.",
      "videoTitle": "Video or Protocol Title",
      "keyNotes": [
        "Core mechanism note",
        "Step-by-step application note",
        "Key takeaway"
      ]
    }
  ]
}
Ensure every suggestion provides high-value educational/wellbeing notes for university students. Return ONLY valid JSON.`;

  let rawResult;
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
    rawResult = JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    logGroqError("generatePersonalizedSuggestions (primary)", err);
    try {
      const completion = await groq.chat.completions.create({
        model: FALLBACK_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.75,
        response_format: { type: 'json_object' }
      });
      rawResult = JSON.parse(completion.choices[0].message.content);
    } catch (e2) {
      logGroqError("generatePersonalizedSuggestions (fallback)", e2);
      rawResult = {
        isFallback: true,
        aiSynthesis: `Based on your evaluation, your high exam pressure and current sleep patterns are the main contributors to your strain level. Focusing on a structured wind-down routine and 25-minute Pomodoro study sprints will provide the quickest relief this week.`,
        suggestions: [
          {
            id: "sug_def_1",
            title: "5-Minute Somatic Breathing Reset",
            tag: "Nervous System Reset",
            type: "video",
            duration: "5 min video & notes",
            description: "A quick physiological sigh exercise that instantly lowers elevated heart rate before exam sessions.",
            actionStep: "Take two deep nasal breaths, followed by one long unhurried exhale through your mouth. Repeat 5 times.",
            videoTitle: "Physiological Sigh: Fast Autonomic Nervous System Reset",
            keyNotes: [
              "Two rapid inhales through nose + one long mouth exhale drops acute heart rate.",
              "Rebalances carbon dioxide ratio in the bloodstream to halt panic signals.",
              "Use immediately when sitting down at your exam desk."
            ]
          },
          {
            id: "sug_def_2",
            title: "The 25/5 Deep Work Pacing Method",
            tag: "Focus Rhythm",
            type: "video",
            duration: "4 min video & notes",
            description: "Break heavy coursework into 25-minute single-focus blocks with mandatory screen-free breaks.",
            actionStep: "Set a timer for 25 minutes on your next study task and put your phone in another room.",
            videoTitle: "How to Focus & Study Deeply with the 25/5 Pomodoro Method",
            keyNotes: [
              "Single-task focus prevents cognitive fatigue and task switching friction.",
              "5-minute screen-free rest allows hippocampus to consolidate recent memories.",
              "Repeat for 4 cycles for maximum study retention."
            ]
          },
          {
            id: "sug_def_3",
            title: "Pre-Sleep Digital Wind-Down Protocol",
            tag: "Sleep Optimization",
            type: "video",
            duration: "3 min guide & notes",
            description: "Simple behavioral routine to lower blue-light stimulation and prevent deadline rumination in bed.",
            actionStep: "Write down your top 3 tasks for tomorrow on a physical notepad, then dim screens 30 minutes before sleep.",
            videoTitle: "10-Minute Non-Sleep Deep Rest (NSDR) Protocol - Dr. Andrew Huberman",
            keyNotes: [
              "Externalize tomorrow's to-do list onto physical paper to stop nocturnal rumination.",
              "Dim ambient overhead lights 30 minutes before sleep to trigger melatonin release.",
              "10 minutes of NSDR in bed resets autonomic nervous system for deep restorative sleep."
            ]
          }
        ]
      };
    }
  }

  // Ensure each suggestion is enriched with a verified working YouTube video and structured notes
  if (rawResult && Array.isArray(rawResult.suggestions)) {
    rawResult.suggestions = rawResult.suggestions.map(enrichSuggestionWithVideo);
  }

  return rawResult;
}

// Generates dynamic AI coaching for specific student concerns (Results page follow-up)
async function generateFollowupCoaching(concern, assessmentSummary = {}) {
  const prompt = `You are SAHARA AI, a compassionate and expert university academic & mental wellbeing specialist.
A student just reviewed their wellbeing results (Score: ${assessmentSummary.overallWellbeing || 65}%, Factors: ${(assessmentSummary.factors || []).join(', ') || 'Academic pressure'}).
They shared this specific concern or academic difficulty:
"${concern}"

Generate an empathetic, immediate, professional action response as strict JSON:
{
  "headline": "A validating 4-8 word title (e.g. Mastering Dynamic Programming Recursion Trees)",
  "insight": "2 sentences of warm psychological validation explaining why this happens under college strain.",
  "microAction": "1 clear, highly actionable 5-minute step they can take right now to regain control.",
  "suggestedTopic": "A prompt they can click to continue talking to SAHARA AI in chat",
  "studyNotes": [
    "1st concise high-yield note/strategy for dealing with this specific difficulty",
    "2nd memory/revision pacing takeaway",
    "3rd actionable mindset shift"
  ],
  "videoTitle": "Exact video guide title tailored specifically to their problem"
}
Return ONLY valid JSON.`;

  let coachingResult;
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });
    coachingResult = JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    logGroqError("generateFollowupCoaching (primary)", err);
    try {
      const completion = await groq.chat.completions.create({
        model: FALLBACK_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });
      coachingResult = JSON.parse(completion.choices[0].message.content);
    } catch (e2) {
      logGroqError("generateFollowupCoaching (fallback)", e2);
      coachingResult = {
        isFallback: true,
        headline: "Navigating Your Current Workload",
        insight: "When exams and coursework pile up simultaneously, our working memory gets saturated, creating a freeze response. This is a normal neurochemical reaction to prolonged stress, not a lack of capability.",
        microAction: "Pick just ONE assignment, open it, and spend exactly 5 minutes outlining the first small paragraph without judging the quality.",
        suggestedTopic: `Help me break down my study plan for ${concern}`,
        studyNotes: [
          "Reduce friction: Break overwhelming tasks into 5-minute atomic micro-actions.",
          "Use active recall instead of passive re-reading to maximize study efficiency.",
          "Take a mandatory 5-minute walk between study blocks to clear working memory."
        ],
        videoTitle: "How to Focus & Study Deeply with the 25/5 Pomodoro Method"
      };
    }
  }

  // Attach relevant domain & topic video recommendation dynamically
  const text = `${concern} ${coachingResult.headline} ${(coachingResult.studyNotes || []).join(' ')} ${coachingResult.videoTitle || ''}`.toLowerCase();
  let videoMatch = VERIFIED_YT_MAP.pomodoro;

  if (text.includes("dynamic programming") || text.includes("recursion") || text.includes("algorithm") || text.includes("dsa") || text.includes("coding") || text.includes("code") || text.includes("data structure") || text.includes("tree")) {
    videoMatch = VERIFIED_YT_MAP.dsa_coding;
  } else if (text.includes("calculus") || text.includes("math") || text.includes("integral") || text.includes("derivative") || text.includes("algebra") || text.includes("matrix")) {
    videoMatch = VERIFIED_YT_MAP.calculus_math;
  } else if (text.includes("chemistry") || text.includes("organic") || text.includes("reaction") || text.includes("physics") || text.includes("biology") || text.includes("science")) {
    videoMatch = VERIFIED_YT_MAP.chemistry_science;
  } else if (text.includes("coursework") || text.includes("assignment") || text.includes("deadline") || text.includes("essay") || text.includes("project")) {
    videoMatch = VERIFIED_YT_MAP.coursework_triage;
  } else if (text.includes("sleep") || text.includes("tired") || text.includes("insomnia") || text.includes("wake")) {
    videoMatch = VERIFIED_YT_MAP.sleep;
  } else if (text.includes("panic") || text.includes("breath") || text.includes("anxious") || text.includes("heart") || text.includes("nervous")) {
    videoMatch = VERIFIED_YT_MAP.breathing;
  } else if (text.includes("exam") || text.includes("midterm") || text.includes("test") || text.includes("finals")) {
    videoMatch = VERIFIED_YT_MAP.exam_stress;
  } else if (text.includes("subject") || text.includes("memor") || text.includes("notes") || text.includes("study") || text.includes("understand")) {
    videoMatch = VERIFIED_YT_MAP.active_recall;
  } else if (text.includes("procrastinat") || text.includes("focus") || text.includes("distraction")) {
    videoMatch = VERIFIED_YT_MAP.pomodoro;
  }

  coachingResult.recommendedVideo = {
    youtubeId: videoMatch.youtubeId,
    videoTitle: coachingResult.videoTitle || videoMatch.videoTitle,
  };

  return coachingResult;
}

// Conversational Symptom / Strain NLP Parser (Ada Health & Claude Healthcare Style)
async function parseSymptomsFromText(freeText) {
  const prompt = `You are a clinical student mental health intake specialist.
A university student submitted the following natural language description of their symptoms and academic strain:
"${freeText}"

Extract and estimate their assessment metrics accurately formatted as strict JSON:
{
  "age": 21,
  "gender": "Female",
  "academic_year": 3,
  "department": "Engineering",
  "sleep_hours": 4.5,
  "study_hours_per_day": 7.0,
  "exam_pressure": 8,
  "academic_performance": 6,
  "stress_level": 8,
  "physical_activity": 3,
  "social_support": 4,
  "screen_time": 8.0,
  "internet_usage": 6.0,
  "financial_stress": 5,
  "family_expectation": 7,
  "symptomSummary": "1-2 sentence clinical summary of the student's physical, psychological, and academic symptoms."
}
Ensure numeric ranges are valid (scale 1-10 for ratings, realistic hours for sleep/study/screen). Return ONLY valid JSON.`;

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    const completion = await groq.chat.completions.create({
      model: 'groq/compound-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
    return JSON.parse(completion.choices[0].message.content);
  }
}

module.exports = {
  getChatReply,
  streamChatReply,
  generatePersonalizedSuggestions,
  generateFollowupCoaching,
  parseSymptomsFromText,
};

