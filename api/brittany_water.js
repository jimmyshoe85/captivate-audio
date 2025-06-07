export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests (different from TTS which uses POST)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Import the JSON data
    const characterData = await import('../data/brittany_water.json');
    
    // Return the character data
    res.status(200).json(characterData.default || characterData);
    
  } catch (error) {
    console.error('Error serving brittany_water data:', error);
    return res.status(500).json({ 
      error: 'Error loading character data',
      message: error.message 
    });
  }
}