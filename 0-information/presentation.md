# Building Adaptive Learning: A Practical Blueprint
## What to Hard-Code vs. What to Let AI Handle

**45-Minute Conference Session**
*For Instructional Designers Ready to Build*

---

## Session Overview (45 minutes)

- **The Blueprint Approach** (8 minutes) - Control vs. AI decisions
- **Your Tech Stack** (10 minutes) - 4 tools, that's it
- **Design Framework** (15 minutes) - What you control vs. what AI controls
- **Implementation Walkthrough** (10 minutes) - Step-by-step build process
- **Q&A + Resources** (2 minutes) - Get started today

---

## The Blueprint Approach (8 minutes)

### The Core Question: What Should You Control?

**You Hard-Code (Control):**
- Learning objectives
- Assessment rubric
- Core game mechanics
- Visual design
- Advancement thresholds

**AI Handles (Flexibility):**
- Specific scenario text
- Personalized feedback
- Difficulty adaptation
- Content variations

### The Wine Training Example

**You Designed:**
- 3-room progression (Water → Juice → Wine)
- Red vs. White wine learning objectives
- 60% pass threshold for Water Room
- 5 character personalities

**AI Generates:**
- 15+ unique scenarios per character
- Personalized feedback based on performance
- Advancement/remedial decisions
- Character voice variations

**Key Insight**: You design the learning architecture, AI fills in the content details.

### Why This Approach Works

**Maintains Pedagogical Control:**
- Your expertise drives learning design
- Assessment stays aligned to objectives
- Quality standards remain consistent

**Adds Dynamic Flexibility:**
- Content feels fresh on every attempt
- Feedback matches individual patterns
- Difficulty adapts to learner needs

**Scales Your Expertise:**
- One design framework → infinite variations
- Your teaching philosophy → AI delivery
- Expert-level feedback → every student

---

## Your Tech Stack (10 minutes)

### Four Tools - That's It

**1. Claude (Your AI Partner)**
- Role: Content generation and code writing
- Use: "Write me a JSON structure for wine scenarios"
- Cost: $20/month Claude Pro
- Why: Best at understanding instructional design context

**2. VS Code (Your Development Environment)**
- Role: Code editing and file management
- Use: Edit templates, manage JSON files
- Cost: Free
- Why: Professional but approachable

**3. Vercel (Your API Protection Layer)**
- Role: Hosts your AI endpoints securely
- Use: Protects your OpenAI API key, serves content
- Cost: Free for small projects
- Why: No server management, automatic deployment

**4. OpenAI API (Your AI Engine)**
- Role: Generates content and evaluates performance
- Use: Text generation, text-to-speech, evaluation
- Cost: $50-200/month depending on usage
- Why: Most reliable, best quality results

### Why This Stack Works

**No Complex Platforms:**
- Skip learning new authoring tools
- Use your existing Captivate/Storyline/Rise
- Add AI as enhancement layer

**Beginner-Friendly:**
- Claude writes your code for you
- Copy-paste development approach
- Visual interface in your authoring tool

**Scales Up:**
- Start with simple scenarios
- Add complexity gradually
- Professional deployment from day one

---

## Design Framework: Control vs. AI (15 minutes)

### Part 1: What You Hard-Code (Your Control Zone)

**Learning Architecture:**
```
Water Room: Basic concepts (60% pass)
├── 5 characters × 3 scenarios each
├── Red wine vs. White wine focus
└── Simple multiple choice format

Juice Room: Intermediate (70% pass)  
├── 7 noble grapes
├── More complex reasoning
└── Justification required

Wine Room: Advanced (80% pass)
├── Terroir concepts
├── Professional scenarios
└── Open-ended responses
```

**Assessment Structure:**
```json
{
  "scenario_template": {
    "character": "fixed",
    "difficulty": "fixed", 
    "learning_objective": "fixed",
    "assessment_rubric": "fixed"
  }
}
```

**Game Mechanics:**
- Point values (1, 3, 5 points)
- Advancement thresholds (60%, 70%, 80%)
- Remedial triggers (unbalanced performance)
- Character personality traits

### Part 2: What AI Generates (Flexibility Zone)

**Dynamic Content:**
```json
{
  "ai_generated": {
    "scenario_text": "15+ variations per template",
    "food_descriptions": "Infinite combinations",
    "feedback_responses": "Personalized to performance", 
    "evaluation_text": "Pattern-based assessment"
  }
}
```

**Example AI Prompt Structure:**
```
You are Brittany, energetic Gen-Z character.
Create a scenario where student must choose wine for [FOOD_TYPE].
Learning objective: [OBJECTIVE]
Correct answer should be: [WINE_TYPE]
Generate encouraging but educational feedback.
```

**Personalization Factors:**
- Previous performance patterns
- Character personality matching
- Difficulty adaptation
- Error type analysis

### Part 3: The JSON Control System

**Scenario Template:**
```json
{
  "id": "brittany_w1",
  "character": "Brittany",
  "room": "water",
  "food_category": "seafood",
  "preparation": "raw",
  "correct_wine": "white",
  "learning_principle": "delicate_food_delicate_wine",
  "difficulty": "beginner"
}
```

**AI Fills In:**
```json
{
  "scenario_text": "Help! I ordered this tuna poke bowl...",
  "option1": {
    "wine": "Cabernet Sauvignon",
    "points": 1,
    "feedback": "Oops! Cabernet's bold tannins would..."
  }
}
```

**Why This Works:**
- **Controlled Randomness**: AI varies content but stays on-objective
- **Consistent Quality**: Templates ensure educational soundness
- **Easy Updates**: Change JSON, instant content updates
- **No Republishing**: Content served dynamically

### Part 4: Code Templates for Scaling

**Slide Template Structure:**
```
Scenario Slide Template:
├── Character image (variable)
├── Scenario text (AI-generated)
├── Three wine options (buttons)
├── Feedback display area
└── JavaScript for scoring

Button Template:
├── Get scenario data
├── Update scoring variables
├── Display AI feedback
├── Track performance patterns
```

**Duplication Process:**
1. Copy slide template
2. Change character variable
3. Update API endpoint call
4. Test - done!

**JavaScript Template:**
```javascript
// Template for any character/room combination
const character = "brittany"; // CHANGE THIS
const room = "water";         // CHANGE THIS

// Everything else stays the same
fetch(`https://your-api.vercel.app/api/${character}_${room}`)
  .then(response => response.json())
  .then(data => {
    // Populate scenario variables
    // Handle scoring
    // Display feedback
  });
```

---

## The Big Picture: How It All Fits Together (10 minutes)

### The Core Architecture

**Your Authoring Tool (Captivate/Storyline)**
- Visual design and learner interface
- Buttons, images, navigation
- Variables for scoring and display
- JavaScript calls to external APIs

**JSON Files (Your Content Database)**
- Scenario templates and character data
- Easy to edit, update without republishing
- Structured data AI can understand
- Version control and collaboration friendly

**API Layer (Vercel Hosting)**
- Protects your OpenAI API keys
- Serves JSON content dynamically
- Handles AI processing requests
- Scales automatically with usage

**OpenAI Integration**
- Generates personalized feedback
- Powers character voices (text-to-speech)
- Evaluates student performance patterns
- Creates content variations

### How It Works in Practice

**Student Interaction Flow:**
```
Student enters slide → JavaScript calls API → AI selects scenario → 
Student makes choice → AI generates feedback → Performance tracked → 
AI evaluates session → Advancement decision
```

**Content Management Flow:**
```
Update JSON file → Push to GitHub → Vercel auto-deploys → 
Instant content updates (no republishing)
```

**Development Flow:**
```
Design learning framework → Ask Claude for code templates → 
Copy-paste into your tools → Test and iterate
```

### The Template Approach

**Slide Templates:**
- Character image (swappable)
- Scenario text (AI-populated)
- Choice buttons (dynamic options)
- Feedback display (AI-generated)
- Scoring JavaScript (reusable)

**Code Templates:**
- API call structure (copy-paste for new characters)
- Scoring logic (standard across all scenarios)
- Variable management (consistent naming)
- Error handling (same for all endpoints)

**Content Templates:**
- JSON structures for each character type
- Scenario frameworks by difficulty level
- Assessment rubrics for AI evaluation
- Character personality definitions

---

## Your Blueprint Checklist

### Design Phase ✓
- [ ] Define learning objectives and assessment criteria
- [ ] Choose character personalities and teaching styles  
- [ ] Design progression structure (rooms/levels)
- [ ] Set advancement thresholds

### Technical Setup ✓
- [ ] Set up Claude Pro account
- [ ] Install VS Code
- [ ] Create Vercel account and connect GitHub
- [ ] Get OpenAI API key

### Development Phase ✓
- [ ] Use Claude to generate JSON data structures
- [ ] Create slide templates in your authoring tool
- [ ] Set up API endpoints in Vercel
- [ ] Write JavaScript for dynamic content loading
- [ ] Add AI evaluation endpoints

### Testing & Launch ✓
- [ ] Test all character/scenario combinations
- [ ] Verify scoring and advancement logic
- [ ] Pilot with small group
- [ ] Iterate based on feedback

---

## Q&A + Resources (2 minutes)

**"Where do I start if I've never coded?"**
- Start with Claude - literally ask: "Help me build adaptive learning"
- Copy-paste approach - no need to understand every line
- Focus on the JSON structure first - that's your content

**"What if my authoring tool isn't Captivate?"**
- Same principles apply to Storyline, Rise, any tool with JavaScript support
- API calls work the same way
- Variables and buttons are universal concepts

**"How much will this really cost?"**
- Development: Free (your time + Claude Pro $20/month)
- Hosting: Free (Vercel free tier)
- AI Usage: $50-200/month (scales with users)
- Total: Under $300/month for most use cases

**Resources to Get Started:**
- **GitHub Repository**: Full code examples and templates
- **Claude Prompts**: Pre-written prompts for common scenarios
- **Video Tutorials**: Step-by-step implementation guides
- **Community**: Slack group for troubleshooting

**Remember**: You don't need to be a programmer. You need to be a good instructional designer who can copy, paste, and modify templates.

**The blueprint is simple: Design the learning, let AI fill in the details.**

---

## Key Takeaways

### What You Control
- Learning objectives and assessment rubric
- Character personalities and teaching approaches
- Progression structure and advancement rules
- Visual design and user experience

### What AI Handles  
- Scenario generation and content variations
- Personalized feedback based on performance
- Difficulty adaptation and remedial decisions
- Natural language evaluation and advancement

### Your Development Approach
1. **Design first** - learning objectives and structure
2. **Template everything** - slides, code, JSON structures
3. **Use AI tools** - Claude for code, OpenAI for content
4. **Start simple** - one character, one room, expand from there
5. **Test frequently** - pilot early and iterate

### Success Metrics
- **Student Engagement**: Higher completion rates
- **Learning Outcomes**: Better assessment scores  
- **Content Freshness**: Reduced repetition complaints
- **Development Efficiency**: Faster updates and scaling

**Bottom Line**: This isn't about becoming a programmer. It's about using AI tools to scale your instructional design expertise.

**Start tomorrow. Your students are waiting for adaptive learning experiences.**