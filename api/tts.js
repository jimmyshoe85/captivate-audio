// /api/tts.js
import { OpenAI } from 'openai';

export default async function handler(req, res) {
  // Set CORS headers to allow requests from Captivate
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the text from the request body
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Initialize OpenAI with API key from environment variable
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Call OpenAI TTS API
    const mp3Response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "coral",
      input: text,
      instructions: "Accent/Affect: slight French accent; sophisticated yet friendly, clearly understandable with a charming touch of French intonation. Tone: Warm and a little snooty. Speak with pride and knowledge for the content being presented.",
    });

    // Convert the response to an ArrayBuffer
    const buffer = Buffer.from(await mp3Response.arrayBuffer());
    
    // Set the content type to audio/mpeg
    res.setHeader('Content-Type', 'audio/mpeg');
    // Send the audio data
    res.send(buffer);
  } catch (error) {
    console.error('Error generating speech:', error);
    res.status(500).json({ error: 'Error generating speech' });
  }
}