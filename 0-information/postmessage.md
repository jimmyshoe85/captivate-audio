# PostMessage Communication: Technical Deep Dive
## Addendum to Wine Training Game Development Documentation

---

## 🎯 **Overview**

This addendum provides a comprehensive technical explanation of the **postMessage communication system** implemented to enable secure cross-origin data exchange between Captivate projects and external web objects. This solution was critical to the success of the Wine Training Game project and represents a reusable pattern for similar e-learning integrations.

---

## 🔐 **The Core Problem: Same-Origin Policy**

### **What is Same-Origin Policy?**
The Same-Origin Policy (SOP) is a fundamental web browser security mechanism that restricts how scripts from one origin can interact with resources from another origin.

**Two URLs have the same origin only if they have:**
- **Same protocol** (http vs https)
- **Same domain** (example.com vs different.com)  
- **Same port** (80 vs 8080)

### **Our Specific Challenge:**
```
Captivate Project Origin:     file:///C:/course/index.html
                         OR:  https://yourlms.com/course/
Web Object Origin:            https://captivate-audio.vercel.app/
API Endpoints:                https://captivate-audio.vercel.app/api/
```

**Result**: Browser blocks all direct communication between origins.

### **Attempted Direct Access (Blocked by Browser):**
```javascript
// This FAILS due to Same-Origin Policy
try {
  window.parent.cpAPIInterface.setVariableValue('score', 100);
} catch (error) {
  // SecurityError: Blocked a frame with origin "https://captivate-audio.vercel.app" 
  // from accessing a cross-origin frame.
}
```

---

## 📡 **PostMessage: The Solution**

### **What is postMessage?**
`window.postMessage()` is a **W3C standard API** that enables secure cross-origin communication between windows, iframes, and web workers. It's specifically designed to bypass Same-Origin Policy restrictions in a controlled, secure manner.

### **How postMessage Works:**
```javascript
// Sender (Web Object)
targetWindow.postMessage(data, targetOrigin);

// Receiver (Captivate Project)  
window.addEventListener('message', function(event) {
  // Receive and process the data
}, false);
```

### **Security Features:**
- **Origin verification** - receiver can validate sender's origin
- **Structured data** - supports complex JavaScript objects
- **Asynchronous** - doesn't block UI execution
- **Browser-native** - no external dependencies required

---

## 🏗️ **Implementation Architecture**

### **Communication Flow Diagram:**
```
Web Object (Child iframe)                 Captivate Project (Parent)
https://captivate-audio.vercel.app        file:// or https://lms.com
┌─────────────────────────────┐          ┌──────────────────────────┐
│                             │          │                          │
│ User selects wine           │          │ Captivate variables      │
│ ↓                           │          │ waiting for data         │
│ setCaptivateVariable()      │──────────▶│                          │
│ ↓                           │ message  │ addEventListener()        │
│ window.parent.postMessage() │          │ ↓                        │
│                             │          │ cpAPIInterface.set()     │
│                             │          │ ↓                        │
│                             │◀─────────│ Variables updated        │
└─────────────────────────────┘          └──────────────────────────┘
```

---

## 💻 **Code Implementation**

### **Web Object Side (Sender)**

#### **Function: setCaptivateVariable()**
```javascript
function setCaptivateVariable(variableName, value) {
  if (window.parent) {
    // Send structured message to parent frame
    window.parent.postMessage({
      type: 'setCaptivateVariable',        // Message identifier
      variable: variableName,              // Variable name
      value: value,                        // Variable value
      timestamp: new Date().toISOString(), // Optional: for debugging
      source: 'wine-training-webobject'    // Optional: source identifier
    }, '*'); // targetOrigin: '*' allows any origin (less secure but compatible)
    
    console.log('Sent to Captivate: ' + variableName + ' = ' + value);
  } else {
    console.log('No parent window available for postMessage');
  }
}
```

#### **Usage Examples:**
```javascript
// Send individual variables
setCaptivateVariable('feedbackText', 'Perfect choice! Sauvignon Blanc...');
setCaptivateVariable('userScore', 5);
setCaptivateVariable('wineSelected', 'Sauvignon Blanc');

// Send complex data  
setCaptivateVariable('currentScenarioData', JSON.stringify(scenarioObject));

// Send completion status
setCaptivateVariable('selectionComplete', 'true');
```

### **Captivate Side (Receiver)**

#### **Event Listener Setup**
**Location**: Project → Project Properties → Action → On Project Start → Execute JavaScript

```javascript
window.addEventListener('message', function(event) {
  // Optional: Verify sender origin for security
  // if (event.origin !== 'https://captivate-audio.vercel.app') {
  //   console.log('Rejected message from unauthorized origin:', event.origin);
  //   return;
  // }
  
  // Log received message for debugging
  console.log('Captivate received message:', event.data, 'from origin:', event.origin);
  
  // Process setCaptivateVariable messages
  if (event.data && event.data.type === 'setCaptivateVariable') {
    var variableName = event.data.variable;
    var variableValue = event.data.value;
    
    // Validate cpAPIInterface availability
    if (window.cpAPIInterface && window.cpAPIInterface.setVariableValue) {
      // Set the Captivate variable
      window.cpAPIInterface.setVariableValue(variableName, variableValue);
      console.log("Captivate: Successfully set variable '" + variableName + "' to '" + variableValue + "'");
    } else {
      console.error("Captivate: cpAPIInterface not available to set variable " + variableName);
    }
  }
  
  // Handle other message types (extensible pattern)
  else if (event.data && event.data.type === 'requestEvaluation') {
    // Trigger Miss Clara evaluation
    handleMissEvaluationRequest(event.data);
  }
  else if (event.data && event.data.type === 'navigationRequest') {
    // Handle slide navigation requests
    handleNavigationRequest(event.data);
  }
  
}, false); // useCapture = false (standard event bubbling)
```

---

## 🔧 **Advanced Implementation Features**

### **Message Type Routing**
```javascript
// Extensible message handling system
var messageHandlers = {
  'setCaptivateVariable': function(data) {
    window.cpAPIInterface.setVariableValue(data.variable, data.value);
  },
  
  'requestEvaluation': function(data) {
    triggerMissEvaluation(data.sessionData);
  },
  
  'playAudio': function(data) {
    playCharacterVoice(data.audioText, data.character);
  },
  
  'navigateToSlide': function(data) {
    window.cpAPIInterface.jumpToSlide(data.slideLabel);
  }
};

// Main message handler
window.addEventListener('message', function(event) {
  if (event.data && event.data.type && messageHandlers[event.data.type]) {
    messageHandlers[event.data.type](event.data);
  }
}, false);
```

### **Bidirectional Communication**
```javascript
// Captivate can send data back to web object
function sendToWebObject(messageType, data) {
  var webObjectFrame = document.querySelector('iframe'); // Adjust selector as needed
  if (webObjectFrame && webObjectFrame.contentWindow) {
    webObjectFrame.contentWindow.postMessage({
      type: messageType,
      data: data,
      timestamp: new Date().toISOString()
    }, 'https://captivate-audio.vercel.app');
  }
}

// Example: Send initial configuration to web object
sendToWebObject('initialize', {
  currentCharacter: window.cpAPIInterface.getVariableValue('selectedCharacter'),
  currentRoom: window.cpAPIInterface.getVariableValue('currentRoom'),
  userProgress: window.cpAPIInterface.getVariableValue('overallProgress')
});
```

### **Error Handling and Fallbacks**
```javascript
function setCaptivateVariable(variableName, value) {
  try {
    // Attempt direct access first (same-origin)
    if (window.parent && window.parent.cpAPIInterface) {
      window.parent.cpAPIInterface.setVariableValue(variableName, value);
      console.log('Direct access successful: ' + variableName);
      return;
    }
  } catch (error) {
    console.log('Direct access blocked, using postMessage: ' + error.message);
  }
  
  // Fallback to postMessage (cross-origin)
  if (window.parent) {
    window.parent.postMessage({
      type: 'setCaptivateVariable',
      variable: variableName,
      value: value
    }, '*');
    console.log('PostMessage sent: ' + variableName);
  } else {
    // Final fallback - local storage or console logging
    console.log('No communication method available: ' + variableName + ' = ' + value);
    localStorage.setItem('captivate_' + variableName, value);
  }
}
```

---

## 🛡️ **Security Considerations**

### **Origin Validation**
```javascript
// DEVELOPMENT (permissive)
if (event.origin !== '*') return; // Allow all origins

// PRODUCTION (secure)
var allowedOrigins = [
  'https://captivate-audio.vercel.app',
  'https://yourlms.com',
  'file://' // For local testing
];
if (allowedOrigins.indexOf(event.origin) === -1) {
  console.warn('Rejected message from unauthorized origin:', event.origin);
  return;
}
```

### **Data Validation**
```javascript
// Validate message structure
if (!event.data || typeof event.data !== 'object') {
  console.warn('Invalid message format received');
  return;
}

// Validate required fields
if (!event.data.type || !event.data.variable || event.data.value === undefined) {
  console.warn('Missing required fields in message');
  return;
}

// Sanitize variable names (prevent injection)
var safeName = event.data.variable.replace(/[^a-zA-Z0-9_]/g, '');
if (safeName !== event.data.variable) {
  console.warn('Invalid variable name format:', event.data.variable);
  return;
}
```

### **Rate Limiting**
```javascript
// Prevent message flooding
var messageCount = 0;
var lastReset = Date.now();

window.addEventListener('message', function(event) {
  var now = Date.now();
  
  // Reset counter every second
  if (now - lastReset > 1000) {
    messageCount = 0;
    lastReset = now;
  }
  
  // Limit to 10 messages per second
  if (messageCount > 10) {
    console.warn('Message rate limit exceeded');
    return;
  }
  
  messageCount++;
  // Process message...
}, false);
```

---

## 🐛 **Debugging and Troubleshooting**

### **Common Issues and Solutions**

#### **Issue 1: Messages Not Received**
**Symptoms:**
- Web object logs "Sent to Captivate: ..." but Captivate shows no received messages
- Variables not updating in Captivate

**Debugging Steps:**
```javascript
// Add comprehensive logging
window.addEventListener('message', function(event) {
  console.log('=== MESSAGE RECEIVED ===');
  console.log('Origin:', event.origin);
  console.log('Data:', event.data);
  console.log('Type:', typeof event.data);
  console.log('cpAPIInterface available:', !!window.cpAPIInterface);
  console.log('========================');
  
  // Rest of handler...
}, false);
```

**Common Causes:**
- Event listener not added to "On Project Start"
- cpAPIInterface not available when message received
- Message sent before listener is active

#### **Issue 2: Cross-Origin Errors**
**Symptoms:**
- Console errors about blocked frame access
- SecurityError exceptions

**Solutions:**
```javascript
// Ensure postMessage only, no direct access attempts
function setCaptivateVariable(variableName, value) {
  // DON'T attempt direct access first - just use postMessage
  if (window.parent) {
    window.parent.postMessage({
      type: 'setCaptivateVariable',
      variable: variableName,
      value: value
    }, '*');
  }
}
```

#### **Issue 3: Timing Issues**
**Symptoms:**
- Sometimes works, sometimes doesn't
- Variables set before Captivate is ready

**Solutions:**
```javascript
// Queue messages until Captivate is ready
var messageQueue = [];
var captivateReady = false;

function setCaptivateVariable(variableName, value) {
  var message = { type: 'setCaptivateVariable', variable: variableName, value: value };
  
  if (captivateReady) {
    window.parent.postMessage(message, '*');
  } else {
    messageQueue.push(message);
  }
}

// In Captivate, signal when ready
window.addEventListener('message', function(event) {
  if (event.data.type === 'webObjectReady') {
    captivateReady = true;
    // Process queued messages
    messageQueue.forEach(function(msg) {
      window.parent.postMessage(msg, '*');
    });
    messageQueue = [];
  }
}, false);
```

### **Debugging Tools**

#### **Message Monitor (Add to Captivate)**
```javascript
// Advanced debugging - logs all messages
var messageLog = [];
window.addEventListener('message', function(event) {
  var logEntry = {
    timestamp: new Date().toISOString(),
    origin: event.origin,
    type: event.data ? event.data.type : 'unknown',
    data: event.data
  };
  messageLog.push(logEntry);
  
  // Keep only last 50 messages
  if (messageLog.length > 50) {
    messageLog.shift();
  }
  
  // Make log accessible for debugging
  window.captivateMessageLog = messageLog;
}, false);

// View log in console: console.log(window.captivateMessageLog);
```

#### **Network Monitor**
```javascript
// Monitor web object loading
function checkWebObjectHealth() {
  var iframe = document.querySelector('iframe');
  if (iframe) {
    console.log('Web object URL:', iframe.src);
    console.log('Web object loaded:', iframe.contentDocument !== null);
  }
}
```

---

## 📈 **Performance Considerations**

### **Message Batching**
```javascript
// Batch multiple variable updates into single message
var pendingUpdates = {};
var batchTimeout = null;

function setCaptivateVariable(variableName, value) {
  pendingUpdates[variableName] = value;
  
  if (batchTimeout) {
    clearTimeout(batchTimeout);
  }
  
  batchTimeout = setTimeout(function() {
    window.parent.postMessage({
      type: 'batchVariableUpdate',
      updates: pendingUpdates
    }, '*');
    pendingUpdates = {};
    batchTimeout = null;
  }, 100); // Batch updates over 100ms
}
```

### **Message Size Optimization**
```javascript
// Minimize message payload
function setCaptivateVariable(variableName, value) {
  window.parent.postMessage({
    t: 'sCV', // Shortened type
    v: variableName, // Shortened field names
    d: value
  }, '*');
}
```

---

## 🔄 **Alternative Communication Methods (Not Used)**

### **Why Not These Approaches?**

#### **1. Local Storage Communication**
```javascript
// Doesn't work across origins
localStorage.setItem('captivateVar', value); // Only visible to same origin
```

#### **2. URL Hash Communication**
```javascript
// Limited data size, messy implementation
window.parent.location.hash = 'score=5&wine=sauvignon';
```

#### **3. Server-Side Polling**
```javascript
// Requires additional infrastructure, latency issues
fetch('/api/shared-state', { method: 'POST', body: data });
```

#### **4. WebSocket Communication**
```javascript
// Overkill for simple variable passing, complexity overhead
var ws = new WebSocket('wss://your-server.com/captivate-bridge');
```

**PostMessage was chosen because it's:**
- ✅ **Browser-native** (no dependencies)
- ✅ **Secure** (built-in origin validation)
- ✅ **Reliable** (standardized across browsers)
- ✅ **Simple** (minimal code required)
- ✅ **Performant** (no network overhead)

---

## 🎯 **Implementation Checklist**

### **Web Object Side:**
- [ ] Replace direct cpAPIInterface calls with setCaptivateVariable()
- [ ] Use postMessage instead of direct window.parent access
- [ ] Add error handling for failed message sending
- [ ] Include message type and structured data format
- [ ] Test with different browsers and scenarios

### **Captivate Side:**
- [ ] Add event listener to "On Project Start" action
- [ ] Validate cpAPIInterface availability before using
- [ ] Include origin verification for production
- [ ] Add comprehensive error handling and logging
- [ ] Test message reception with browser console

### **Testing Checklist:**
- [ ] Same-origin scenario (both on same domain)
- [ ] Cross-origin scenario (different domains)
- [ ] Local file testing (file:// protocol)
- [ ] LMS integration testing
- [ ] Browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing
- [ ] Network failure scenarios

---

## 🚀 **Reusable Pattern for Future Projects**

This postMessage implementation creates a **reusable template** for any Captivate + external web content integration:

```javascript
// Generic postMessage bridge
var CaptivaBridge = {
  send: function(type, data) {
    if (window.parent) {
      window.parent.postMessage({
        type: type,
        data: data,
        timestamp: new Date().toISOString(),
        source: 'external-content'
      }, '*');
    }
  },
  
  setVariable: function(name, value) {
    this.send('setCaptivateVariable', { variable: name, value: value });
  },
  
  navigate: function(slideLabel) {
    this.send('navigate', { slideLabel: slideLabel });
  },
  
  triggerAction: function(actionName, parameters) {
    this.send('triggerAction', { action: actionName, params: parameters });
  }
};

// Usage in any web object
CaptivaBridge.setVariable('score', 100);
CaptivaBridge.navigate('slide_results');
CaptiveBridge.triggerAction('playAudio', { text: 'Hello World' });
```

---

## 📚 **References and Further Reading**

### **W3C Specifications:**
- [Window.postMessage() - MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [Same-Origin Policy - MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
- [HTML5 Cross-Document Messaging](https://www.w3.org/TR/webmessaging/)

### **Browser Support:**
- **Chrome**: Full support (all versions)
- **Firefox**: Full support (all versions)
- **Safari**: Full support (all versions)  
- **Edge**: Full support (all versions)
- **Internet Explorer**: Support from IE8+

### **Security Best Practices:**
- Always validate message origin in production
- Sanitize all incoming data
- Use structured message formats with type identification
- Implement rate limiting for high-frequency messaging
- Log security violations for monitoring

---

## 🎉 **Conclusion**

The postMessage communication bridge solved the fundamental cross-origin security restrictions that prevented direct communication between Captivate projects and external web objects. This implementation provides:

- **Secure**, standards-compliant cross-origin communication
- **Reliable** data transfer without network dependencies  
- **Scalable** architecture supporting complex integrations
- **Maintainable** code patterns for future development
- **Reusable** components for similar e-learning projects

The pattern established here can be applied to any scenario where Captivate needs to integrate with external web content, making it a valuable foundation for modern e-learning development workflows.

---

**Next Steps**: This postMessage bridge can be extended to support bidirectional communication, real-time collaboration features, and integration with other learning technologies while maintaining the security and reliability established in this implementation.