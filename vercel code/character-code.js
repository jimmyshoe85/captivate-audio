// /api/[character].js
// Serves character JSON data for wine game

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
    // Get character filename from URL parameter
    const { character } = req.query;
    
    if (!character) {
      return res.status(400).json({ error: 'Character parameter required' });
    }
    
    console.log('Requesting character data:', character);
    
    // Import character data (you'll need to store JSON files in your project)
    let characterData;
    
    try {
      // Dynamic import based on character parameter
      switch(character) {
        case 'brittany_water':
          characterData = await import('../data/brittany_water.json');
          break;
        case 'miles_water':
          characterData = await import('../data/miles_water.json');
          break;
        case 'brittany_juice':
          characterData = await import('../data/brittany_juice.json');
          break;
        case 'miles_juice':
          characterData = await import('../data/miles_juice.json');
          break;
        // Add more characters as needed
        default:
          return res.status(404).json({ error: 'Character not found' });
      }
      
      // Return the character data
      res.status(200).json(characterData.default || characterData);
      
    } catch (importError) {
      console.error('Error importing character data:', importError);
      return res.status(404).json({ error: 'Character data not found' });
    }
    
  } catch (error) {
    console.error('Error serving character data:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}