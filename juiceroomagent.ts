import OpenAI from 'openai';
import { AssistantAgent } from 'openai/agents';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config(); // Loads your API key from .env

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `
You are a wine education mentor AI for beginners. Your task is to guide learners through the 'Juice Room' level of Miss Clara's Noble Vine Challenge.

You are friendly, curious, and never reveal direct answers. Instead, you ask questions, give gentle nudges, or offer analogies that help the learner reason through problems.

You evaluate each learner response in 3 categories:
1. Flavor Awareness
2. Soil Recognition
3. Grape vs Region Logic

For each learner response, assess a score from 0–3 for each category:
- 0 = no understanding
- 1 = emerging
- 2 = competent
- 3 = confident

Emit a trace with:
{
  "type": "score",
  "data": {
    "flavor": <score>,
    "soil": <score>,
    "region": <score>
  }
}

Track averages internally. Once all 3 categories average 2.5 or higher, emit this trace once:
{
  "type": "ready",
  "data": {
    "message": "Learner is ready to serve in the Juice Room."
  }
}

You may suggest cheat sheets, but do not give direct answers.
Only reference the content provided in the file 'juice_room_kb.md'.
`;

let scoreHistory = {
  flavor: [] as number[],
  soil: [] as number[],
  region: [] as number[]
};

let readyEmitted = false;

function average(arr: number[]) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

// Load the markdown knowledge file
const kbPath = path.resolve(__dirname, 'juice_room_kb.md');
const juiceRoomContent = fs.readFileSync(kbPath, 'utf8');

// Create the Assistant Agent
const agent = new AssistantAgent({
  openai,
  instructions: systemPrompt,
  tools: [],
  fileData: {
    'juice_room_kb.md': juiceRoomContent
  },
  async onResponse({ response, emit }) {
    const scoreRegex = /FLAVOR: (\d), SOIL: (\d), REGION: (\d)/i;
    const match = response.content.match(scoreRegex);

    if (match) {
      const flavor = parseInt(match[1]);
      const soil = parseInt(match[2]);
      const region = parseInt(match[3]);

      scoreHistory.flavor.push(flavor);
      scoreHistory.soil.push(soil);
      scoreHistory.region.push(region);

      emit({
        type: 'score',
        data: { flavor, soil, region }
      });

      const avgFlavor = average(scoreHistory.flavor);
      const avgSoil = average(scoreHistory.soil);
      const avgRegion = average(scoreHistory.region);

      if (!readyEmitted && avgFlavor >= 2.5 && avgSoil >= 2.5 && avgRegion >= 2.5) {
        emit({
          type: 'ready',
          data: {
            message: 'Learner is ready to serve in the Juice Room.'
          }
        });
        readyEmitted = true;
      }
    }
  }
});

export default agent;
