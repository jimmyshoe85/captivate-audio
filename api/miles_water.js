// /api/miles_water.js (Alternative approach)
import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read the JSON file directly
    const filePath = join(process.cwd(), 'data', 'miles_water.json');
    const fileContent = readFileSync(filePath, 'utf8');
    const characterData = JSON.parse(fileContent);
    
    // Return the character data
    res.status(200).json(characterData);
    
  } catch (error) {
    console.error('Error serving miles_water data:', error);
    return res.status(500).json({ 
      error: 'Error loading character data',
      message: error.message 
    });
  }
}