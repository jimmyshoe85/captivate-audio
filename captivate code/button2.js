// Button 1 - Option 2 Wine Selection
(function() {
  try {
    // Get the current scenario data
    const scenarioDataString = window.cpAPIInterface.getVariableValue("currentScenarioData");
    
    
    
    if (!scenarioDataString || scenarioDataString === "") {
      throw new Error("currentScenarioData variable is empty");
    }
    
    const currentScenarioData = JSON.parse(scenarioDataString);
    
    if (!currentScenarioData) {
      throw new Error("No scenario data found after parsing");
    }
    
    
    
    // Get option 1 data
    const selectedOption = currentScenarioData.option2Wine;
    
    if (!selectedOption) {
      throw new Error("option2Wine not found in scenario data");
    }
    
    
    
    // Show feedback
    window.cpAPIInterface.setVariableValue("feedbackText", selectedOption.feedbackText);
    
    // Track scoring by wine type
    const wineType = currentScenarioData.correctWineType;
    const userScore = selectedOption.points;
    const maxPoints = currentScenarioData.maxPoints;
    
    // Update wine type performance tracking
    if (wineType === "red") {
      const redPossible = parseInt(window.cpAPIInterface.getVariableValue("redWinePossible") || "0");
      const redActual = parseInt(window.cpAPIInterface.getVariableValue("redWineActual") || "0");
      window.cpAPIInterface.setVariableValue("redWinePossible", redPossible + maxPoints);
      window.cpAPIInterface.setVariableValue("redWineActual", redActual + userScore);
    } else if (wineType === "white") {
      const whitePossible = parseInt(window.cpAPIInterface.getVariableValue("whiteWinePossible") || "0");
      const whiteActual = parseInt(window.cpAPIInterface.getVariableValue("whiteWineActual") || "0");
      window.cpAPIInterface.setVariableValue("whiteWinePossible", whitePossible + maxPoints);
      window.cpAPIInterface.setVariableValue("whiteWineActual", whiteActual + userScore);
    }
    
    // Update total score
    const currentTotal = parseInt(window.cpAPIInterface.getVariableValue("totalScore") || "0");
    window.cpAPIInterface.setVariableValue("totalScore", currentTotal + userScore);
    
   
    
  } catch (error) {
    alert("Error: " + error.message);
  }
})();