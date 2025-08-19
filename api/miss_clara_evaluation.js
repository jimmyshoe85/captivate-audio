// /api/miss_clara_evaluation.js
import { OpenAI } from "openai";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { sessionHistory, currentRoom = "water" } = req.body || {};
    if (!sessionHistory) return res.status(400).json({ error: "Session history is required" });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = `
You are Miss Clara, a dramatic wine evaluator with a Miranda Priestly edge.
Be theatrical but concise. Output MUST be valid single JSON object only.
Scoring:
- Passing threshold: 60% for ${currentRoom.toUpperCase()} room
- Missing required wine types => automatic remedial
Tone:
- Snark: "DEVASTATING" if fail, "GRUDGING" if pass
JSON schema (keep short strings):
{
  "isRemedial": boolean,
  "overallAssessment": "max 3 sentences",
  "strengths": "1 sentence",
  "weaknesses": "1 sentence",
  "patternAnalysis": "1 sentence",
  "finalVerdict": "1 dramatic sentence",
  "nextSteps": "1 sentence",
  "ttsText": "3 short sentences for audio"
}`.trim();

    const user = `${sessionHistory}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5",                     // using GPT‑5
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0.7,
      max_tokens: 400,
      response_format: { type: "json_object" } // JSON mode supported
    });

    const responseText = completion.choices[0].message.content || "{}";
    let evaluation = JSON.parse(responseText);

    const fixed = {
      isRemedial: Boolean(evaluation.isRemedial),
      overallAssessment: evaluation.overallAssessment || "Performance requires improvement.",
      strengths: evaluation.strengths || "Minimal strengths observed.",
      weaknesses: evaluation.weaknesses || "Multiple areas need work.",
      patternAnalysis: evaluation.patternAnalysis || "Inconsistent performance patterns.",
      finalVerdict: evaluation.finalVerdict || "Disappointing results.",
      nextSteps: evaluation.nextSteps || "Continue training.",
      ttsText: evaluation.ttsText || evaluation.finalVerdict || "Try harder next time."
    };

    if (fixed.ttsText.length > 150) fixed.ttsText = fixed.finalVerdict.slice(0, 147) + "...";

    return res.status(200).json({ success: true, evaluation: fixed });
  } catch (error) {
    const fallback = {
      isRemedial: true,
      overallAssessment: "Technical difficulties prevent full assessment.",
      strengths: "You selected options.",
      weaknesses: "Everything needs improvement.",
      patternAnalysis: "Inconsistent performance observed.",
      finalVerdict: "Technical issues compound your wine incompetence.",
      nextSteps: "Try again when technology cooperates.",
      ttsText: "Technical difficulties cannot mask poor performance."
    };
    return res.status(200).json({ success: true, evaluation: fallback, fallback: true });
  }
}
