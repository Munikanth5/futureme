const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Clean up markdown markers if Gemini wraps the JSON response
function cleanJSONString(rawText) {
  let cleaned = rawText.trim();
  
  // Remove markdown block backticks if present
  const markdownMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (markdownMatch) {
    cleaned = markdownMatch[1].trim();
  }
  
  // Remove any trailing or leading stray characters
  return cleaned;
}

// Generate future self details based on the reflection form
app.post('/api/generate-futureme', async (req, res) => {
  try {
    const { name, age, goal, struggle, oneYearVision, tone } = req.body;

    // Validate fields
    if (!name || !age || !goal || !struggle || !oneYearVision || !tone) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required. Please fill in your profile completely.'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Elegant fallback simulation in case the API key is not configured or placeholder
    if (!apiKey || apiKey.includes('your_api_key') || apiKey === '') {
      console.warn('⚠️ Gemini API key is missing or not configured. Using high-fidelity demo fallback generation.');
      
      // We return a stunning mock response so the UI is fully testable and reviewable instantly
      const mockDelays = new Promise(resolve => setTimeout(resolve, 3000));
      await mockDelays;
      
      const mockResult = generateMockFutureMe(name, age, goal, struggle, oneYearVision, tone);
      return res.json({
        success: true,
        data: mockResult
      });
    }

    // Initialize Gemini SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    const systemPrompt = `You are FutureMe, the future successful version of the user. You are not a generic motivational coach. You speak with emotional intelligence, clarity, and deep personal understanding. Your job is to help the user see who they are becoming, what they must change, and what they should do next.

Write as if you are the user’s future self speaking directly to their current self.

Tone selected by user: ${tone} (Make sure your tone strictly matches this. If 'Brutally Honest', be direct and sharp with no excuses. If 'Motivational', be incredibly inspiring and warm. If 'Calm Mentor', be peaceful, wise, and grounded. If 'CEO Mode', be strategic, focused, and execution-heavy.)

User details:
Name: ${name}
Age: ${age}
Goal: ${goal}
Current struggle: ${struggle}
One-year vision: ${oneYearVision}

Return only valid JSON in this exact format:
{
  "message": "A powerful 120-180 word message from the future self.",
  "futureIdentity": "A concise description of who the user is becoming.",
  "nextMoves": ["Action 1", "Action 2", "Action 3"],
  "habit": "One small daily habit they should start today.",
  "warning": "One mistake their future self warns them about.",
  "mantra": "A short memorable line they can repeat daily."
}

Make it specific, emotional, practical, and highly realistic based on the user's struggle and goal. Avoid generic clichés.`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    
    const cleanedText = cleanJSONString(responseText);
    const parsedData = JSON.parse(cleanedText);

    res.json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error('Error generating FutureMe:', error);
    
    // Emergency Protocol: If API fails (e.g. 403 Forbidden or 500), use fallback
    console.warn('⚠️ Gemini API request failed. Engaging Emergency Protocol fallback.');
    const mockResult = generateMockFutureMe(req.body.name, req.body.age, req.body.goal, req.body.struggle, req.body.oneYearVision, req.body.tone);
    
    res.json({
      success: true,
      data: mockResult,
      isEmergencyFallback: true
    });
  }
});

// Chat with the generated future self
app.post('/api/chat-futureme', async (req, res) => {
  try {
    const { userProfile, chatHistory, question } = req.body;

    if (!userProfile || !question) {
      return res.status(400).json({
        success: false,
        error: 'Missing required profile details or current question.'
      });
    }

    const { name, age, goal, struggle, oneYearVision, tone } = userProfile;
    const apiKey = process.env.GEMINI_API_KEY;

    // Elegant fallback simulation in case the API key is not configured or placeholder
    if (!apiKey || apiKey.includes('your_api_key') || apiKey === '') {
      console.warn('⚠️ Gemini API key is missing or not configured. Using high-fidelity demo chat fallback.');
      
      const mockDelays = new Promise(resolve => setTimeout(resolve, 1500));
      await mockDelays;
      
      const mockReply = generateMockChatReply(userProfile, chatHistory, question);
      return res.json({
        success: true,
        reply: mockReply
      });
    }

    // Initialize Gemini SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Format chat history
    let formattedHistory = '';
    if (chatHistory && chatHistory.length > 0) {
      formattedHistory = chatHistory.map(c => {
        const roleName = c.role === 'user' ? 'Current Self' : 'Future Self';
        return `${roleName}: ${c.message}`;
      }).join('\n');
    } else {
      formattedHistory = 'No previous messages. This is the beginning of your conversation.';
    }

    const chatPrompt = `You are FutureMe, the future version of the user who already achieved their one-year vision. Reply directly to the user’s question. Be personal, sharp, honest, and useful. Do not sound like a normal AI assistant. Do not mention that you are Gemini or an AI model. Speak like the future self.
    
    IMPORTANT FORMATTING INSTRUCTIONS:
    - If the user asks for a plan, strategy, or timeline, articulate it properly as an expert using structured Markdown.
    - Heavily utilize bullet points, bold text, and Markdown tables when organizing information or action items.
    - Keep paragraphs concise.

User profile:
Name: ${name}
Age: ${age}
Goal: ${goal}
Struggle: ${struggle}
One-year vision: ${oneYearVision}
Tone: ${tone} (Speak in this specific tone: If 'Brutally Honest', be highly direct and raw. If 'Motivational', be super inspiring. If 'Calm Mentor', be grounded and understanding. If 'CEO Mode', be strategic and focused on tactical metrics.)

Recent chat history:
${formattedHistory}

Current question:
${question}

Reply in 2-5 short paragraphs. Give at least one clear action. Speak directly, and treat the user with empathy but firm accountability.`;

    const result = await model.generateContent(chatPrompt);
    const replyText = result.response.text().trim();

    res.json({
      success: true,
      reply: replyText
    });

  } catch (error) {
    console.error('Error in chat-futureme:', error);
    
    // Emergency Protocol
    console.warn('⚠️ Gemini API chat request failed. Engaging Emergency Protocol fallback.');
    const mockReply = generateMockChatReply(req.body.userProfile, req.body.chatHistory, req.body.question);
    
    res.json({
      success: true,
      reply: mockReply,
      isEmergencyFallback: true
    });
  }
});

// Debug endpoint to list available models
app.get('/api/models', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(400).json({ error: 'No API key' });
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Serve frontend application index.html at root
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Helper for offline high-fidelity demo (generates a customized response based on inputs)
function generateMockFutureMe(name, age, goal, struggle, oneYearVision, tone) {
  let message = '';
  let futureIdentity = '';
  let nextMoves = [];
  let habit = '';
  let warning = '';
  let mantra = '';

  if (tone === 'Brutally Honest') {
    futureIdentity = `Unstoppable Builder & Action-First Operator`;
    message = `Hey ${name}, I am writing to you from one year in the future. We made it—we successfully achieved the dream of "${oneYearVision}". But let's be real for a second: you are still struggling with "${struggle}" right now, and it's killing your momentum. Stop looking for hacks or trying to feel 'motivated' before you start. The version of me writing this to you didn't become consistent by accident. I became consistent because I stopped negotiating with my feelings. The days you don't feel like working are the exact days that define your future. Stop checking your phone, stop planning, and start building. I am waiting for you here, but you have to earn it.`;
    nextMoves = [
      "Block out your calendar: Dedicate 3 deep work hours every single morning before checking any notifications.",
      "Establish a weekly review: Measure output, not hours spent, and ruthlessly cut out low-value activities.",
      "Ship your version 1 within 14 days. Feedback from reality is the only cure for procrastination."
    ];
    habit = "Do the hardest task of the day for 45 minutes straight at 7:00 AM, no excuses.";
    warning = "Thinking that tomorrow is a better day to start. It isn't. The delay loop is your greatest enemy.";
    mantra = "Actions over emotions. Execution over excuses.";
  } else if (tone === 'CEO Mode') {
    futureIdentity = `Strategic Architect & Scaled Founder`;
    message = `Hello ${name}. Looking back from the perspective of our achieved target of "${oneYearVision}", I wanted to share the strategic adjustments that got us here. Your core issue right now is "${struggle}". This is not a personality defect; it is a system breakdown. You need operational rigor. The transition from your current ${age}-year-old state to leading a successful startup requires you to view your habits as systems. If your input is inconsistent, your revenue and growth metrics will be inconsistent. Implement strict boundaries, automate secondary choices, and focus 100% on leverage. You have the vision—now execute it like a professional CEO. Let's make this year count.`;
    nextMoves = [
      "Define your North Star Metric and track it on a physical dashboard in your room.",
      "Conduct a 'time-audit' this week. Outsource or eliminate 80% of tasks that do not drive growth.",
      "Run weekly feedback sprints. Review what you accomplished vs what you committed to."
    ];
    habit = "Track your time in 30-minute intervals daily to see where leakage is happening.";
    warning = "Chasing shiny new ideas instead of doubling down on the one thing that actually works.";
    mantra = "Double down on systems, not motivation. High leverage only.";
  } else if (tone === 'Calm Mentor') {
    futureIdentity = `Grounded, Purpose-Driven Leader`;
    message = `Dear ${name}, take a deep breath. I see you struggling with "${struggle}" as you strive towards "${goal}". Please be gentle with yourself. Growth is not a straight upward line; it is a spiral of learning, forgetting, and remembering. I want you to know that the peace and success you enjoy in "${oneYearVision}" was not built on a foundation of self-punishment or frantic stress. It was built by showing up, day after day, with a quiet and sincere heart. Let go of the pressure to be perfect. The consistency you seek will flow naturally when you align your actions with your love for the craft rather than your fear of failure. I believe in you. You are already on your path.`;
    nextMoves = [
      "Begin each day with 5 minutes of quiet reflection to connect with your 'why'.",
      "Break your big goals into tiny, enjoyable milestones to reduce anxiety.",
      "Build a supportive workspace where you feel safe and unhurried."
    ];
    habit = "Spend 10 minutes journaling every evening about what went well and why.";
    warning = "Mistaking busywork for meaningful progress. True creation requires stillness.";
    mantra = "Patience is my power. One quiet step at a time.";
  } else { // Motivational
    futureIdentity = `Vibrant, Limitless Trailblazer`;
    message = `Hey ${name}! Oh my goodness, I wish you could see us now! We did it! "${oneYearVision}" is our daily reality, and it is more beautiful than we ever imagined! I know "${struggle}" feels so heavy right now at ${age}, but I promise you, it is the exact fire that is tempering your spirit. Every struggle you face is a stepping stone preparing you for this breakthrough. You are so much stronger, smarter, and more resilient than you give yourself credit for. Do not let doubt steal your spark! Keep your eyes on the dream, hold your head high, and run towards your goals with everything you've got. I am waiting here to celebrate with you!`;
    nextMoves = [
      "Create a visual vision board of your future self and look at it every single morning.",
      "Surround yourself with builders who inspire you to raise your standards.",
      "Write down 3 wins every single night to celebrate how far you have come."
    ];
    habit = "Drink water, stretch, and say your daily mantra aloud every morning at sunrise.";
    warning = "Letting a single bad day trick you into believing your progress has reset.";
    mantra = "I am the creator of my future. Nothing can stop my momentum!";
  }

  return { message, futureIdentity, nextMoves, habit, warning, mantra };
}

function generateMockChatReply(userProfile, chatHistory, question) {
  const { name, goal, struggle, tone } = userProfile;
  
  const q = question.toLowerCase();
  
  if (tone === 'Brutally Honest') {
    if (q.includes('fail') || q.includes('what if')) {
      return `If you fail, it will be because you allowed your daily actions to negotiate with your dreams. You are terrified of failing, yet your current daily schedule reflects absolute comfort. 

Failure is not some magical lightning bolt that strikes from the sky; it is the predictable sum of 365 small, lazy decisions. 

Get up. Decide right now that your struggle with "${struggle}" ends today. What is the one thing you are avoiding doing right now? Go do that. That's your only priority.`;
    }
    return `Let's cut through the noise, ${name}. You asked "${question}". You already know the answer, but you are looking for validation or a softer way out. 

The successful version of us didn't achieve "${goal}" by waiting for answers to appear. We got here by picking a direction and moving aggressively. 

Stop thinking and start building. My action item for you this week: spend 2 hours working on your core dream before you do anything else. No phone. No distractions. Let's go.`;
  } else if (tone === 'CEO Mode') {
    return `Analyzing your question: "${question}". Let's break this down from a systems perspective.

First, your core vulnerability is "${struggle}". Any new initiative or answer we discuss must account for this constraint. If we don't fix the lack of systematic execution, nothing else matters.

Second, your tactical milestone this week is to identify your high-leverage constraint. 

Action plan: Create a tracking spreadsheet today. Log every hour you spend. Ruthlessly audit and eliminate any activity that doesn't advance your goal of "${goal}". Let's stay metric-driven.`;
  } else if (tone === 'Calm Mentor') {
    return `It is completely natural to ask "${question}" when you are in the thick of "${struggle}". The uncertainty can feel overwhelming.

Remember that you do not need to figure out the next ten steps. You only need to see the next single step. The mist clears as you walk, not while you stand still waiting for it to disperse.

Be patient with your progress. Take one small action today that brings you joy, and let that momentum carry you forward. You are doing much better than you realize, ${name}.`;
  } else { // Motivational
    return `Oh, ${name}! I love this question so much! It shows you are actively thinking about how to bridge the gap between where you are and where we are!

Let me tell you: you have everything inside you to solve this. That struggle of "${struggle}"? It's just a temporary challenge designed to build your character muscles! 

Your action item for this week: share your dream of "${goal}" with one person who inspires you, and commit to one tiny action every single day. You can absolutely do this! I am cheering for you!`;
  }
}

// Start the server locally or export for Vercel
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 FutureMe server running on port ${PORT}`);
    console.log(`🌐 Open http://localhost:${PORT} in your browser to experience FutureMe!`);
  });
}
module.exports = app;
