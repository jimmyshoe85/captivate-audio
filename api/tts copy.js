// /api/tts.js
import { OpenAI } from 'openai';

export default async function handler(req, res) {
  // Set CORS headers to allow requests from anywhere
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
    // Debug: Log environment variables (don't include actual API key value)
    console.log('Environment check: OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
    console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
    console.log('OPENAI_API_KEY prefix:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 7) : 'none');
    
    // Get the text from the request body
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    console.log('Received text:', text);

    // Initialize OpenAI with API key from environment variable
    let openai;
    try {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log('OpenAI client initialized successfully');
    } catch (initError) {
      return res.status(500).json({ 
        error: 'Failed to initialize OpenAI client',
        message: initError.message,
        stack: initError.stack
      });
    }

    // Log before API call
    console.log('Calling OpenAI TTS API...');
    
    // Call OpenAI TTS API
    const mp3Response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "coral",
      input: text,
      instructions: "Accent/Affect: slight French accent; sophisticated yet friendly, clearly understandable with a charming touch of French intonation."
    });
    
    console.log('OpenAI TTS API call successful');

    // Convert the response to an ArrayBuffer
    const buffer = Buffer.from(await mp3Response.arrayBuffer());
    console.log('Buffer created, size:', buffer.length);
    
    // Set the content type to audio/mpeg
    res.setHeader('Content-Type', 'audio/mpeg');
    // Send the audio data
    res.send(buffer);
    console.log('Response sent successfully');
  } catch (error) {
    console.error('Error generating speech:', error);
    const errorDetails = {
      error: 'Error generating speech',
      message: error.message,
      type: error.constructor.name,
      stack: error.stack,
      // Include OpenAI specific error details if available
      status: error.status,
      code: error.code,
      param: error.param
    };
    
    console.error('Detailed error:', JSON.stringify(errorDetails, null, 2));
    
    return res.status(500).json(errorDetails);
  }
}