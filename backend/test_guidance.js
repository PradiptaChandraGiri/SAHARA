require('dotenv').config();
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testGuidance() {
  const prompt = `You are SAHARA AI, a student mental health and academic wellbeing expert.
A university student just completed their wellbeing check-in with these exact metrics:
- Overall Wellbeing Index: 68%
- Anxiety Signal: 72%
- Academic Strain: 64%
- Risk Level: High
- Identified Factors: High exam pressure, 4 hours sleep, High screen time (8 hrs)

Generate a personalized guidance package as strict JSON with this exact structure:
{
  "aiSynthesis": "2-3 sentence empathetic summary analyzing their unique profile and highest leverage point.",
  "suggestions": [
    {
      "title": "Creative actionable title",
      "tag": "Category (e.g. Sleep Optimization, Exam Grounding, Digital Reset)",
      "type": "tool",
      "duration": "4 min exercise",
      "description": "2-sentence specific protocol for their exact situation.",
      "actionStep": "One immediate 2-minute step they can do right now."
    },
    {
      "title": "Second title",
      "tag": "Category",
      "type": "video",
      "duration": "5 min reset",
      "description": "2-sentence specific protocol.",
      "actionStep": "One immediate step."
    },
    {
      "title": "Third title",
      "tag": "Category",
      "type": "audio",
      "duration": "3 min guide",
      "description": "2-sentence specific protocol.",
      "actionStep": "One immediate step."
    }
  ]
}
Return ONLY valid JSON.`;

  const completion = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });
  console.log('OUTPUT JSON:\n', completion.choices[0].message.content);
}
testGuidance();
