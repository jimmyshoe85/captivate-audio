// Wine Game - Slide Entry Code (Fixed for your Vercel setup)
// Load character scenario and populate Captivate variables

(function() {
  // Get current character and room from Captivate variables
  let currentCharacter = "jose";
  let currentRoom = "water";
  let isRemedial = false;
  
  if (typeof window.cpAPIInterface !== 'undefined') {
    try {
      currentCharacter = window.cpAPIInterface.getVariableValue("currentCharacter") || "jose";
      currentRoom = window.cpAPIInterface.getVariableValue("currentRoom") || "water";
      isRemedial = window.cpAPIInterface.getVariableValue("isRemedial") === "true";
      
      // Debug: Show what variables we actually got
      
      
    } catch (e) {
      
      // Default fallback
      currentCharacter = "jose";
      currentRoom = "water";
      isRemedial = false;
    }
  } else {
    // Default for testing
    currentCharacter = "jose";
    currentRoom = "water";
    isRemedial = false;
    
  }
  
  // FIXED: Call your existing Vercel endpoint (no .json extension)
  const apiUrl = `https://captivate-audio.vercel.app/api/${currentCharacter}_${currentRoom}`;
  
 
  
  // Load character data
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      
      
      // Debug: Show the actual data structure
     
      
      // FIXED: Your JSON structure has .json extension in the key
      let characterData;
      const characterKey = `${currentCharacter}_${currentRoom}`;
      const characterKeyWithJson = `${currentCharacter}_${currentRoom}.json`;
      
      if (data[characterKeyWithJson]) {
        characterData = data[characterKeyWithJson];
        
      } else if (data[characterKey]) {
        characterData = data[characterKey];
        
      } else {
        // Show all available keys for debugging
        
        throw new Error(`Character data not found. Looking for: ${characterKey} or ${characterKeyWithJson}`);
      }
      
      if (!characterData || !characterData.character) {
        throw new Error(`Character data structure invalid. Keys found: ${Object.keys(data).join(", ")}`);
      }
      
      // Choose scenario set based on remedial status
      const scenarios = isRemedial ? characterData.remedial : characterData.firstTime;
      
      if (!scenarios || scenarios.length === 0) {
        throw new Error(`No scenarios found for ${isRemedial ? 'remedial' : 'first time'}`);
      }
      
      // Randomly select a scenario
      const randomIndex = Math.floor(Math.random() * scenarios.length);
      const selectedScenario = scenarios[randomIndex];
      
      
      
      // Populate Captivate variables
      if (typeof window.cpAPIInterface !== 'undefined') {
        // Character info
        window.cpAPIInterface.setVariableValue("characterName", characterData.character.name);
        window.cpAPIInterface.setVariableValue("characterVoice", characterData.character.voice);
        window.cpAPIInterface.setVariableValue("characterImage", characterData.character.image);
        
        // Scenario content
        window.cpAPIInterface.setVariableValue("scenarioText", selectedScenario.scenario);
        window.cpAPIInterface.setVariableValue("scenarioId", selectedScenario.id);
        
        // Wine options (for water Room: Red Wine, White Wine, Rosé Wine)
        window.cpAPIInterface.setVariableValue("option1Wine", selectedScenario.option1Wine.wine);
        window.cpAPIInterface.setVariableValue("option2Wine", selectedScenario.option2Wine.wine);
        window.cpAPIInterface.setVariableValue("option3Wine", selectedScenario.option3Wine.wine);
        
        // Store scenario data for scoring (as JSON string)
        window.cpAPIInterface.setVariableValue("currentScenarioData", JSON.stringify(selectedScenario));
        
        // Set loading status
        window.cpAPIInterface.setVariableValue("scenarioLoaded", "true");
        
       
      } else {
        alert("Captivate API not available - running in preview mode");
      }
      
    })
    .catch(error => {
      alert('Error loading character scenario: ' + error.message);
      
      // Set error state in Captivate
      if (typeof window.cpAPIInterface !== 'undefined') {
        window.cpAPIInterface.setVariableValue("scenarioText", "Error loading scenario. Please refresh and try again.");
        window.cpAPIInterface.setVariableValue("scenarioLoaded", "false");
        window.cpAPIInterface.setVariableValue("loadError", error.message);
      }
    });
})();