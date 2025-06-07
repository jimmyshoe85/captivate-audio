// Wine Game - Slide Entry Code (Fixed for your Vercel setup)
// Load character scenario and populate Captivate variables

(function() {
  // Get current character and room from Captivate variables
  let currentCharacter = "brittany";
  let currentRoom = "water";
  let isRemedial = false;
  
  if (typeof window.cpAPIInterface !== 'undefined') {
    try {
      currentCharacter = window.cpAPIInterface.getVariableValue("currentCharacter") || "brittany";
      currentRoom = window.cpAPIInterface.getVariableValue("currentRoom") || "water";
      isRemedial = window.cpAPIInterface.getVariableValue("isRemedial") === "true";
    } catch (e) {
      alert("Error getting Captivate variables: " + e.message);
      // Default fallback
      currentCharacter = "brittany";
      currentRoom = "water";
      isRemedial = false;
    }
  } else {
    // Default for testing
    currentCharacter = "brittany";
    currentRoom = "water";
    isRemedial = false;
  }
  
  // FIXED: Call your existing Vercel endpoint (no .json extension)
  const apiUrl = `https://captivate-audio.vercel.app/api/${currentCharacter}_${currentRoom}`;
  
  alert(`Loading scenario for ${currentCharacter} in ${currentRoom} room, remedial: ${isRemedial}`);
  
  // Load character data
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      alert("Character data loaded successfully");
      
      // Debug: Show the actual data structure
      alert("Data keys: " + Object.keys(data).join(", "));
      
      // Your JSON structure - try both ways to access the data
      let characterData;
      const characterKey = `${currentCharacter}_${currentRoom}`;
      
      if (data[characterKey]) {
        characterData = data[characterKey];
        alert("Found data using key: " + characterKey);
      } else if (data.brittany_water) {
        characterData = data.brittany_water;
        alert("Found data using direct key: brittany_water");
      } else {
        // Maybe the data is at the root level
        characterData = data;
        alert("Using root level data");
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
      
      alert(`Selected scenario: ${selectedScenario.id}`);
      
      // Populate Captivate variables
      if (typeof window.cpAPIInterface !== 'undefined') {
        // Character info
        window.cpAPIInterface.setVariableValue("characterName", characterData.character.name);
        window.cpAPIInterface.setVariableValue("characterVoice", characterData.character.voice);
        window.cpAPIInterface.setVariableValue("characterImage", characterData.character.image);
        
        // Scenario content
        window.cpAPIInterface.setVariableValue("scenarioText", selectedScenario.scenario);
        window.cpAPIInterface.setVariableValue("scenarioId", selectedScenario.id);
        
        // Wine options (for Water Room: Red Wine, White Wine, Rosé Wine)
        window.cpAPIInterface.setVariableValue("option1Wine", selectedScenario.option1Wine.wine);
        window.cpAPIInterface.setVariableValue("option2Wine", selectedScenario.option2Wine.wine);
        window.cpAPIInterface.setVariableValue("option3Wine", selectedScenario.option3Wine.wine);
        
        // Store scenario data for scoring (as JSON string)
        window.cpAPIInterface.setVariableValue("currentScenarioData", JSON.stringify(selectedScenario));
        
        // Set loading status
        window.cpAPIInterface.setVariableValue("scenarioLoaded", "true");
        
        alert("All Captivate variables populated successfully");
        alert(`Scenario: ${selectedScenario.scenario.substring(0, 50)}...`);
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