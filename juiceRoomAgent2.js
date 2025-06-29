import OpenAI from "openai";
import { AssistantAgent } from "openai/agents";
import fs from "fs";

// Load your markdown knowledge base
const knowledgeBase = fs.readFileSync("./juice_room_kb.md", "utf-8");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
You are a friendly wine mentor AI coaching a beginner learner in the Juice Room.

Use simple analogies and one question at a time to check understanding of climate, soil, sun exposure, and water drainage.

Never give direct answers. Encourage reflection.
a
Only use info from the knowledge base.

Track learner understanding internally and announce readiness when they show mastery.
`;

async function main() {
  const agent = new AssistantAgent({
    openai,
    instructions: systemPrompt,
    fileData: {
      "juice_room_kb.md": knowledgeBase,
    },
    modelName: "gpt-4o-mini",
    async onResponse({ response, emit }) {
      // Here you parse the learner response and emit traces (scores, ready)
      // Example: parse scores from response and emit a 'score' trace, emit 'ready' when appropriate
      console.log("AI Mentor response:", response.content);
      // Emit traces as needed (see your scoring logic)
    },
  });

  // Example conversation
  const learnerMessage = {
    role: "user",
    content: "I think warm climate makes the wine taste sweeter.",
  };

  const result = await agent.respond({ messages: [learnerMessage] });
  console.log("Agent reply:", result.content);
}

main();
