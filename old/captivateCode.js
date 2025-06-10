// For Captivate's "Execute JavaScript" action on the button
(function() {
  // Get text from Captivate variable
  var textToSpeak = "";
  
  if (typeof window.cpAPIInterface !== 'undefined') {
    try {
      textToSpeak = window.cpAPIInterface.getVariableValue("v_question");
    } catch (e) {
      console.error("Error getting Captivate variable:", e);
      textToSpeak = "Default text for testing";
    }
  } else {
    textToSpeak = "Default text for testing";
  }
  
  // Your Vercel API endpoint
  const apiUrl = "https://captivate-audio.vercel.app/api/tts";
  
  // Create loading indicator (optional)
  console.log("Generating speech...");
  
  // Call your TTS API
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      text: textToSpeak
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error: ' + response.status);
    }
    return response.blob();
  })
  .then(audioBlob => {
    // Create a URL for the audio blob
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Create and play the audio
    const audio = new Audio(audioUrl);
    
    // Clean up URL when done
    audio.onended = function() {
      URL.revokeObjectURL(audioUrl);
    };
    
    audio.play();
  })
  .catch(error => {
    console.error('Error:', error);
  });
})();