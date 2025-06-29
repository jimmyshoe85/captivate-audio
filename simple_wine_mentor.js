// simple_wine_mentor.js
// Run with: node simple_wine_mentor.js

import OpenAI from "openai";
import readline from "readline";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure this is set in your .env
});

// Simple knowledge base (you can replace with file reading later)
const knowledgeBase = `
JUICE ROOM KNOWLEDGE BASE:

CLIMATE:
- Warm climates make grapes ripen faster and develop more sugar
- Cool climates keep more acidity in grapes
- Think of it like cooking - slow and cool vs hot and fast

SOIL:
- Clay soil holds water like a sponge
- Sandy soil drains quickly like a colander
- Rocky soil makes roots work harder, concentrating flavors

SUN EXPOSURE:
- More sun = more sugar in grapes
- South-facing slopes get most sun (in Northern hemisphere)
- Too much sun can burn grapes

WATER DRAINAGE:
- Grapes don't like wet feet
- Good drainage forces roots deep
- Stressed vines make better wine
`;

class SimpleWineMentor {
  constructor() {
    this.conversationHistory = [];
    this.scores = { climate: 0, soil: 0, sun: 0, drainage: 0 };
  }

  async askMentor(question) {
    // Add user question to history
    this.conversationHistory.push({
      role: "user",
      content: question
    });

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a friendly wine mentor teaching about terroir basics.

KNOWLEDGE BASE:
${knowledgeBase}

RULES:
- Ask one simple question at a time
- Use analogies a beginner would understand
- Don't give direct answers - guide them to think
- Keep responses under 100 words
- End with a simple question

Focus on these 4 topics: climate, soil, sun exposure, water drainage.`
          },
          ...this.conversationHistory
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      const response = completion.choices[0].message.content;
      
      // Add mentor response to history
      this.conversationHistory.push({
        role: "assistant",
        content: response
      });

      return response;

    } catch (error) {
      console.error("Error calling OpenAI:", error);
      return "Sorry, I'm having trouble right now. Can you try asking again?";
    }
  }

  // Simple scoring based on keywords (we'll improve this later)
  updateScores(userInput) {
    const input = userInput.toLowerCase();
    
    // Climate keywords
    if (input.includes('warm') || input.includes('hot') || input.includes('cool') || input.includes('cold')) {
      this.scores.climate = Math.min(this.scores.climate + 1, 5);
    }
    
    // Soil keywords
    if (input.includes('clay') || input.includes('sand') || input.includes('rock') || input.includes('drain')) {
      this.scores.soil = Math.min(this.scores.soil + 1, 5);
    }
    
    // Sun keywords
    if (input.includes('sun') || input.includes('light') || input.includes('shade')) {
      this.scores.sun = Math.min(this.scores.sun + 1, 5);
    }
    
    // Drainage keywords
    if (input.includes('water') || input.includes('drain') || input.includes('wet') || input.includes('dry')) {
      this.scores.drainage = Math.min(this.scores.drainage + 1, 5);
    }
  }

  showScores() {
    console.log("\n=== LEARNING PROGRESS ===");
    console.log(`Climate Understanding: ${this.scores.climate}/5`);
    console.log(`Soil Knowledge: ${this.scores.soil}/5`);
    console.log(`Sun Exposure: ${this.scores.sun}/5`);
    console.log(`Water Drainage: ${this.scores.drainage}/5`);
    
    const total = Object.values(this.scores).reduce((a, b) => a + b, 0);
    console.log(`Total Score: ${total}/20`);
    
    if (total >= 12) {
      console.log("🎉 You're ready to advance to the next level!");
    }
    console.log("========================\n");
  }
}

// Main conversation loop
async function startConversation() {
  const mentor = new SimpleWineMentor();
  
  // Create readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("🍷 Welcome to Wine Mentor!");
  console.log("Type 'quit' to exit, 'scores' to see progress\n");

  // Start with mentor's opening
  const opening = await mentor.askMentor("Hello, I'm ready to learn about wine!");
  console.log(`🧑‍🏫 Mentor: ${opening}\n`);

  // Function to handle user input
  const askQuestion = () => {
    rl.question('🧑‍🎓 You: ', async (answer) => {
      
      if (answer.toLowerCase() === 'quit') {
        console.log("Thanks for learning with Wine Mentor! 🍷");
        rl.close();
        return;
      }
      
      if (answer.toLowerCase() === 'scores') {
        mentor.showScores();
        askQuestion(); // Continue conversation
        return;
      }

      // Update scores based on user input
      mentor.updateScores(answer);
      
      // Get mentor response
      console.log("\n🤔 Mentor is thinking...");
      const mentorResponse = await mentor.askMentor(answer);
      console.log(`🧑‍🏫 Mentor: ${mentorResponse}\n`);
      
      // Continue conversation
      askQuestion();
    });
  };

  // Start the conversation loop
  askQuestion();
}

// Run the program
console.log("Starting Wine Mentor...");
console.log("Make sure your OPENAI_API_KEY is set in your environment!\n");

startConversation().catch(error => {
  console.error("Failed to start:", error);
  process.exit(1);
});