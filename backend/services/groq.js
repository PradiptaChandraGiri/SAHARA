// services/groq.js
// Groq: sub-second latency, 14,400 free requests/day, OpenAI-compatible SDK.
// Fast conversational responses with Server-Sent Events (SSE) streaming.

const Groq = require("groq-sdk");

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set on the server.");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT =
  "You are SAHARA, a warm, supportive AI wellbeing companion for university " +
  "students. Keep responses concise (2-4 sentences), calm, and non-clinical. " +
  "You are not a therapist and should not attempt to diagnose. For low-stakes " +
  "topics like study techniques, sleep habits, or exam stress, be conversational " +
  "and helpful. If a student seems to be struggling significantly, gently " +
  "encourage them to use the 'Message a counselor' option. " +
  "Use minimal markdown - occasional **bold** for emphasis is fine, but " +
  "avoid headers, nested lists, or code blocks. Keep formatting light, " +
  "this is a casual supportive chat, not a document.";

const GROQ_MODEL = "openai/gpt-oss-120b";

// Non-streaming version - kept for WhatsApp bot and fallback endpoints
async function getChatReply(userMessage, conversationHistory = []) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
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
      max_tokens: 200,
    });
    return { text: completion.choices[0].message.content, flaggedCrisis: false };
  } catch (err) {
    // Fallback to compound-mini if rate limit / model issue
    const completion = await groq.chat.completions.create({
      model: "groq/compound-mini",
      messages,
      temperature: 0.7,
      max_tokens: 200,
    });
    return { text: completion.choices[0].message.content, flaggedCrisis: false };
  }
}

// Streaming version - used by the web AI Support page
async function streamChatReply(userMessage, conversationHistory = [], onChunk) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
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
      max_tokens: 200,
      stream: true,
    });
  } catch (err) {
    stream = await groq.chat.completions.create({
      model: "groq/compound-mini",
      messages,
      temperature: 0.7,
      max_tokens: 200,
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

module.exports = { getChatReply, streamChatReply };
