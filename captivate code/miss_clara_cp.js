// Conversational Miss Clara Interface for Captivate
// This creates a fluid chat-like experience while maintaining game structure

class MissClaraAgent {
  constructor() {
    this.conversationHistory = [];
    this.gameState = {
      currentRoom: 'water',
      currentPhase: 'introduction',
      scenariosCompleted: 0,
      totalScore: 0,
      redWineScore: 0,
      redWinePossible: 0,
      whiteWineScore: 0,
      whiteWinePossible: 0
    };
    this.userProfile = {
      experience: 'beginner',
      learningStyle: 'conversational',
      weaknesses: []
    };
  }

  async sendMessage(userMessage) {
    try {
      // Update game state from Captivate variables
      this.updateGameStateFromCaptivate();

      const response = await fetch('https://captivate-audio.vercel.app/api/miss_clara_agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userMessage,
          conversationHistory: this.conversationHistory,
          gameState: this.gameState,
          userProfile: this.userProfile
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Add to conversation history
        this.conversationHistory.push(
          { role: "user", content: userMessage },
          { role: "assistant", content: data.claraSays }
        );

        // Execute game actions
        this.executeGameActions(data.gameActions);
        
        // Display teaching moments
        this.displayTeachingMoments(data.teachingMoments);
        
        // Update Captivate with Miss Clara's response
        this.updateCaptivateDisplay(data.claraSays, data.claraAudio);
        
        // Play audio if available
        if (data.claraAudio) {
          this.playMissClara Audio(data.claraAudio);
        }
        
        return data;
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Conversation error:', error);
      this.updateCaptivateDisplay("I seem to be having technical difficulties. Please try again.");
      return null;
    }
  }

  updateGameStateFromCaptivate() {
    if (typeof window.cpAPIInterface !== 'undefined') {
      this.gameState = {
        currentRoom: window.cpAPIInterface.getVariableValue("currentRoom") || 'water',
        currentPhase: window.cpAPIInterface.getVariableValue("currentPhase") || 'introduction',
        scenariosCompleted: parseInt(window.cpAPIInterface.getVariableValue("scenariosCompleted") || "0"),
        totalScore: parseInt(window.cpAPIInterface.getVariableValue("totalScore") || "0"),
        redWineScore: parseInt(window.cpAPIInterface.getVariableValue("redWineActual") || "0"),
        redWinePossible: parseInt(window.cpAPIInterface.getVariableValue("redWinePossible") || "0"),
        whiteWineScore: parseInt(window.cpAPIInterface.getVariableValue("whiteWineActual") || "0"),
        whiteWinePossible: parseInt(window.cpAPIInterface.getVariableValue("whiteWinePossible") || "0")
      };
    }
  }

  executeGameActions(gameActions) {
    if (typeof window.cpAPIInterface === 'undefined') return;

    // Update room and phase
    if (gameActions.currentRoom) {
      window.cpAPIInterface.setVariableValue("currentRoom", gameActions.currentRoom);
    }
    if (gameActions.currentPhase) {
      window.cpAPIInterface.setVariableValue("currentPhase", gameActions.currentPhase);
    }

    // Handle scenario triggering
    if (gameActions.scenarioTriggered && gameActions.scenarioDetails) {
      this.displayScenario(gameActions.scenarioDetails);
    }

    // Handle scoring
    if (gameActions.scoreUpdate) {
      this.updateScore(gameActions.scoreUpdate);
    }

    // Handle room advancement
    if (gameActions.advanceToNextRoom) {
      this.advanceToNextRoom();
    }

    // Handle remedial requirement
    if (gameActions.requiresRemedial) {
      window.cpAPIInterface.setVariableValue("isRemedial", "true");
    }
  }

  displayScenario(scenarioDetails) {
    // Create dynamic scenario display
    window.cpAPIInterface.setVariableValue("currentScenario", scenarioDetails.guestRequest);
    window.cpAPIInterface.setVariableValue("scenarioSetting", scenarioDetails.setting);
    
    // Display wine options as buttons or dropdown
    if (scenarioDetails.wineOptions) {
      scenarioDetails.wineOptions.forEach((wine, index) => {
        window.cpAPIInterface.setVariableValue(`wineOption${index + 1}`, wine);
      });
    }
    
    // Switch to scenario interaction mode
    window.cpAPIInterface.setVariableValue("showScenarioOptions", "true");
  }

  updateScore(scoreUpdate) {
    const currentTotal = parseInt(window.cpAPIInterface.getVariableValue("totalScore") || "0");
    window.cpAPIInterface.setVariableValue("totalScore", currentTotal + scoreUpdate.points);
    
    // Update category-specific scores
    if (scoreUpdate.category === "red") {
      const current = parseInt(window.cpAPIInterface.getVariableValue("redWineActual") || "0");
      window.cpAPIInterface.setVariableValue("redWineActual", current + scoreUpdate.points);
    } else if (scoreUpdate.category === "white") {
      const current = parseInt(window.cpAPIInterface.getVariableValue("whiteWineActual") || "0");
      window.cpAPIInterface.setVariableValue("whiteWineActual", current + scoreUpdate.points);
    }
    
    // Store reasoning for learning
    window.cpAPIInterface.setVariableValue("lastScoreReasoning", scoreUpdate.reasoning);
  }

  displayTeachingMoments(teachingMoments) {
    if (teachingMoments && teachingMoments.length > 0) {
      const teachingText = teachingMoments.map(moment => 
        `${moment.concept}: ${moment.explanation}\nExample: ${moment.example}`
      ).join('\n\n');
      
      window.cpAPIInterface.setVariableValue("teachingContent", teachingText);
      window.cpAPIInterface.setVariableValue("showTeaching", "true");
    }
  }

  updateCaptivateDisplay(claraSays, claraAudio = "") {
    // Set full response for text display
    window.cpAPIInterface.setVariableValue("claraResponse", claraSays);
    
    // Set audio version for TTS
    window.cpAPIInterface.setVariableValue("claraAudioText", claraAudio);
    
    // Add to chat history display
    const currentChat = window.cpAPIInterface.getVariableValue("chatHistory") || "";
    const newChat = currentChat + "\n\nMiss Clara: " + claraSays;
    window.cpAPIInterface.setVariableValue("chatHistory", newChat);
  }

  async playMissClaraAudio(audioText) {
    try {
      const response = await fetch('https://captivate-audio.vercel.app/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: audioText,
          char: 'clara' // You'll need to add Clara's voice to your TTS voices
        })
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => URL.revokeObjectURL(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('Error playing Miss Clara audio:', error);
    }
  }

  advanceToNextRoom() {
    const currentRoom = this.gameState.currentRoom;
    let nextRoom;
    
    switch(currentRoom) {
      case 'water':
        nextRoom = 'juice';
        break;
      case 'juice':
        nextRoom = 'wine';
        break;
      case 'wine':
        nextRoom = 'completed';
        break;
      default:
        nextRoom = 'water';
    }
    
    window.cpAPIInterface.setVariableValue("currentRoom", nextRoom);
    window.cpAPIInterface.gotoSlideLabel(`${nextRoom}_room_intro`);
  }

  // Handle wine selection in conversational mode
  async selectWine(wineChoice, userReasoning = "") {
    const fullResponse = `I choose ${wineChoice}. ${userReasoning}`;
    return await this.sendMessage(fullResponse);
  }

  // Start a new conversation session
  async initializeConversation() {
    const welcomeMessage = "Hello Miss Clara, I'm ready to begin my wine service training.";
    return await this.sendMessage(welcomeMessage);
  }
}

// Global instance for Captivate
window.MissClaraAgent = new MissClaraAgent();

// Captivate Helper Functions
function sendMessageToClara() {
  const userInput = window.cpAPIInterface.getVariableValue("userInput") || "";
  if (userInput.trim()) {
    window.MissClaraAgent.sendMessage(userInput);
    window.cpAPIInterface.setVariableValue("userInput", ""); // Clear input
  }
}

function selectWineChoice(wineChoice) {
  const reasoning = window.cpAPIInterface.getVariableValue("userReasoning") || "";
  window.MissClaraAgent.selectWine(wineChoice, reasoning);
}

function startConversation() {
  window.MissClaraAgent.initializeConversation();
}

// Auto-initialize when page loads
window.addEventListener('load', () => {
  // Give Captivate time to initialize
  setTimeout(() => {
    if (window.cpAPIInterface) {
      startConversation();
    }
  }, 1000);
});