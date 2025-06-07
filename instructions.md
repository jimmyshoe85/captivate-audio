First, check what remotes you have:

bashCopygit remote -v

If you need to, remove the existing origin:

bashCopygit remote remove origin

Add your new GitHub repository as origin:

bashCopygit remote add origin https://github.com/jimmyshoe85/captivate-audio.git

Check what branch you're on:

bashCopygit branch

If no branch is shown, create and switch to main:

bashCopygit checkout -b main

Make sure all your files are added:

bashCopygit add .

Commit your changes:

bashCopygit commit -m "Initial commit with TTS API"

Push to GitHub:

bashCopygit push -u origin main
The error "src refspec main does not match any" typically means you don't have a main branch or you haven't committed any changes yet. Following these steps should resolve the issue.RetryClaude can make mistakes. Please double-check responses.


angela:   { voice: "sage",  instructions: "Neutral American, warm mentor." },
  brittany: { voice: "alloy", instructions: "Upbeat Gen-Z, energetic tone." },
  jose:     { voice: "verse", instructions: "Light Spanish accent, warm." },
  kevin:    { voice: "echo",  instructions: "Mid-western trainer, steady." },
  miles:    { voice: "ash",   instructions: "Queens NY, relaxed confidence." }

# JSON STRUCTURE
  json structure
  brittany_juice.json
jose_juice.json
angela_juice.json
kevin_juice.json
miles_juice.json