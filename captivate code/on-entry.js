// Wine Game - Slide Entry Code
// Load character scenario and populate Captivate variables

(function() {
  // Get current character and room from Captivate variables
  let currentCharacter = "";
  let currentRoom = "";
  let isRemedial = false;
  
  if (typeof window.cpAPIInterface !== 'undefined') {
    try {
      currentCharacter = window.cpAPIInterface.getVariableValue("currentCharacter") || "brittany";
      currentRoom = window.cpAPIInterface.getVariableValue("currentRoom") || "water";
      isRemedial = window.cpAPIInterface.getVariableValue("isRemedial") === "true";
    } catch (e) {
      console.error("Error getting Captivate variables:", e);
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
  
  // Your Vercel API endpoint for character data
  const apiUrl = `https://your-wine-game.vercel.app/api/${currentCharacter}_${currentRoom}.json`;
  
  console.log(`Loading scenario for ${currentCharacter} in ${currentRoom} room, remedial: ${isRemedial}`);
  
  // Load character data
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Character data loaded:", data);
      
      // Choose scenario set based on remedial status
      const scenarios = isRemedial ? data.remedial : data.firstTime;
      
      if (!scenarios || scenarios.length === 0) {
        throw new Error(`No scenarios found for ${isRemedial ? 'remedial' : 'first time'}`);
      }
      
      // Randomly select a scenario
      const randomIndex = Math.floor(Math.random() * scenarios.length);
      const selectedScenario = scenarios[randomIndex];
      
      console.log("Selected scenario:", selectedScenario.id);
      
      // Populate Captivate variables
      if (typeof window.cpAPIInterface !== 'undefined') {
        // Character info
        window.cpAPIInterface.setVariableValue("characterName", data.character.name);
        window.cpAPIInterface.setVariableValue("characterVoice", data.character.voice);
        window.cpAPIInterface.setVariableValue("characterImage", data.character.image);
        
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
        
        console.log("All Captivate variables populated successfully");
      } else {
        console.log("Captivate API not available - running in preview mode");
        console.log("Scenario text:", selectedScenario.scenario);
        console.log("Options:", selectedScenario.option1Wine.wine, selectedScenario.option2Wine.wine, selectedScenario.option3Wine.wine);
      }
      
    })
    .catch(error => {
      console.error('Error loading character scenario:', error);
      
      // Set error state in Captivate
      if (typeof window.cpAPIInterface !== 'undefined') {
        window.cpAPIInterface.setVariableValue("scenarioText", "Error loading scenario. Please refresh and try again.");
        window.cpAPIInterface.setVariableValue("scenarioLoaded", "false");
        window.cpAPIInterface.setVariableValue("loadError", error.message);
      }
    });
})();