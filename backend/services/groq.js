// services/groq.js
// Groq: sub-second latency, 14,400 free requests/day, OpenAI-compatible SDK.
// Fast conversational responses + Dynamic AI Guidance & Suggestions Generator.

const Groq = require("groq-sdk");

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set on the server.");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const BASE_SYSTEM_PROMPT =
  "You are SAHARA, a warm, supportive, and professional AI student wellbeing companion for university " +
  "students. Keep responses concise (2-4 sentences), calm, empathetic, and non-clinical. " +
  "You are not a therapist and should not attempt to diagnose. For low-stakes " +
  "topics like study techniques, sleep habits, or exam stress, be conversational, " +
  "practical, and helpful. If a student seems to be struggling significantly, gently " +
  "encourage them to use the 'Message a counselor' option. " +
  "Use minimal markdown - occasional **bold** for emphasis is fine, but " +
  "avoid headers, nested lists, or code blocks. Keep formatting light, " +
  "this is a casual supportive chat, not a document.";

const GROQ_MODEL = "openai/gpt-oss-120b";

// Non-streaming version - kept for WhatsApp bot and fallback endpoints
async function getChatReply(userMessage, conversationHistory = [], studentContext = null) {
  let systemPrompt = BASE_SYSTEM_PROMPT;
  if (studentContext) {
    systemPrompt += `\n[Student Evaluation Context: Wellbeing ${studentContext.overallWellbeing}%, Anxiety ${studentContext.anxietySignal}%, Primary Strains: ${(studentContext.factors || []).join(", ") || "General pressure"}. Naturally weave in empathy for their situation when relevant.]`;
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
      max_tokens: 220,
    });
    return { text: completion.choices[0].message.content, flaggedCrisis: false };
  } catch (err) {
    const completion = await groq.chat.completions.create({
      model: "groq/compound-mini",
      messages,
      temperature: 0.7,
      max_tokens: 220,
    });
    return { text: completion.choices[0].message.content, flaggedCrisis: false };
  }
}

// Streaming version - used by the web AI Support page
async function streamChatReply(userMessage, conversationHistory = [], onChunk, studentContext = null) {
  let systemPrompt = BASE_SYSTEM_PROMPT;
  if (studentContext) {
    systemPrompt += `\n[Student Evaluation Context: Wellbeing ${studentContext.overallWellbeing}%, Anxiety ${studentContext.anxietySignal}%, Primary Strains: ${(studentContext.factors || []).join(", ") || "General pressure"}. Naturally weave in empathy for their situation when relevant.]`;
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
      max_tokens: 240,
      stream: true,
    });
  } catch (err) {
    stream = await groq.chat.completions.create({
      model: "groq/compound-mini",
      messages,
      temperature: 0.7,
      max_tokens: 240,
      stream: true,
    });
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

// Generates dynamic, real-time AI guidance & custom suggestions for every student assessment
async function generatePersonalizedSuggestions(assessmentSummary) {
  const prompt = `You are SAHARA AI, an elite university academic wellbeing and mental resilience specialist.
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
      "type": "tool",
      "duration": "e.g. 4 min protocol",
      "description": "2-sentence practical explanation tailored precisely to their metrics.",
      "actionStep": "One concrete physical or cognitive micro-action they can do in the next 2 minutes."
    },
    {
      "id": "sug_2",
      "title": "Second compelling title",
      "tag": "Category",
      "type": "video",
      "duration": "e.g. 5 min reset",
      "description": "2-sentence practical explanation.",
      "actionStep": "One concrete micro-action."
    },
    {
      "id": "sug_3",
      "title": "Third compelling title",
      "tag": "Category",
      "type": "audio",
      "duration": "e.g. 3 min guide",
      "description": "2-sentence practical explanation.",
      "actionStep": "One concrete micro-action."
    }
  ]
}
Ensure every suggestion is realistic for a busy university student and directly addresses their top strain factors. Return ONLY valid JSON.`;

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.75,
      response_format: { type: 'json_object' }
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error('Groq generatePersonalizedSuggestions failed, trying fallback:', err);
    try {
      const completion = await groq.chat.completions.create({
        model: 'groq/compound-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.75,
        response_format: { type: 'json_object' }
      });
      return JSON.parse(completion.choices[0].message.content);
    } catch (e2) {
      // Dynamic fallback template
      return {
        aiSynthesis: `Based on your evaluation, your high exam pressure and current sleep patterns are the main contributors to your strain level. Focusing on a structured wind-down routine and 25-minute Pomodoro study sprints will provide the quickest relief this week.`,
        suggestions: [
          {
            id: "sug_def_1",
            title: "5-Minute Somatic Breathing Reset",
            tag: "Nervous System Reset",
            type: "tool",
            duration: "5 min exercise",
            description: "A quick physiological sigh exercise that instantly lowers elevated heart rate before exam sessions.",
            actionStep: "Take two deep nasal breaths, followed by one long unhurried exhale through your mouth. Repeat 5 times."
          },
          {
            id: "sug_def_2",
            title: "The 25/5 Study Pacing Method",
            tag: "Focus Rhythm",
            type: "video",
            duration: "4 min guide",
            description: "Break heavy coursework into 25-minute single-focus blocks with mandatory screen-free breaks.",
            actionStep: "Set a timer for 25 minutes on your next study task and put your phone in another room."
          },
          {
            id: "sug_def_3",
            title: "Pre-Sleep Digital Wind-Down Protocol",
            tag: "Sleep Optimization",
            type: "audio",
            duration: "3 min guide",
            description: "Simple behavioral routine to lower blue-light stimulation and prevent deadline rumination in bed.",
            actionStep: "Write down your top 3 tasks for tomorrow on a physical notepad, then dim screens 30 minutes before sleep."
          }
        ]
      };
    }
  }
}

// Generates dynamic AI coaching for specific student concerns (Results page follow-up)
async function generateFollowupCoaching(concern, assessmentSummary = {}) {
  const prompt = `You are SAHARA AI, a compassionate and expert university student counselor.
A student just reviewed their wellbeing results (Score: ${assessmentSummary.overallWellbeing || 65}%, Factors: ${(assessmentSummary.factors || []).join(', ') || 'Academic pressure'}).
They shared this specific concern about what's going on:
"${concern}"

Generate an empathetic, immediate, professional action response as strict JSON:
{
  "headline": "A validating 4-8 word title (e.g. Breaking Down Overwhelming Coursework)",
  "insight": "2 sentences of warm psychological validation explaining why this happens under college strain.",
  "microAction": "1 clear, highly actionable 5-minute step they can take right now to regain control.",
  "suggestedTopic": "A prompt they can click to continue talking to SAHARA AI in chat (e.g. 'Help me prioritize my assignments for this week')"
}
Return ONLY valid JSON.`;

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    return {
      headline: "Navigating Your Current Workload",
      insight: "When exams and coursework pile up simultaneously, our working memory gets saturated, creating a freeze response. This is a normal neurochemical reaction to prolonged stress, not a lack of capability.",
      microAction: "Pick just ONE assignment, open it, and spend exactly 5 minutes outlining the first small paragraph without judging the quality.",
      suggestedTopic: `Help me break down my study plan for ${concern}`
    };
  }
}

module.exports = {
  getChatReply,
  streamChatReply,
  generatePersonalizedSuggestions,
  generateFollowupCoaching,
};
