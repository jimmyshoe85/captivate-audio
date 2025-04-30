// /api/tts.js
import { OpenAI } from "openai";

/* Character → voice map */
const VOICES = {
  angela:   { voice: "sage",  instructions: "Neutral American, warm mentor." },
  brittany: { voice: "alloy", instructions: "Upbeat Gen-Z, energetic tone." },
  jose:     { voice: "verse", instructions: "Light Spanish accent, warm." },
  kevin:    { voice: "echo",  instructions: "Mid-western trainer, steady." },
  miles:    { voice: "ash",   instructions: "Queens NY, relaxed confidence." }
};

// Remove edge runtime configuration as it may be causing issues
// export const config = { runtime: "edge" };

export default async function handler(req, res) {
  /* CORS headers (required for Captivate) */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get text and character from the request body
    const { text, char = "angela" } = req.body || {};
    
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    
    console.log('Received text:', text, 'Character:', char);

    // Resolve voice configuration
    const cfg = VOICES[char.toLowerCase()] || VOICES.angela;

    // Initialize OpenAI with API key from environment variable
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log('Calling OpenAI TTS API with voice:', cfg.voice);
    
    // Call OpenAI TTS API - using cfg.voice to match original working code
    const mp3Response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: cfg.voice,
      input: text,
      instructions: cfg.instructions
    });
    
    console.log('OpenAI TTS API call successful');

    // Convert the response to a Buffer
    const buffer = Buffer.from(await mp3Response.arrayBuffer());
    console.log('Buffer created, size:', buffer.length);
    
    // Set the content type to audio/mpeg
    res.setHeader('Content-Type', 'audio/mpeg');
    // Send the audio data
    res.send(buffer);
    console.log('Response sent successfully');
  } catch (error) {
    console.error('Error generating speech:', error);
    return res.status(500).json({ 
      error: 'Error generating speech',
      message: error.message
    });
  }
}