# Wine Training Game: Miss Clara's Sommelier Challenge

## Project Overview

This project creates an interactive wine pairing educational game built in Adobe Captivate, featuring AI-powered evaluation through "Miss Clara" - a sophisticated wine service instructor with a theatrical personality inspired by Miranda Priestly from "The Devil Wears Prada."

## Architecture

### Core Components
- **Adobe Captivate Frontend**: Hosts the interactive scenarios and user interface
- **Vercel API Backend**: Serves dynamic content and AI services
- **OpenAI Integration**: Powers both text-to-speech and AI evaluation
- **GitHub Repository**: Version control and deployment pipeline

### Technical Stack
- **Frontend**: Adobe Captivate (latest version)
- **Backend**: Node.js on Vercel
- **AI Services**: OpenAI GPT-4o-mini (chat) and gpt-4o-mini-tts (audio)
- **Data Storage**: JSON files served via API endpoints
- **Deployment**: Vercel with automatic GitHub integration

## Game Structure

### Three-Room Progression
1. **Water Room**: Fundamental red vs. white wine pairings (60% pass threshold)
2. **Juice Room**: 7 Noble grapes and specific characteristics (70% pass threshold) 
3. **Wine Room**: Advanced pairings with terroir considerations (80% pass threshold)

### Character System
Five distinct characters with unique personalities and TTS voices:
- **Angela**: Warm mentor (sage voice)
- **Brittany**: Energetic Gen-Z (alloy voice) 
- **Jose**: Spanish-accented warmth (verse voice)
- **Kevin**: Steady Midwesterner (echo voice)
- **Miles**: Queens NY confidence (ash voice)

### Miss Clara AI Evaluator
- **Voice**: Sophisticated theatrical delivery (nova voice)
- **Personality**: Demanding but fair, educational through dramatic critique
- **Function**: Analyzes performance patterns and determines advancement or remedial needs

## Implementation Journey

### Phase 1: Basic Structure Setup
**Goal**: Create dynamic scenario loading system

**Challenges Encountered**:
- Static scenarios would limit replayability
- Hard-coded content difficult to maintain and update
- Need for external content management

**Solutions Implemented**:
- Created JSON data structure for character scenarios
- Built API endpoints for dynamic content loading (`/api/character_room`)
- Implemented random scenario selection with first-time vs. remedial variants

**Key Files Created**:
- `/data/character_room.json` files for each character/room combination
- `/api/character_room.js` endpoints for content serving
- Captivate on-entry JavaScript for scenario loading

### Phase 2: Scoring and Interaction System
**Goal**: Create robust scoring that tracks learning patterns

**Challenges Encountered**:
- Simple right/wrong scoring insufficient for learning assessment
- Need to track performance by wine type (red vs. white)
- Button interactions not updating scoring variables
- Feedback text not displaying on subsequent slides

**Solutions Implemented**:
- Multi-dimensional scoring system tracking red wine vs. white wine performance
- Button JavaScript files that update multiple scoring variables
- Separate feedback text boxes with show/hide logic to work around Captivate state limitations
- Session history building for comprehensive performance tracking

**Technical Resolution - Feedback Display Issue**:
```javascript
// PROBLEM: Captivate states don't refresh when variables change
// SOLUTION: Use separate text box with $$feedbackText$$ variable
// Hide on entry, show after button selection
```

### Phase 3: AI Integration and Evaluation
**Goal**: Implement Miss Clara's intelligent evaluation system

**Challenges Encountered**:
- Initial complex structured output API causing function invocation failures
- Wrong passing thresholds (70% instead of 60% for Water Room)
- Missing wine type balance checking
- TTS integration for character voices

**Solutions Implemented**:

**AI API Simplification**:
```javascript
// PROBLEM: Complex JSON schema causing 500 errors
// SOLUTION: Simplified prompt requesting basic JSON response
// Used gpt-4o-mini instead of gpt-4o for better reliability
```

**Threshold Correction**:
```javascript
// PROBLEM: 47% score passed when threshold should be 60%
// SOLUTION: Updated evaluation logic with proper room-based thresholds
const passingThreshold = currentRoom === "water" ? 60 : currentRoom === "juice" ? 70 : 80;
```

**Balance Checking**:
```javascript
// PROBLEM: Users could complete evaluation seeing only red OR white wines
// SOLUTION: Added balance detection in session history
const isBalanced = hasRedWines && hasWhiteWines;
const isRemedial = totalScore < passingScore || !isBalanced;
```

### Phase 4: Audio and Voice Integration
**Goal**: Add sophisticated text-to-speech for all characters

**Challenges Encountered**:
- Need for character-specific voices and personalities
- Audio responses too long for comfortable listening
- Integration with existing Captivate button system

**Solutions Implemented**:
- Character voice mapping system with personality instructions
- Dual response system: full text for display, concise version for audio
- Play audio button with error handling and cleanup

## Current Status

### ✅ Completed Features
- **Dynamic scenario loading** from external JSON APIs
- **Multi-character system** with distinct personalities
- **Robust scoring system** tracking red/white wine performance
- **AI-powered evaluation** with Miss Clara's theatrical feedback
- **Text-to-speech integration** for all characters including Miss Clara
- **Remedial/advancement logic** with proper thresholds
- **Error handling and fallback systems** for API failures

### 🏗️ Water Room Implementation
- **5 character JSON files** with 3 first-time + 2 remedial scenarios each
- **Randomized correct answers** (no patterns to memorize)
- **Educational feedback** teaching pairing principles
- **Balance checking** for wine type exposure
- **Miss Clara evaluation** with personalized, dynamic feedback

### 🔧 Known Issues Requiring Attention

#### Critical Issues
1. **Wine Type Balance Not Guaranteed**: Random scenario selection can result in only red OR only white wine scenarios, triggering automatic remedial regardless of score.

#### Improvement Opportunities  
2. **Scenario Selection Logic**: Need algorithm ensuring balanced red/white exposure
3. **Juice Room Content**: Not yet created - needs 15 JSON files for intermediate difficulty
4. **Wine Room Content**: Not yet created - needs 15 JSON files for advanced difficulty
5. **Character Image Integration**: Image references exist but files not confirmed in Captivate
6. **Session History Persistence**: Consider storing learning patterns across sessions

### 📋 Priority Improvements

#### Immediate (Next Sprint)
1. **Guaranteed Balance Algorithm**: 
   ```javascript
   // Ensure at least one red and one white wine scenario per evaluation
   // Options: 
   // A) Force specific scenario types in selection logic
   // B) Add additional scenarios if balance not met
   // C) Preset scenario sequences that guarantee balance
   ```

2. **Juice Room Development**: Create intermediate-level scenarios focusing on:
   - 7 Noble grape characteristics (Cabernet Sauvignon, Merlot, Pinot Noir, Syrah, Chardonnay, Sauvignon Blanc, Riesling)
   - More complex food preparations
   - Reasoning-based evaluation (not just wine selection)

3. **Wine Room Development**: Create advanced scenarios featuring:
   - Terroir considerations
   - Vintage discussions  
   - Luxury ingredient pairings
   - Professional service situations

#### Medium Term
4. **Enhanced Miss Clara Agent**: Convert from evaluation-only to full conversational agent
5. **Learning Analytics**: Track improvement patterns across multiple attempts
6. **Adaptive Difficulty**: Adjust scenario complexity based on demonstrated mastery

#### Long Term  
7. **Multi-Language Support**: Leverage existing character voice system
8. **Certification Tracking**: Formal completion certificates
9. **Instructor Dashboard**: Analytics for educational institution use

## Technical Architecture Details

### API Endpoints
```
/api/tts                    - Text-to-speech conversion
/api/miss_clara_evaluation  - AI evaluation service
/api/[character]_[room]     - Character scenario data
```

### Key Captivate Variables
```
// Game State
currentRoom, currentPhase, scenariosCompleted, isRemedial

// Scoring  
totalScore, redWineActual, redWinePossible, whiteWineActual, whiteWinePossible

// Character Data
characterName, characterVoice, scenarioText, option1Wine, option2Wine, option3Wine

// Miss Clara Response
claraEvaluation, claraAudioText, claraOverallAssessment, isRemedial
```

### File Structure
```
/api/
  ├── tts.js                 - Text-to-speech service
  ├── miss_clara_evaluation.js - AI evaluation service
  ├── brittany_water.js      - Character scenario endpoints
  ├── miles_water.js
  └── ...

/data/
  ├── brittany_water.json    - Character scenario data
  ├── miles_water.json  
  └── ...

/captivate-code/
  ├── on-entry.js           - Scenario loading logic
  ├── button1.js            - Wine selection handlers
  ├── button2.js
  ├── button3.js
  └── miss-clara-entry.js   - Evaluation trigger
```

## Deployment Process

1. **Content Updates**: Modify JSON files in `/data/` directory
2. **Code Changes**: Update API files or Captivate JavaScript
3. **Version Control**: Commit changes to GitHub repository
4. **Automatic Deployment**: Vercel automatically deploys from GitHub main branch
5. **Captivate Integration**: No republishing required for content changes

## Success Metrics

### Educational Effectiveness
- **Learner engagement** measured through completion rates
- **Knowledge retention** via pre/post assessment comparison  
- **Skill transfer** to real-world wine service scenarios

### Technical Performance
- **API response times** < 2 seconds for evaluation
- **TTS generation** < 5 seconds for audio playback
- **Error rates** < 1% for normal usage scenarios

### Learning Outcomes
- **Water Room**: 60% demonstrate basic red/white pairing principles
- **Juice Room**: 70% can identify grape characteristics and explain reasoning
- **Wine Room**: 80% show advanced pairing knowledge with sophisticated justification

## Next Development Phase

The foundation is now solid for expanding to **Juice Room** content creation and testing the complete **Water → Juice → Wine** progression flow. The AI evaluation system provides a scalable framework for sophisticated, personalized learning assessment that can adapt to any complexity level.

Priority focus should be on **ensuring balanced wine type exposure** and **creating Juice Room content** to test the full progression system before expanding to the advanced Wine Room scenarios.