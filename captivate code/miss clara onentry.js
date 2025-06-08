// Miss Clara Evaluation - On Entry Code (Updated)
// Place this in the "On Enter" action of your Miss Clara evaluation slide

(function() {
  try {
    // Show loading state
    window.cpAPIInterface.setVariableValue("evaluationLoading", "true");
    window.cpAPIInterface.setVariableValue("claraEvaluation", "Miss Clara is reviewing your performance...");
    
    // Get session data from Captivate variables
    const currentRoom = window.cpAPIInterface.getVariableValue("currentRoom") || "water";
    const totalScore = parseInt(window.cpAPIInterface.getVariableValue("totalScore") || "0");
    const redWinePossible = parseInt(window.cpAPIInterface.getVariableValue("redWinePossible") || "0");
    const redWineActual = parseInt(window.cpAPIInterface.getVariableValue("redWineActual") || "0");
    const whiteWinePossible = parseInt(window.cpAPIInterface.getVariableValue("whiteWinePossible") || "0");
    const whiteWineActual = parseInt(window.cpAPIInterface.getVariableValue("whiteWineActual") || "0");
    const scenariosCompleted = parseInt(window.cpAPIInterface.getVariableValue("scenariosCompleted") || "0");
    
    // Calculate totals and percentages
    const totalPossible = redWinePossible + whiteWinePossible;
    const overallPercentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    const redPercentage = redWinePossible > 0 ? Math.round((redWineActual / redWinePossible) * 100) : 0;
    const whitePercentage = whiteWinePossible > 0 ? Math.round((whiteWineActual / whiteWinePossible) * 100) : 0;
    
    // Check for wine type balance
    const hasRedWines = redWinePossible > 0;
    const hasWhiteWines = whiteWinePossible > 0;
    const isBalanced = hasRedWines && hasWhiteWines;
    
    // Build session history for Miss Clara with balance checking
    const sessionHistory = `
ROOM: ${currentRoom.toUpperCase()}
SCENARIOS COMPLETED: ${scenariosCompleted}

OVERALL PERFORMANCE:
- Total Score: ${totalScore}/${totalPossible}
- Overall Percentage: ${overallPercentage}%

RED WINE PERFORMANCE:
- Red Wine Score: ${redWineActual}/${redWinePossible}
- Red Wine Percentage: ${redPercentage}%
${!hasRedWines ? "- WARNING: No red wine scenarios encountered" : ""}

WHITE WINE PERFORMANCE:
- White Wine Score: ${whiteWineActual}/${whiteWinePossible}  
- White Wine Percentage: ${whitePercentage}%
${!hasWhiteWines ? "- WARNING: No white wine scenarios encountered" : ""}

BALANCE CHECK:
${!isBalanced ? 
  "INCOMPLETE ASSESSMENT - Missing either red or white wine scenarios. Requires additional practice regardless of score." :
  "Complete assessment - Both red and white wine scenarios completed."
}

PERFORMANCE ANALYSIS:
${overallPercentage === 100 ? 
  "Perfect performance - demonstrated flawless understanding of wine pairing fundamentals." :
  overallPercentage >= 80 ? 
    "Strong performance - shows solid grasp of pairing principles with minor areas for refinement." :
    overallPercentage >= 60 ? 
      "Adequate performance - basic understanding demonstrated but some inconsistencies." :
      "Below expectations - fundamental pairing concepts need reinforcement."
}

${redPercentage > whitePercentage ? 
  "Stronger with red wine pairings than white wine selections." :
  whitePercentage > redPercentage ? 
    "Stronger with white wine pairings than red wine selections." :
    isBalanced ? "Consistent performance across both red and white wine scenarios." : "Limited wine type exposure."
}
    `.trim();

    console.log("Calling Miss Clara evaluation with:", sessionHistory);

    // Call Miss Clara evaluation API
    fetch("https://captivate-audio.vercel.app/api/miss_clara_evaluation", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionHistory: sessionHistory,
        currentRoom: currentRoom
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Miss Clara evaluation received:", data);
      
      if (data.success && data.evaluation) {
        const eval = data.evaluation;
        
        // Set individual evaluation components
        window.cpAPIInterface.setVariableValue("claraOverallAssessment", eval.overallAssessment);
        window.cpAPIInterface.setVariableValue("claraStrengths", eval.strengths);
        window.cpAPIInterface.setVariableValue("claraWeaknesses", eval.weaknesses);
        window.cpAPIInterface.setVariableValue("claraPatternAnalysis", eval.patternAnalysis);
        window.cpAPIInterface.setVariableValue("claraFinalVerdict", eval.finalVerdict);
        window.cpAPIInterface.setVariableValue("claraNextSteps", eval.nextSteps);
        
        // Set the critical decision variable
        window.cpAPIInterface.setVariableValue("isRemedial", eval.isRemedial.toString());
        
        // Create full evaluation text for display
        let fullEvaluation = eval.overallAssessment;
        
        if (eval.strengths) {
          fullEvaluation += `\n\nSTRENGTHS: ${eval.strengths}`;
        }
        
        if (eval.weaknesses) {
          fullEvaluation += `\n\nAREAS FOR IMPROVEMENT: ${eval.weaknesses}`;
        }
        
        fullEvaluation += `\n\nPATTERN ANALYSIS: ${eval.patternAnalysis}`;
        fullEvaluation += `\n\n${eval.finalVerdict}`;
        fullEvaluation += `\n\nNEXT STEPS: ${eval.nextSteps}`;
        
        // Set display variables
        window.cpAPIInterface.setVariableValue("claraEvaluation", fullEvaluation);
        
        // Create shorter version for audio (optional)
        const audioVersion = `${eval.overallAssessment} ${eval.finalVerdict}`;
        window.cpAPIInterface.setVariableValue("claraAudioText", audioVersion);
        
        // Clear loading state
        window.cpAPIInterface.setVariableValue("evaluationLoading", "false");
        
        // Log the decision for debugging
        console.log(`Miss Clara Decision: ${eval.isRemedial ? 'REMEDIAL REQUIRED' : 'ADVANCE TO NEXT ROOM'}`);
        
      } else {
        throw new Error("Invalid evaluation response structure");
      }
    })
    .catch(error => {
      console.error('Error getting Miss Clara evaluation:', error);
      
      // Fallback evaluation based on correct Water Room threshold (60%)
      const passingScore = totalPossible * 0.6; // 60% to pass Water Room
      const isRemedial = totalScore < passingScore || !isBalanced;
      
      const fallbackEvaluation = `I apologize for the technical difficulties in my evaluation system.

Based on your performance of ${totalScore} out of ${totalPossible} points (${overallPercentage}%), you have ${isRemedial ? 'not met' : 'met'} the standards for advancement.

${!isBalanced ? 
  'You need additional practice with both red and white wine scenarios.' :
  isRemedial ? 
    'You will need additional practice in the fundamentals before proceeding to the Juice Room.' : 
    'You may proceed to the Juice Room. Do not disappoint me.'
}`;
      
      // Set fallback variables
      window.cpAPIInterface.setVariableValue("claraEvaluation", fallbackEvaluation);
      window.cpAPIInterface.setVariableValue("isRemedial", isRemedial.toString());
      window.cpAPIInterface.setVariableValue("claraOverallAssessment", fallbackEvaluation);
      window.cpAPIInterface.setVariableValue("evaluationLoading", "false");
    });

  } catch (error) {
    console.error('Error in Miss Clara evaluation setup:', error);
    
    // Emergency fallback
    window.cpAPIInterface.setVariableValue("claraEvaluation", "There appears to be a technical issue. Please continue with your training.");
    window.cpAPIInterface.setVariableValue("isRemedial", "false");
    window.cpAPIInterface.setVariableValue("evaluationLoading", "false");
  }
})();