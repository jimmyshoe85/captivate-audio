// Miss Clara Evaluation - On Entry Code (Enhanced but Simple)
// Place this in the "On Enter" action of your Miss Clara evaluation slide

(function() {
  try {
    // Show loading state
    window.cpAPIInterface.setVariableValue("evaluationLoading", "true");
    window.cpAPIInterface.setVariableValue("claraEvaluation", "Miss Clara is contemplating your... performance. Prepare yourself.");
    
    // Get session data from Captivate variables (same as before)
    const currentRoom = window.cpAPIInterface.getVariableValue("currentRoom") || "water";
    const totalScore = parseInt(window.cpAPIInterface.getVariableValue("totalScore") || "0");
    const redWinePossible = parseInt(window.cpAPIInterface.getVariableValue("redWinePossible") || "0");
    const redWineActual = parseInt(window.cpAPIInterface.getVariableValue("redWineActual") || "0");
    const whiteWinePossible = parseInt(window.cpAPIInterface.getVariableValue("whiteWinePossible") || "0");
    const whiteWineActual = parseInt(window.cpAPIInterface.getVariableValue("whiteWineActual") || "0");
    const scenariosCompleted = parseInt(window.cpAPIInterface.getVariableValue("scenariosCompleted") || "0");
    
    // Calculate totals and percentages (same as before)
    const totalPossible = redWinePossible + whiteWinePossible;
    const overallPercentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    const redPercentage = redWinePossible > 0 ? Math.round((redWineActual / redWinePossible) * 100) : 0;
    const whitePercentage = whiteWinePossible > 0 ? Math.round((whiteWineActual / whiteWinePossible) * 100) : 0;
    
    // Check for wine type balance (same as before)
    const hasRedWines = redWinePossible > 0;
    const hasWhiteWines = whiteWinePossible > 0;
    const isBalanced = hasRedWines && hasWhiteWines;
    
    // Build session history for Miss Clara (same as before)
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
    `.trim();

    console.log("Calling Miss Clara evaluation with enhanced snark...");

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
        
        // IMPORTANT: Set the TTS text for your existing TTS system
        window.cpAPIInterface.setVariableValue("claraTTSText", eval.ttsText);
        
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
        
        // Clear loading state
        window.cpAPIInterface.setVariableValue("evaluationLoading", "false");
        
        // Log the decision for debugging
        console.log(`Miss Clara Decision: ${eval.isRemedial ? 'REMEDIAL REQUIRED' : 'ADVANCE TO NEXT ROOM'}`);
        console.log(`TTS Text ready: "${eval.ttsText}"`);
        
      } else {
        throw new Error("Invalid evaluation response structure");
      }
    })
    .catch(error => {
      console.error('Error getting Miss Clara evaluation:', error);
      
      // Fallback evaluation with snark
      const passingScore = totalPossible * 0.6;
      const isRemedial = totalScore < passingScore || !isBalanced;
      
      const fallbackEvaluation = `Technical difficulties are preventing my full evaluation. How... fitting.

Based on your ${overallPercentage}% performance, you have ${isRemedial ? 'failed to meet' : 'barely met'} the minimum standards.

${!isBalanced ? 
        'You require additional practice with both wine types. Clearly.' :
        isRemedial ? 
          'Remedial training is required. Try not to embarrass yourself further.' : 
          'You may proceed to the Juice Room. Do try not to disappoint me.'
      }`;
      
      const fallbackTTS = isRemedial ? 
        "Technical difficulties cannot mask your poor performance. Remedial training required." :
        "Despite technical issues, you may proceed. Try not to disappoint me further.";
      
      // Set fallback variables
      window.cpAPIInterface.setVariableValue("claraEvaluation", fallbackEvaluation);
      window.cpAPIInterface.setVariableValue("isRemedial", isRemedial.toString());
      window.cpAPIInterface.setVariableValue("claraOverallAssessment", fallbackEvaluation);
      window.cpAPIInterface.setVariableValue("claraTTSText", fallbackTTS);
      window.cpAPIInterface.setVariableValue("evaluationLoading", "false");
    });

  } catch (error) {
    console.error('Error in Miss Clara evaluation setup:', error);
    
    // Emergency fallback
    window.cpAPIInterface.setVariableValue("claraEvaluation", "Technical incompetence prevents my evaluation. How appropriate.");
    window.cpAPIInterface.setVariableValue("claraTTSText", "Technical incompetence prevents my evaluation. How appropriate.");
    window.cpAPIInterface.setVariableValue("isRemedial", "false");
    window.cpAPIInterface.setVariableValue("evaluationLoading", "false");
  }
})();

// Function for "Play Miss Clara Audio" button in Captivate
function playMissClaraEvaluation() {
  const ttsText = window.cpAPIInterface.getVariableValue("claraTTSText");
  
  if (!ttsText || ttsText === "") {
    console.error("No TTS text available for Miss Clara");
    return;
  }
  
  console.log("Playing Miss Clara audio:", ttsText);
  
  // Call your existing TTS API with char="clara"
  fetch('https://captivate-audio.vercel.app/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      text: ttsText,
      char: 'clara'  // Uses your enhanced Clara voice from VOICES
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`TTS error! status: ${response.status}`);
    }
    return response.blob();
  })
  .then(audioBlob => {
    // Create a URL for the audio blob
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Create and play the audio with dramatic pause
    const audio = new Audio(audioUrl);
    
    // Clean up URL when done
    audio.onended = function() {
      URL.revokeObjectURL(audioUrl);
      console.log("Miss Clara has finished her devastating critique.");
    };
    
    // Add 1 second dramatic pause before Miss Clara speaks
    setTimeout(() => {
      audio.play();
    }, 1000);
    
  })
  .catch(error => {
    console.error('Error playing Miss Clara audio:', error);
    alert('Audio unavailable. Miss Clara is too disgusted to speak.');
  });
}

// Make function available to Captivate buttons
window.playMissClaraEvaluation = playMissClaraEvaluation;