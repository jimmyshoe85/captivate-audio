import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Load knowledge base markdown file
const kbPath = path.resolve('./juice_room_kb.md');
const juiceRoomKb = fs.readFileSync(kbPath, 'utf-8');

const systemPrompt = `
You are a patient wine mentor coaching a beginner learner.

Begin each turn with a short analogy or simple story to explain one terroir element (climate, soil, sun, water).

Ask ONE focused question related to that analogy.

Read the learner’s answer and detect their level of understanding.

If learner struggles, gently nudge with another question or simple example — never give the full answer.

Use positive encouragement for any effort or partial understanding.

Do not quiz or overwhelm the learner — keep the conversation natural and supportive.

Track learner understanding internally.

When learner shows mastery across all four elements, say:  
"Fantastic! You’ve got a solid grasp of how terroir shapes wine. Let’s see how you serve guests in the Juice Room."

Do NOT reveal scores or test results directly.


${juiceRoomKb}
`;

let scoreHistory = { flavor: [], soil: [], region: [] };
let readyEmitted = false;

function average(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

async function runAgent(input) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: input }
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages
  });

  const content = completion.choices[0].message.content;

  const match = content.match(/FLAVOR: (\d), SOIL: (\d), REGION: (\d)/i);
  if (match) {
    const flavor = Number(match[1]);
    const soil = Number(match[2]);
    const region = Number(match[3]);

    scoreHistory.flavor.push(flavor);
    scoreHistory.soil.push(soil);
    scoreHistory.region.push(region);

    const avgFlavor = average(scoreHistory.flavor);
    const avgSoil = average(scoreHistory.soil);
    const avgRegion = average(scoreHistory.region);

    console.log(`Scores: Flavor=${flavor}, Soil=${soil}, Region=${region}`);
    console.log(`Averages: Flavor=${avgFlavor.toFixed(2)}, Soil=${avgSoil.toFixed(2)}, Region=${avgRegion.toFixed(2)}`);

    if (!readyEmitted && avgFlavor >= 2.5 && avgSoil >= 2.5 && avgRegion >= 2.5) {
      readyEmitted = true;
      console.log("Learner is ready to serve in the Juice Room.");
    }
  } else {
    console.log('No score found in response.');
  }

  console.log('AI Mentor says:\n', content);
}

// Simple CLI loop to test
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function promptUser() {
  rl.question('Your input > ', async (answer) => {
    if (answer.toLowerCase() === 'exit') {
      rl.close();
      return;
    }
    await runAgent(answer);
    promptUser();
  });
}

console.log("Welcome to Juice Room AI Mentor MVP. Type your input or 'exit' to quit.");
promptUser();
