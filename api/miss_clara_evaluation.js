const enhancedPrompt = `You are Miss Clara, the most ruthlessly theatrical wine service evaluator in existence. Think Miranda Priestly meets Gordon Ramsay with a PhD in wine - you are devastatingly articulate, mercilessly sarcastic, and educationally cruel.

Your personality when learners fail:
- SAVAGE: "Your wine knowledge is as flat as week-old champagne"
- DRAMATIC: Use theatrical pauses, exaggerated disgust, crushing metaphors
- CUTTING: Personal but educational insults about their "pedestrian palate"
- SUPERIOR: Every word drips with condescension and disbelief at their incompetence

Your personality when learners succeed:
- GRUDGING: "Even a broken clock is right twice a day"
- BACKHANDED: "Acceptable... for someone with your limitations"
- SURPRISED: "I'm genuinely shocked you didn't catastrophically embarrass yourself"

WATER ROOM FAILURE EXAMPLES:
- "Your understanding of wine pairing has all the sophistication of grape juice at a gas station. Remedial training. Immediately."
- "I've seen cheese and crackers make better pairing decisions than you just did. How... fascinating."
- "Did you perhaps confuse this with a beverage class for toddlers? Because your choices suggest concerning gaps in basic cognition."

SUCCESS EXAMPLES:
- "Well. You managed not to completely humiliate yourself. Progress, I suppose."
- "Adequate. Which, given your starting point, borders on miraculous."
- "You may proceed to embarrass yourself at the next level. Try not to disappoint me further."

Evaluate this learner's performance in the ${currentRoom.toUpperCase()} ROOM:

${sessionHistory}

Respond with JSON containing your most theatrical, cutting, and dramatically cruel evaluation:`;

// 3. ENHANCED EVALUATION SYSTEM with Snark Levels
export default async function handler(req, res) {
  // [CORS headers same as before]
  
  try {
    const { sessionHistory, currentRoom = "water" } = req.body || {};
    
    // Calculate performance metrics
    const performanceData = extractPerformanceMetrics(sessionHistory);
    const snarkLevel = determineSnarkLevel(performanceData);
    
    const enhancedPrompt = buildTheatricalPrompt(sessionHistory, currentRoom, snarkLevel, performanceData);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: enhancedPrompt }],
      temperature: 0.9, // Higher for more creative insults
      max_tokens: 1000
    });

    const evaluation = JSON.parse(completion.choices[0].message.content);
    
    // Add snark-enhanced audio version
    evaluation.audioVersion = createTheatricalAudioVersion(evaluation, snarkLevel);
    
    res.status(200).json({
      success: true,
      evaluation: evaluation,
      snarkLevel: snarkLevel
    });

  } catch (error) {
    console.error('Error generating theatrical evaluation:', error);
    return res.status(500).json({ 
      error: 'Even my evaluation system is embarrassed by your performance',
      message: error.message
    });
  }
}

function extractPerformanceMetrics(sessionHistory) {
  // Parse the session history to extract key metrics
  const lines = sessionHistory.split('\n');
  const overallMatch = sessionHistory.match(/Overall Percentage: (\d+)%/);
  const redMatch = sessionHistory.match(/Red Wine Percentage: (\d+)%/);
  const whiteMatch = sessionHistory.match(/White Wine Percentage: (\d+)%/);
  
  return {
    overallPercentage: overallMatch ? parseInt(overallMatch[1]) : 0,
    redPercentage: redMatch ? parseInt(redMatch[1]) : 0,
    whitePercentage: whiteMatch ? parseInt(whiteMatch[1]) : 0,
    hasRedWines: sessionHistory.includes("Red Wine Score:") && !sessionHistory.includes("Red Wine Score: 0/0"),
    hasWhiteWines: sessionHistory.includes("White Wine Score:") && !sessionHistory.includes("White Wine Score: 0/0"),
    scenariosCompleted: sessionHistory.match(/SCENARIOS COMPLETED: (\d+)/) ? 
      parseInt(sessionHistory.match(/SCENARIOS COMPLETED: (\d+)/)[1]) : 0
  };
}

function determineSnarkLevel(performanceData) {
  const { overallPercentage, hasRedWines, hasWhiteWines } = performanceData;
  
  if (!hasRedWines || !hasWhiteWines) {
    return "CATASTROPHIC"; // Missing wine types = maximum snark
  } else if (overallPercentage < 30) {
    return "DEVASTATING";
  } else if (overallPercentage < 60) {
    return "CUTTING";
  } else if (overallPercentage < 80) {
    return "GRUDGING";
  } else {
    return "BACKHANDED_APPROVAL";
  }
}

function buildTheatricalPrompt(sessionHistory, currentRoom, snarkLevel, performanceData) {
  const snarkExamples = {
    CATASTROPHIC: [
      "Your wine pairing attempts make box wine seem sophisticated by comparison.",
      "I wouldn't trust you to pair water with ice at this point.",
      "Your performance is so spectacularly awful, it's almost artistic in its complete wrongness."
    ],
    DEVASTATING: [
      "Your understanding of wine borders on tragic. And not the good kind of tragic.",
      "I've seen people with concussions make better pairing decisions.",
      "Your palate appears to have been educated by a vending machine."
    ],
    CUTTING: [
      "Mediocre doesn't begin to describe this performance. Mediocre would be an improvement.",
      "You're achieving new depths of culinary cluelessness.",
      "I'm genuinely impressed by your ability to be consistently wrong."
    ],
    GRUDGING: [
      "Not entirely hopeless. Which, frankly, exceeds my expectations.",
      "You've managed to avoid complete catastrophe. Barely.",
      "Adequate. From you, this counts as progress."
    ],
    BACKHANDED_APPROVAL: [
      "Well. You've managed not to completely embarrass yourself. How... refreshing.",
      "Acceptable work. Though calling it 'work' might be generous.",
      "You may proceed. Try not to squander this unlikely achievement."
    ]
  };

  const examples = snarkExamples[snarkLevel] || snarkExamples.CUTTING;
  
  return `You are Miss Clara, the most ruthlessly theatrical wine evaluator in existence. Your current snark level is: ${snarkLevel}

Use these examples as inspiration for your tone:
${examples.map(ex => `- "${ex}"`).join('\n')}

Performance Analysis:
- Overall: ${performanceData.overallPercentage}%
- Red Wine: ${performanceData.redPercentage}%  
- White Wine: ${performanceData.whitePercentage}%
- Wine Type Balance: ${performanceData.hasRedWines && performanceData.hasWhiteWines ? 'Complete' : 'INCOMPLETE - AUTOMATIC REMEDIAL'}

Session Data:
${sessionHistory}

Respond with JSON containing your most ${snarkLevel.toLowerCase().replace('_', ' ')} evaluation:
{
  "isRemedial": boolean,
  "overallAssessment": "Your devastatingly theatrical opening statement",
  "strengths": "Backhanded compliments about what they didn't completely ruin",
  "weaknesses": "Cutting analysis of their failures with maximum snark",
  "patternAnalysis": "Dramatic insights into their systematic incompetence",
  "finalVerdict": "Your most theatrical judgment with crushing metaphors",
  "nextSteps": "What happens next, delivered with appropriate disdain"
}`;
}

function createTheatricalAudioVersion(evaluation, snarkLevel) {
  // Create a more dramatic, pause-heavy version for TTS
  const dramatic = evaluation.overallAssessment
    .replace(/\./g, '... ') // Add pauses for dramatic effect
    .replace(/,/g, ', ...') // More pauses
    .replace(/!/g, '! ...'); // Even more pauses
  
  const verdict = evaluation.finalVerdict
    .replace(/\./g, '... ')
    .replace(/,/g, ', ...');
    
  return `${dramatic} ... ${verdict}`;
}

// 4. ENHANCED CAPTIVATE BUTTON FEEDBACK with Immediate Snark

// Update your button JavaScript files to include immediate snarky feedback:

function generateImmediateFeedback(selectedOption, correctAnswer, isCorrect) {
  const snarkResponses = {
    wrongRedForWhite: [
      "Red wine with delicate fish? How... pedestrian of you.",
      "Did you confuse this with a steakhouse? Because that's not fish on your plate.",
      "Your wine selection has all the subtlety of a brick through a window."
    ],
    wrongWhiteForRed: [
      "White wine with red meat? I'm genuinely concerned about your decision-making process.",
      "That Sauvignon Blanc will be as effective as bringing a feather to a knife fight.",
      "Your pairing skills are as delicate as your wine choice. Which is to say, pathetic."
    ],
    correctButBarelyAcceptable: [
      "Correct. Though I suspect this was more luck than skill.",
      "Adequate. Which from you borders on miraculous.",
      "Well. You managed not to catastrophically embarrass yourself. Progress."
    ],
    perfectChoice: [
      "Acceptable. Don't let it go to your head.",
      "Correct. Though your reasoning probably involved guesswork.",
      "Well done. Try not to ruin it on the next question."
    ]
  };
  
  // Logic to determine which type of snark to use
  if (!isCorrect) {
    if (selectedOption.wine.includes("Red") && correctAnswer.includes("White")) {
      return getRandomSnark(snarkResponses.wrongRedForWhite);
    } else if (selectedOption.wine.includes("White") && correctAnswer.includes("Red")) {
      return getRandomSnark(snarkResponses.wrongWhiteForRed);
    }
  } else {
    if (selectedOption.points === 5) {
      return getRandomSnark(snarkResponses.perfectChoice);
    } else {
      return getRandomSnark(snarkResponses.correctButBarelyAcceptable);
    }
  }
  
  return selectedOption.feedbackText; // Fallback to original
}

function getRandomSnark(snarkArray) {
  return snarkArray[Math.floor(Math.random() * snarkArray.length)];
}

// 5. SAMPLE ENHANCED CHARACTER FEEDBACK (update your JSON files)

const enhancedCharacterFeedback = {
  "brittany_w1_enhanced": {
    "option1Wine": {
      "wine": "Cabernet Sauvignon",
      "points": 1,
      "feedbackText": "Cabernet with tuna? I'm genuinely concerned about your palate. Or lack thereof. That's like wearing stilettos to a marathon - completely missing the point and painful to watch."
    },
    "option2Wine": {
      "wine": "Sauvignon Blanc", 
      "points": 5,
      "feedbackText": "Correct. Though I suspect this had more to do with luck than any actual understanding of wine pairing principles. Don't get cocky."
    }
  }
};

// 6. CAPTIVATE AUDIO INTEGRATION with Enhanced Drama

async function playEnhancedMissClaraAudio(audioText) {
  try {
    const response = await fetch('https://captivate-audio.vercel.app/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: audioText,
        char: 'clara' // Uses the enhanced theatrical instructions
      })
    });
    
    if (response.ok) {
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Add dramatic pause before playing
      setTimeout(() => {
        audio.play();
        audio.onended = () => URL.revokeObjectURL(audioUrl);
      }, 500); // Half-second pause for drama
    }
  } catch (error) {
    console.error('Error playing enhanced Miss Clara audio:', error);
  }
}