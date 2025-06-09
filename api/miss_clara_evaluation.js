// /api/miss_clara_evaluation.js
// Enhanced version that provides TTS-ready text

import { OpenAI } from "openai";

export default async function handler(req, res) {
  // CORS headers (copy from your working TTS)
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
    
    console.log('Received session history:', sessionHistory);

    // Initialize OpenAI (same as your TTS)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log('Calling OpenAI Chat API...');
    
    // Enhanced prompt with snark levels and TTS considerations
    const prompt = `You are Miss Clara, a devastatingly theatrical wine evaluator. Channel Miranda Priestly meeting Gordon Ramsay - every word drips with sophisticated contempt, dramatic pauses, and educational cruelty.

SNARK LEVELS based on performance:
- CATASTROPHIC (incomplete wine types): "Your wine knowledge rivals that of a confused toddler"
- DEVASTATING (<30%): "I've seen people with concussions make better pairing decisions"  
- CUTTING (30-59%): "Mediocre would be an improvement from this performance"
- GRUDGING (60-79%): "Adequate. Which from you borders on miraculous"
- BACKHANDED_APPROVAL (80%+): "Acceptable. Don't let it go to your head"

Evaluate this learner's performance in the ${currentRoom.toUpperCase()} ROOM:

${sessionHistory}

Based on a 60% passing threshold, provide your evaluation as JSON with EXACTLY this structure:
{
  "isRemedial": boolean,
  "overallAssessment": "Your devastating opening statement (2-3 sentences max for readability)",
  "strengths": "Backhanded compliments about what they didn't ruin", 
  "weaknesses": "Cutting analysis with maximum educational snark",
  "patternAnalysis": "Dramatic insights into their systematic failures/successes",
  "finalVerdict": "Your most theatrical judgment (1-2 sentences)",
  "nextSteps": "What happens next, delivered with appropriate disdain",
  "ttsText": "Perfect audio version - combine your most devastating lines into 1-2 sentences for dramatic TTS delivery"
}

CRITICAL: Make the "ttsText" field your most theatrical, concise summary perfect for audio - this will be sent to TTS exactly as written.

Examples of good ttsText:
- FAIL: "Your wine pairing attempts make box wine seem sophisticated. Remedial training. Immediately."
- PASS: "Adequate work. Which from you borders on miraculous. You may proceed to embarrass yourself at the next level."

Respond ONLY with valid JSON, no other text.`;

    // Use enhanced settings for more creative snark
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Keep your working model
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.9, // Higher for more creative insults
      max_tokens: 1000
    });

    console.log('OpenAI Chat API call successful');

    // Parse the response
    const responseText = completion.choices[0].message.content;
    console.log('Raw response:', responseText);
    
    let evaluation;
    try {
      evaluation = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse evaluation response');
    }
    
    // Validate that ttsText exists
    if (!evaluation.ttsText) {
      // Fallback: create ttsText from other fields
      evaluation.ttsText = `${evaluation.overallAssessment} ${evaluation.finalVerdict}`;
    }
    
    // Return the evaluation
    res.status(200).json({
      success: true,
      evaluation: evaluation
    });
    
    console.log('Response sent successfully');

  } catch (error) {
    console.error('Error generating evaluation:', error);
    return res.status(500).json({ 
      error: 'Even my evaluation system is embarrassed by your performance',
      message: error.message,
      stack: error.stack
    });
  }
}