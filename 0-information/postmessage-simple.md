## **How It Works: “Passing Notes” Between Captivate and Your Web Object**

**Imagine your Captivate project and your web object are like two people sitting in different rooms.**
Normally, they can't just yell across the hall—they need a safe, reliable way to send each other information, like “feedbackText = Great job!” or “score = 5”.

### **The Problem**

When you use a web object (like a mini website or interactive tool) inside Captivate, **the two parts can’t easily “talk” to each other** because modern browsers have strict privacy and security rules.
This is a good thing: it keeps websites from spying on each other.
But it also means your web object can’t simply set or read Captivate’s variables the way older content used to.

---

### **The Solution: The “Messenger”**

So, we use a system called **“postMessage”**—think of it as sending a note by sliding it under the door.

* The web object writes a note (“Set the variable ‘score’ to 5”) and slides it under the door to Captivate.
* Captivate, if it’s paying attention, picks up the note, reads it, and updates the variable.

#### **How We Set It Up:**

1. **The Web Object Sends Messages**
   Whenever your interactive content needs to tell Captivate something, it sends a message, kind of like:

   * “Hey, set this variable to this value!”

2. **Captivate Listens for Messages**
   On the slide (using “On Slide Enter: Execute JavaScript”), Captivate starts listening at the door.
   When a message/note comes in, it reads it and updates the variable.

3. **Communication Achieved!**
   Now, your web object can send scores, feedback, or anything else to Captivate—and Captivate will listen and update its variables.

---

### **Why This Matters**

* **You don’t need to be a programmer** to use this once it’s set up—you just drop the web object in, and Captivate can receive information from it.
* **It’s safe:** The browser keeps everything secure, and only the intended messages are processed.
* **You get the best of both worlds:** Captivate’s tracking, plus the flexibility of your own custom interactive content.

---

### **In a Nutshell**

**Think of it like passing sticky notes between two rooms.**
If you set up a “mail slot” on both sides (the web object sends, Captivate listens),
**they can share information**—even though they’re technically separate.


