// /api/miss_clara_evaluation.js
// Simplified version based on your working TTS pattern

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
    
    // Simple prompt without complex structured output
    const prompt = `You are Miss Clara, a sophisticated wine service evaluator with a theatrical personality like Miranda from "The Devil Wears Prada."

Evaluate this learner's performance in the ${currentRoom.toUpperCase()} ROOM:

${sessionHistory}

Based on a 70% passing threshold, provide your evaluation as a JSON response with exactly this structure:
{
  "isRemedial": false,
  "overallAssessment": "Your theatrical evaluation here",
  "strengths": "What they did well",
  "weaknesses": "Areas for improvement",
  "patternAnalysis": "Your analysis of their patterns",
  "finalVerdict": "Your dramatic final judgment",
  "nextSteps": "What happens next"
}

Respond ONLY with valid JSON, no other text.`;

    // Use a simpler model that's more likely to work
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use mini version like your TTS
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 800
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
    
    // Return the evaluation
    res.status(200).json({
      success: true,
      evaluation: evaluation
    });
    
    console.log('Response sent successfully');

  } catch (error) {
    console.error('Error generating evaluation:', error);
    return res.status(500).json({ 
      error: 'Error generating evaluation',
      message: error.message,
      stack: error.stack
    });
  }
}