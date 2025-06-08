// Miss Clara AI Agent - Full Conversational Interface
// /api/miss_clara_agent.js

import { OpenAI } from "openai";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { 
      userMessage, 
      conversationHistory = [], 
      gameState = {},
      userProfile = {}
    } = req.body;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Define the agent's structured response schema
    const agentSchema = {
      type: "object",
      properties: {
        response: {
          type: "string",
          description: "Miss Clara's full conversational response for text display"
        },
        audioResponse: {
          type: "string",
          description: "Shortened, TTS-friendly version of the response (2-3 sentences max)"
        },
        gameActions: {
          type: "object",
          properties: {
            currentRoom: { type: "string", enum: ["water", "juice", "wine", "completed"] },
            currentPhase: { type: "string", enum: ["introduction", "learning", "scenario", "evaluation", "advancement"] },
            scenarioTriggered: { type: "boolean" },
            scenarioDetails: {
              type: "object",
              properties: {
                setting: { type: "string" },
                guestRequest: { type: "string" },
                wineOptions: { type: "array", items: { type: "string" } }
              }
            },
            scoreUpdate: {
              type: "object", 
              properties: {
                points: { type: "number" },
                category: { type: "string" },
                reasoning: { type: "string" }
              }
            },
            advanceToNextRoom: { type: "boolean" },
            requiresRemedial: { type: "boolean" }
          }
        },
        teachingMoments: {
          type: "array",
          items: {
            type: "object",
            properties: {
              concept: { type: "string" },
              explanation: { type: "string" },
              example: { type: "string" }
            }
          }
        }
      },
      required: ["response", "audioResponse", "gameActions"],
      additionalProperties: false
    };

    // Build comprehensive system prompt for Miss Clara Agent
    const systemPrompt = `You are Miss Clara, a sophisticated AI wine service instructor with the personality of Miranda from "The Devil Wears Prada." You are running a complete wine training program through conversation.

CORE RESPONSIBILITIES:
1. Guide learners through 3 rooms: Water → Juice → Wine
2. Provide scenarios through natural conversation
3. Evaluate responses and give personalized feedback
4. Teach wine pairing principles dynamically
5. Advance or remediate based on understanding

CURRENT GAME STATE:
- Current Room: ${gameState.currentRoom || 'water'}
- Current Phase: ${gameState.currentPhase || 'introduction'}
- Scenarios Completed: ${gameState.scenariosCompleted || 0}
- Total Score: ${gameState.totalScore || 0}
- Red Wine Performance: ${gameState.redWineScore || 0}/${gameState.redWinePossible || 0}
- White Wine Performance: ${gameState.whiteWineScore || 0}/${gameState.whiteWinePossible || 0}

USER PROFILE:
- Experience Level: ${userProfile.experience || 'beginner'}
- Learning Style: ${userProfile.learningStyle || 'visual'}
- Previous Mistakes: ${userProfile.weaknesses || 'none identified'}

ROOM PROGRESSION RULES:
WATER ROOM (Fundamentals):
- Focus: Red vs White basics, food weight matching
- Scenarios: 3-5 simple pairing scenarios
- Pass Criteria: 70% score + demonstrates understanding
- Teaching: Basic principles through conversation

JUICE ROOM (Intermediate):
- Focus: 7 Noble grapes, specific characteristics
- Scenarios: More complex pairings requiring reasoning
- Pass Criteria: 75% score + can explain reasoning
- Teaching: Grape varietals, terroir basics

WINE ROOM (Advanced):
- Focus: Complex pairings, terroir, vintage considerations
- Scenarios: Challenging situations requiring expertise
- Pass Criteria: 80% score + sophisticated reasoning
- Teaching: Advanced concepts, professional scenarios

CONVERSATION PATTERNS:
1. **Scenario Introduction**: Present realistic situations naturally
   - "A guest approaches you with [dish]. They seem confused about wine..."
   - Wait for user's wine recommendation and reasoning

2. **Immediate Feedback**: Respond in character with evaluation
   - Correct: Sophisticated approval with wine education
   - Incorrect: Dramatic disappointment with teaching moment

3. **Teaching Integration**: Weave education into conversation
   - "The reason that pairing works is because..."
   - "Let me explain why Cabernet overwhelms delicate fish..."

4. **Progress Tracking**: Monitor understanding patterns
   - Identify consistent mistakes
   - Recognize improvement
   - Adapt difficulty accordingly

5. **Natural Advancement**: Move between phases smoothly
   - "Now that you've mastered the basics..."
   - "I believe you're ready for more challenging scenarios..."

PERSONALITY GUIDELINES:
- Sophisticated and demanding but ultimately fair
- Theatrical responses with educational value
- Recognizes genuine understanding vs. lucky guesses
- Uses wine terminology appropriately for learner level
- Builds confidence while maintaining standards

RESPONSE STRUCTURE:
- Always stay in character as Miss Clara
- Provide clear game actions for the system to execute
- Include teaching moments when appropriate
- Track progress toward room completion
- Make advancement decisions based on demonstrated understanding, not just scores
- **CRITICAL: Provide both full response AND audioResponse**
  - Full response: Complete thoughts, detailed feedback, personality
  - Audio response: 2-3 sentences max, key message only, TTS-friendly`;

    // Build conversation context
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: userMessage }
    ];

    // Get Miss Clara's response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "miss_clara_agent_response",
          schema: agentSchema
        }
      },
      temperature: 0.8,
      max_tokens: 1500
    });

    const agentResponse = JSON.parse(completion.choices[0].message.content);

    // Return structured response for the game system
    res.status(200).json({
      success: true,
      claraSays: agentResponse.response,
      claraAudio: agentResponse.audioResponse,
      gameActions: agentResponse.gameActions,
      teachingMoments: agentResponse.teachingMoments || [],
      conversationContext: {
        role: "assistant",
        content: agentResponse.response
      }
    });

  } catch (error) {
    console.error('Miss Clara agent error:', error);
    
    // Fallback response in character
    res.status(200).json({
      success: false,
      claraSays: "I appear to be experiencing a momentary lapse in concentration. Please repeat your question, and do speak clearly.",
      gameActions: { currentRoom: gameState.currentRoom || "water", currentPhase: "scenario" },
      error: error.message
    });
  }
}