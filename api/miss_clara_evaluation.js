// /api/miss_clara_evaluation.js
// Optimized for speed - reduced tokens and faster model

import { OpenAI } from "openai";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { sessionHistory, currentRoom = "water" } = req.body || {};
    
    if (!sessionHistory) {
      return res.status(400).json({ error: "Session history is required" });
    }
    
    console.log('Miss Clara evaluation request for room:', currentRoom);

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log('Calling OpenAI API - optimized for speed...');
    
    // OPTIMIZED PROMPT - Much shorter, focused on speed
    const prompt = `You are Miss Clara, a dramatic wine evaluator. Be theatrical but brief.

${sessionHistory}

REQUIREMENTS (return JSON only):
- 60% passing threshold for ${currentRoom.toUpperCase()} room
- Incomplete wine types = automatic remedial
- Snark level: DEVASTATING if bad, GRUDGING if passed

JSON format (keep responses SHORT):
{
  "isRemedial": boolean,
  "overallAssessment": "2 sentences max",
  "strengths": "1 sentence", 
  "weaknesses": "1 sentence",
  "patternAnalysis": "1 sentence",
  "finalVerdict": "1 dramatic sentence",
  "nextSteps": "1 sentence",
  "ttsText": "1 sentence perfect for audio"
}`;

    // OPTIMIZED API call - faster settings
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // FASTER than gpt-4o-mini
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 400, // REDUCED from 1200 
      response_format: { type: "json_object" }
    });

    console.log('OpenAI API call completed successfully');

    // Parse response
    const responseText = completion.choices[0].message.content;
    console.log('Raw response length:', responseText.length);
    
    let evaluation;
    try {
      evaluation = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error, using fallback');
      throw new Error('Failed to parse evaluation response');
    }
    
    // FAST validation and cleanup
    const fixedEvaluation = {
      isRemedial: Boolean(evaluation.isRemedial),
      overallAssessment: evaluation.overallAssessment || "Performance requires improvement.",
      strengths: evaluation.strengths || "Minimal strengths observed.",
      weaknesses: evaluation.weaknesses || "Multiple areas need work.",
      patternAnalysis: evaluation.patternAnalysis || "Inconsistent performance patterns.",
      finalVerdict: evaluation.finalVerdict || "Disappointing results.",
      nextSteps: evaluation.nextSteps || "Continue training.",
      ttsText: evaluation.ttsText || evaluation.finalVerdict || "Try harder next time."
    };
    
    // Ensure TTS text is reasonable length
    if (fixedEvaluation.ttsText.length > 150) {
      fixedEvaluation.ttsText = fixedEvaluation.finalVerdict.substring(0, 147) + "...";
    }
    
    console.log('Evaluation processed, sending response');
    
    // Return the evaluation
    res.status(200).json({
      success: true,
      evaluation: fixedEvaluation
    });

  } catch (error) {
    console.error('Error generating Miss Clara evaluation:', error);
    
    // FAST fallback - no complex logic
    const fallbackEvaluation = {
      isRemedial: true,
      overallAssessment: "Technical difficulties prevent full assessment.",
      strengths: "You selected options.",
      weaknesses: "Everything needs improvement.",
      patternAnalysis: "Inconsistent performance observed.",
      finalVerdict: "Technical issues compound your wine incompetence.",
      nextSteps: "Try again when technology cooperates.",
      ttsText: "Technical difficulties cannot mask poor performance."
    };
    
    return res.status(200).json({ 
      success: true,
      evaluation: fallbackEvaluation,
      fallback: true
    });
  }
}