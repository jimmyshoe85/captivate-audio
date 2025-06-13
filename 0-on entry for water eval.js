// ===============================================================
// SLIDE 1: Fixed Preload System with Enhanced TTS (3-second wait slide)
// Place this in the "On Enter" action of your 3-second wait slide

(function() {
  try {
    aleert("=== STARTING MISS CLARA EVALUATION AND AUDIO PRELOAD ===");
    
    // Show loading state
    window.cpAPIInterface.setVariableValue("evaluationLoading", "true");
    window.cpAPIInterface.setVariableValue("claraEvaluation", "Miss Clara is reviewing your performance...");
    window.cpAPIInterface.setVariableValue("claraAudioReady", "false");
    
    // Get session data from Captivate variables
    const currentRoom = window.cpAPIInterface.getVariableValue("currentRoom") || "water";
    const totalScore = parseInt(window.cpAPIInterface.getVariableValue("totalScore") || "0");
    const redWinePossible = parseInt(window.cpAPIInterface.getVariableValue("redWinePossible") || "0");
    const redWineActual = parseInt(window.cpAPIInterface.getVariableValue("redWineActual") || "0");
    const whiteWinePossible = parseInt(window.cpAPIInterface.getVariableValue("whiteWinePossible") || "0");
    const whiteWineActual = parseInt(window.cpAPIInterface.getVariableValue("whiteWineActual") || "0");
    const scenariosCompleted = parseInt(window.cpAPIInterface.getVariableValue("scenariosCompleted") || "0");
    
    aleert("Session data loaded:", {
      currentRoom,
      totalScore,
      redWinePossible,
      redWineActual,
      whiteWinePossible,
      whiteWineActual,
      scenariosCompleted
    });
    
    // Calculate totals and percentages
    const totalPossible = redWinePossible + whiteWinePossible;
    const overallPercentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    const redPercentage = redWinePossible > 0 ? Math.round((redWineActual / redWinePossible) * 100) : 0;
    const whitePercentage = whiteWinePossible > 0 ? Math.round((whiteWineActual / whiteWinePossible) * 100) : 0;
    
    // Check for wine type balance
    const hasRedWines = redWinePossible > 0;
    const hasWhiteWines = whiteWinePossible > 0;
    const isBalanced = hasRedWines && hasWhiteWines;
    
    // Build session history for Miss Clara
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

    aleert("Session history built, calling evaluation API...");

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
      aleert("Evaluation API response status:", response.status);
      aleert("Response headers:", response.headers);
      
      if (!response.ok) {
        return response.text().then(text => {
          console.error("API error response body:", text);
          throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
        });
      }
      return response.json();
    })
    .then(data => {
      aleert("Miss Clara evaluation received:", JSON.stringify(data, null, 2));
      
      if (data.success && data.evaluation) {
        const eval = data.evaluation;
        
        // Set individual evaluation components
        window.cpAPIInterface.setVariableValue("claraOverallAssessment", eval.overallAssessment || "");
        window.cpAPIInterface.setVariableValue("claraStrengths", eval.strengths || "");
        window.cpAPIInterface.setVariableValue("claraWeaknesses", eval.weaknesses || "");
        window.cpAPIInterface.setVariableValue("claraPatternAnalysis", eval.patternAnalysis || "");
        window.cpAPIInterface.setVariableValue("claraFinalVerdict", eval.finalVerdict || "");
        window.cpAPIInterface.setVariableValue("claraNextSteps", eval.nextSteps || "");
        
        // Set the critical decision variable
        window.cpAPIInterface.setVariableValue("isRemedial", eval.isRemedial.toString());
        
        // Create full evaluation text for display
        let fullEvaluation = eval.overallAssessment || "";
        
        if (eval.strengths) {
          fullEvaluation += `\n\nSTRENGTHS: ${eval.strengths}`;
        }
        
        if (eval.weaknesses) {
          fullEvaluation += `\n\nAREAS FOR IMPROVEMENT: ${eval.weaknesses}`;
        }
        
        fullEvaluation += `\n\nPATTERN ANALYSIS: ${eval.patternAnalysis || ""}`;
        fullEvaluation += `\n\n${eval.finalVerdict || ""}`;
        fullEvaluation += `\n\nNEXT STEPS: ${eval.nextSteps || ""}`;
        
        // Set display variables
        window.cpAPIInterface.setVariableValue("claraEvaluation", fullEvaluation);
        
        // Determine what text to use for TTS
        const audioText = eval.ttsText || eval.finalVerdict || eval.overallAssessment || "Performance evaluation complete.";
        aleert("Audio text to be spoken:", audioText);
        aleert("Text length:", audioText.length);
        
        // Store the text for later use
        window.cpAPIInterface.setVariableValue("claraTTSText", audioText);
        
        // NOW PRELOAD THE AUDIO
        aleert("Starting TTS preload...");
        
        fetch('https://captivate-audio.vercel.app/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            text: audioText,
            char: 'clara'
          })
        })
        .then(ttsResponse => {
          aleert("TTS API response status:", ttsResponse.status);
          aleert("TTS Response headers:", ttsResponse.headers);
          aleert("Content-Type:", ttsResponse.headers.get('content-type'));
          
          if (!ttsResponse.ok) {
            return ttsResponse.text().then(text => {
              console.error("TTS API error response:", text);
              throw new Error(`TTS error! status: ${ttsResponse.status}, body: ${text}`);
            });
          }
          
          // Check if we got audio content
          const contentType = ttsResponse.headers.get('content-type');
          if (!contentType || !contentType.includes('audio')) {
            console.warn("Unexpected content type:", contentType);
          }
          
          return ttsResponse.blob();
        })
        .then(audioBlob => {
          aleert("Audio blob received, size:", audioBlob.size, "bytes");
          aleert("Audio blob type:", audioBlob.type);
          
          if (audioBlob.size === 0) {
            throw new Error("Received empty audio blob");
          }
          
          // Create blob URL
          const audioUrl = URL.createObjectURL(audioBlob);
          aleert("Audio URL created:", audioUrl);
          
          // Create audio element
          const audioElement = new Audio(audioUrl);
          
          // Set up event listeners BEFORE loading
          audioElement.addEventListener('loadeddata', () => {
            aleert("Audio loaded successfully, duration:", audioElement.duration);
          });
          
          audioElement.addEventListener('error', (e) => {
            console.error("Audio element error:", e);
            console.error("Audio error code:", audioElement.error?.code);
            console.error("Audio error message:", audioElement.error?.message);
          });
          
          // Store preloaded audio globally
          window.MISS_CLARA_AUDIO = {
            blob: audioBlob,
            url: audioUrl,
            audio: audioElement,
            ready: true,
            text: audioText,
            createdAt: new Date().toISOString()
          };
          
          // Pre-load the audio element
          audioElement.load();
          
          aleert("Miss Clara audio preloaded successfully!");
          aleert("Audio object stored in window.MISS_CLARA_AUDIO");
          
          window.cpAPIInterface.setVariableValue("claraAudioReady", "true");
          window.cpAPIInterface.setVariableValue("claraAudioStatus", "ready");
        })
        .catch(audioError => {
          console.error('Error preloading Miss Clara audio:', audioError);
          console.error('Error stack:', audioError.stack);
          
          window.cpAPIInterface.setVariableValue("claraAudioReady", "false");
          window.cpAPIInterface.setVariableValue("claraAudioStatus", "error: " + audioError.message);
          
          // Store error details for debugging
          window.MISS_CLARA_AUDIO = {
            ready: false,
            error: audioError.message,
            text: audioText,
            createdAt: new Date().toISOString()
          };
        });
        
        // Clear loading state
        window.cpAPIInterface.setVariableValue("evaluationLoading", "false");
        
        // Log the decision for debugging
        aleert(`Miss Clara Decision: ${eval.isRemedial ? 'REMEDIAL REQUIRED' : 'ADVANCE TO NEXT ROOM'}`);
        
      } else {
        throw new Error("Invalid evaluation response structure: " + JSON.stringify(data));
      }
    })
    .catch(error => {
      console.error('Error getting Miss Clara evaluation:', error);
      console.error('Error stack:', error.stack);
      
      // Fallback evaluation based on correct Water Room threshold (60%)
      const passingScore = totalPossible * 0.6;
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
      window.cpAPIInterface.setVariableValue("claraAudioReady", "false");
      window.cpAPIInterface.setVariableValue("claraAudioStatus", "fallback - no audio");
      
      // Store fallback state
      window.MISS_CLARA_AUDIO = {
        ready: false,
        error: "Using fallback evaluation",
        text: fallbackEvaluation,
        createdAt: new Date().toISOString()
      };
    });

  } catch (error) {
    console.error('Error in Miss Clara evaluation setup:', error);
    console.error('Error stack:', error.stack);
    
    // Emergency fallback
    window.cpAPIInterface.setVariableValue("claraEvaluation", "There appears to be a technical issue. Please continue with your training.");
    window.cpAPIInterface.setVariableValue("isRemedial", "false");
    window.cpAPIInterface.setVariableValue("evaluationLoading", "false");
    window.cpAPIInterface.setVariableValue("claraAudioReady", "false");
    window.cpAPIInterface.setVariableValue("claraAudioStatus", "emergency fallback");
    
    window.MISS_CLARA_AUDIO = {
      ready: false,
      error: "Emergency fallback activated",
      createdAt: new Date().toISOString()
    };
  }
})();

// ===============================================================
// SLIDE 2: Miss Clara Evaluation Display Slide
// Place this function in the slide where you want to play the audio

function playMissClaraEvaluation() {
  aleert("=== PLAYING MISS CLARA EVALUATION ===");
  
  try {
    // Check if preloaded audio exists
    if (window.MISS_CLARA_AUDIO && window.MISS_CLARA_AUDIO.ready && window.MISS_CLARA_AUDIO.audio) {
      aleert("Using preloaded audio created at:", window.MISS_CLARA_AUDIO.createdAt);
      aleert("Audio text:", window.MISS_CLARA_AUDIO.text);
      
      const audio = window.MISS_CLARA_AUDIO.audio;
      
      // Set up event listeners
      audio.onplay = () => aleert("Audio started playing");
      audio.onended = () => {
        aleert("Audio playback completed");
        // Clean up the blob URL
        URL.revokeObjectURL(window.MISS_CLARA_AUDIO.url);
        delete window.MISS_CLARA_AUDIO;
      };
      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        alert("Error playing audio. Please check console for details.");
      };
      
      // Play with error handling
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            aleert("Audio playback started successfully");
          })
          .catch(error => {
            console.error("Error starting audio playback:", error);
            alert("Could not play audio: " + error.message);
          });
      }
      
    } else {
      console.warn("No preloaded audio found, attempting direct generation...");
      aleert("window.MISS_CLARA_AUDIO state:", window.MISS_CLARA_AUDIO);
      
      // Fallback: generate audio on demand
      const ttsText = window.cpAPIInterface.getVariableValue("claraTTSText") || 
                      window.cpAPIInterface.getVariableValue("claraFinalVerdict") ||
                      "Evaluation complete.";
      
      aleert("Generating audio for text:", ttsText);
      
      fetch('https://captivate-audio.vercel.app/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          text: ttsText,
          char: 'clara'
        })
      })
      .then(response => {
        aleert("Direct TTS response status:", response.status);
        if (!response.ok) {
          throw new Error(`TTS error! status: ${response.status}`);
        }
        return response.blob();
      })
      .then(audioBlob => {
        aleert("Direct audio blob received, size:", audioBlob.size);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => URL.revokeObjectURL(audioUrl);
        audio.onerror = (e) => console.error("Direct audio error:", e);
        
        return audio.play();
      })
      .then(() => {
        aleert("Direct audio playback started");
      })
      .catch(error => {
        console.error('Error with direct audio generation:', error);
        alert('Audio unavailable. Miss Clara is too disgusted to speak.');
      });
    }
  } catch (error) {
    console.error('Error in playMissClaraEvaluation:', error);
    alert('Error playing audio. Check console for details.');
  }
}

// Make function globally available
window.playMissClaraEvaluation = playMissClaraEvaluation;

// Debug helper function - call this from console to check audio status
window.checkMissClaraAudio = function() {
  aleert("=== MISS CLARA AUDIO STATUS ===");
  aleert("window.MISS_CLARA_AUDIO:", window.MISS_CLARA_AUDIO);
  if (window.MISS_CLARA_AUDIO) {
    aleert("- Ready:", window.MISS_CLARA_AUDIO.ready);
    aleert("- Created at:", window.MISS_CLARA_AUDIO.createdAt);
    aleert("- Text length:", window.MISS_CLARA_AUDIO.text?.length);
    aleert("- Audio element exists:", !!window.MISS_CLARA_AUDIO.audio);
    aleert("- Blob size:", window.MISS_CLARA_AUDIO.blob?.size);
    aleert("- Error:", window.MISS_CLARA_AUDIO.error);
  }
  
  // Check Captivate variables
  if (window.cpAPIInterface) {
    aleert("Captivate variables:");
    aleert("- claraAudioReady:", window.cpAPIInterface.getVariableValue("claraAudioReady"));
    aleert("- claraAudioStatus:", window.cpAPIInterface.getVariableValue("claraAudioStatus"));
    aleert("- claraTTSText length:", window.cpAPIInterface.getVariableValue("claraTTSText")?.length);
  }
};