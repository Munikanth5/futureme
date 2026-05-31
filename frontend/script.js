// FutureMe Frontend Controller - Munikanth's Founder Labs

// State Management
let userProfile = null;
let chatHistory = [];
let latestResult = null;
let loadingInterval = null;

// DOM Elements Selection
const formSection = document.getElementById('form-section');
const loadingSection = document.getElementById('loading-section');
const resultSection = document.getElementById('result-section');
const chatSection = document.getElementById('chat-section');

const reflectionForm = document.getElementById('reflection-form');
const chatForm = document.getElementById('chat-form');

const submitBtn = document.getElementById('submit-btn');
const copyBtn = document.getElementById('copy-btn');
const chatToggleBtn = document.getElementById('chat-toggle-btn');
const resetBtn = document.getElementById('reset-btn');

// Target Result Elements
const resBadge = document.getElementById('res-badge');
const resMessage = document.getElementById('res-message');
const resMantra = document.getElementById('res-mantra');
const resWarning = document.getElementById('res-warning');
const resHabit = document.getElementById('res-habit');
const resActionsList = document.getElementById('res-actions');

// Chat UI Elements
const chatMessagesContainer = document.getElementById('chat-messages-container');
const chatInput = document.getElementById('chat-input');
const chatTyping = document.getElementById('chat-typing');
const chatHeaderTitle = document.getElementById('chat-header-title');

// Loading Messages
const LOADING_PHRASES = [
  { title: "Aligning Timelines...", subtitle: "Calibrating the future frequency..." },
  { title: "Tuning Future Frequency...", subtitle: "Retrieving records from 1 year ahead..." },
  { title: "Analyzing Obstacles...", subtitle: "Drafting solutions for your current struggles..." },
  { title: "Drafting the Letter...", subtitle: "Your future self is putting thoughts into words..." },
  { title: "Materializing Identity...", subtitle: "Constructing your new successful self..." }
];

// Helper: Show specific main view sections
function showSection(section) {
  formSection.classList.add('hidden');
  loadingSection.classList.add('hidden');
  resultSection.classList.add('hidden');
  
  if (section === 'form') {
    formSection.classList.remove('hidden');
  } else if (section === 'loading') {
    loadingSection.classList.remove('hidden');
  } else if (section === 'result') {
    resultSection.classList.remove('hidden');
  }
}

// Helper: Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Slide out and remove toast
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

// Loading Phrase Rotator
function startLoadingRotation() {
  let index = 0;
  const titleEl = document.getElementById('loading-title');
  const subtitleEl = document.getElementById('loading-subtitle');
  
  titleEl.textContent = LOADING_PHRASES[0].title;
  subtitleEl.textContent = LOADING_PHRASES[0].subtitle;
  
  loadingInterval = setInterval(() => {
    index = (index + 1) % LOADING_PHRASES.length;
    titleEl.textContent = LOADING_PHRASES[index].title;
    subtitleEl.textContent = LOADING_PHRASES[index].subtitle;
  }, 2500);
}

function stopLoadingRotation() {
  if (loadingInterval) {
    clearInterval(loadingInterval);
    loadingInterval = null;
  }
}

// Form Submission & FutureMe Generation
reflectionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Disable submit button during processing
  submitBtn.disabled = true;
  
  // Read Form values
  const name = document.getElementById('input-name').value.trim();
  const age = document.getElementById('input-age').value.trim();
  const goal = document.getElementById('input-goal').value.trim();
  const struggle = document.getElementById('input-struggle').value.trim();
  const oneYearVision = document.getElementById('input-vision').value.trim();
  
  // Get selected tone value
  const toneRadio = document.querySelector('input[name="tone"]:checked');
  const tone = toneRadio ? toneRadio.value : 'Motivational';

  // Basic Validation
  if (!name || !age || !goal || !struggle || !oneYearVision) {
    showToast('Please fill out all fields before aligning the timeline.', 'error');
    submitBtn.disabled = false;
    return;
  }

  // Set Profile State
  userProfile = { name, age, goal, struggle, oneYearVision, tone };
  
  // Reset chat state
  chatHistory = [];
  chatMessagesContainer.innerHTML = '';
  chatSection.classList.add('hidden-chat');

  // Trigger loading state and rotation
  showSection('loading');
  startLoadingRotation();

  try {
    const response = await fetch('/api/generate-futureme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userProfile)
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Connection failure');
    }

    latestResult = result.data;
    
    // Render Results
    renderResultData(latestResult);
    
    // Complete Transition
    stopLoadingRotation();
    showSection('result');
    showToast(`Connection established. Greetings from future ${name}!`, 'success');

  } catch (error) {
    console.error('Error generating FutureMe:', error);
    stopLoadingRotation();
    showSection('form');
    showToast('FutureMe could not respond right now. Try again.', 'error');
  } finally {
    submitBtn.disabled = false;
  }
});

// Render Result Cards
function renderResultData(data) {
  resBadge.textContent = data.futureIdentity || 'Unstoppable Builder';
  resMessage.textContent = data.message;
  resMantra.textContent = `"${data.mantra}"`;
  resWarning.textContent = data.warning;
  resHabit.textContent = data.habit;
  
  // Clear and inject 3 actions
  resActionsList.innerHTML = '';
  if (data.nextMoves && Array.isArray(data.nextMoves)) {
    data.nextMoves.forEach((move, index) => {
      const actionItem = document.createElement('div');
      actionItem.className = 'action-item';
      actionItem.innerHTML = `
        <div class="action-number">${index + 1}</div>
        <div class="action-text">${move}</div>
      `;
      resActionsList.appendChild(actionItem);
    });
  }
  
  // Update chat header title
  chatHeaderTitle.textContent = `Direct Thread: Future ${userProfile.name}`;
  
  // Seed first message in Chat History and UI
  const introMessage = `Hello, ${userProfile.name}. I am the version of you who arrived here in one year. I've written this letter above with deep care. Take a moment to read it, digest it, and then ask me anything you are struggling with. I am here to help you get here.`;
  
  chatHistory.push({
    role: 'futureme',
    message: introMessage
  });
  
  appendChatBubble('futureme', introMessage);
}

// Copy to Clipboard Formatter
copyBtn.addEventListener('click', () => {
  if (!latestResult || !userProfile) return;
  
  const textToCopy = `✨ FUTUREME REFLECTION PORTAL ✨
Munikanth's Founder Labs
----------------------------------------
PROFILE DETAILS:
Name: ${userProfile.name} (Age ${userProfile.age})
Advisor Tone: ${userProfile.tone}
Dream/Goal: ${userProfile.goal}
Current Struggle: ${userProfile.struggle}
One-Year Vision: ${userProfile.oneYearVision}

----------------------------------------
MESSAGE FROM YOUR FUTURE SELF:
${latestResult.message}

FUTURE IDENTITY:
"${latestResult.futureIdentity}"

DAILY MANTRA:
"${latestResult.mantra}"

ONE SMALL DAILY HABIT:
${latestResult.habit}

MISTAKE TO AVOID:
${latestResult.warning}

NEXT 3 STRATEGIC MOVES:
1. ${latestResult.nextMoves[0] || 'Execute with focus'}
2. ${latestResult.nextMoves[1] || 'Eliminate secondary distractions'}
3. ${latestResult.nextMoves[2] || 'Hold yourself accountable'}
----------------------------------------
Speak with your future self: Align your daily actions today.`;

  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      showToast('Reflection card copied to clipboard!', 'success');
    })
    .catch(error => {
      console.error('Copy failed:', error);
      showToast('Failed to copy. Please try again.', 'error');
    });
});

// 3. Voice Input (Speech-to-Text) for Chat
const micBtn = document.getElementById('mic-btn');
const chatInputRef = document.getElementById('chat-input');
let speechRecognition;
let isRecording = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  speechRecognition = new SpeechRecognition();
  speechRecognition.continuous = false;
  speechRecognition.interimResults = true;
  speechRecognition.lang = 'en-US';

  speechRecognition.onstart = () => {
    isRecording = true;
    micBtn.classList.add('recording');
    chatInputRef.placeholder = "Listening...";
  };

  speechRecognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }
    
    // Update the input field in real time
    if (finalTranscript) {
      chatInputRef.value = (chatInputRef.value + ' ' + finalTranscript).trim();
    } else {
      chatInputRef.value = interimTranscript;
    }
  };

  speechRecognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    isRecording = false;
    micBtn.classList.remove('recording');
    chatInputRef.placeholder = "Ask your future self anything...";
    showToast('Microphone error: ' + event.error, 'error');
  };

  speechRecognition.onend = () => {
    isRecording = false;
    micBtn.classList.remove('recording');
    chatInputRef.placeholder = "Ask your future self anything...";
  };

  if (micBtn) {
    micBtn.addEventListener('click', () => {
      if (isRecording) {
        speechRecognition.stop();
      } else {
        chatInputRef.value = ''; // clear input on new recording
        speechRecognition.start();
      }
    });
  }
} else {
  if (micBtn) {
    micBtn.style.display = 'none';
    console.warn('Speech Recognition API not supported in this browser.');
  }
}

// Chat Drawer Toggle
chatToggleBtn.addEventListener('click', () => {
  if (chatSection.classList.contains('hidden-chat')) {
    chatSection.classList.remove('hidden-chat');
    chatToggleBtn.innerHTML = `
      <svg class="btn-icon" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7a.996.996 0 1 0-1.41 1.41L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/></svg>
      Close Connection Thread
    `;
    
    // Smooth scroll to chat container
    chatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    chatSection.classList.add('hidden-chat');
    chatToggleBtn.innerHTML = `
      <svg class="btn-icon" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
      Converse with FutureMe
    `;
  }
});

// Reset / Go back to parameter adjustments
resetBtn.addEventListener('click', () => {
  showSection('form');
  // Scroll form into view
  formSection.scrollIntoView({ behavior: 'smooth' });
});

// Chat Send Message
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const question = chatInput.value.trim();
  if (!question) return;

  // Add User Message to State and UI
  chatHistory.push({
    role: 'user',
    message: question
  });
  appendChatBubble('user', question);
  
  // Clear input
  chatInput.value = '';
  
  // Disable input & button while loading
  chatInput.disabled = true;
  const sendBtn = chatForm.querySelector('.chat-send-btn');
  sendBtn.disabled = true;
  
  // Show Typing Indicator
  chatTyping.classList.remove('hidden');
  scrollToBottom();

  try {
    const response = await fetch('/api/chat-futureme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userProfile,
        chatHistory: chatHistory.slice(0, -1), // Send history except the newest question
        question
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Connection failed');
    }

    const reply = result.reply;
    
    // Add Reply to State and UI
    chatHistory.push({
      role: 'futureme',
      message: reply
    });
    
    // Hide typing before injecting bubble
    chatTyping.classList.add('hidden');
    appendChatBubble('futureme', reply);
    scrollToBottom();

  } catch (error) {
    console.error('Chat error:', error);
    chatTyping.classList.add('hidden');
    
    const errorMsg = 'FutureMe connection disrupted. Please focus on your current path and try checking in again in a moment.';
    appendChatBubble('futureme', errorMsg);
    showToast('Connection state disrupted. Try again.', 'error');
    scrollToBottom();
  } finally {
    chatInput.disabled = false;
    sendBtn.disabled = false;
    chatInput.focus();
  }
});

// Helper: Append Chat Bubble to container
function appendChatBubble(role, text) {
  const bubbleContainer = document.createElement('div');
  bubbleContainer.className = `chat-bubble-container ${role}`;
  
  // Use marked.js for FutureMe responses to support rich text (lists, tables), plain text for user
  const formattedText = role === 'futureme' && typeof marked !== 'undefined' 
    ? marked.parse(text) 
    : `<p>${text.replace(/\\n/g, '<br>')}</p>`;
  
  bubbleContainer.innerHTML = `
    <div class="chat-bubble ${role === 'futureme' ? 'markdown-content' : ''}">
      ${formattedText}
    </div>
  `;
  
  chatMessagesContainer.appendChild(bubbleContainer);
  scrollToBottom();
}

// Helper: Scroll Chat to bottom
function scrollToBottom() {
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

// --- WORLD-CLASS WOW FACTORS ---

// 1. Voice of the Future (Web Speech API)
const listenBtn = document.getElementById('listen-btn');
let isSpeaking = false;

if (listenBtn) {
  listenBtn.addEventListener('click', () => {
    if (!latestResult || !window.speechSynthesis) {
      showToast('Voice synthesis is not supported on this device.', 'error');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      isSpeaking = false;
      listenBtn.innerHTML = `
        <svg class="btn-icon" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
        Listen (Audio)
      `;
      return;
    }

    const textToSpeak = `Hello ${userProfile.name}. ${latestResult.message} Your mantra is: ${latestResult.mantra}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Dynamic Tone Adjustments
    if (userProfile.tone === 'CEO Mode') {
      utterance.rate = 1.1; // Fast, assertive
      utterance.pitch = 0.8; // Deeper
    } else if (userProfile.tone === 'Calm Mentor') {
      utterance.rate = 0.85; // Slow, soothing
      utterance.pitch = 1.2; // Slightly higher/softer
    } else if (userProfile.tone === 'Brutally Honest') {
      utterance.rate = 1.0;
      utterance.pitch = 0.7; // Deep and sharp
    } else {
      // Motivational
      utterance.rate = 1.15; // Energetic
      utterance.pitch = 1.3; // Higher energy
    }

    utterance.onstart = () => {
      isSpeaking = true;
      listenBtn.innerHTML = `
        <svg class="btn-icon" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 6h12v12H6z"/></svg>
        Stop Audio
      `;
    };

    utterance.onend = () => {
      isSpeaking = false;
      listenBtn.innerHTML = `
        <svg class="btn-icon" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
        Listen (Audio)
      `;
    };

    window.speechSynthesis.speak(utterance);
  });
}

// 2. CSV Blueprint Export
const exportBtn = document.getElementById('export-btn');

if (exportBtn) {
  exportBtn.addEventListener('click', () => {
    if (!latestResult || !userProfile) return;

    // Create CSV Data (Escaping commas for CSV format)
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "FutureMe 30-Day Action Blueprint\\n\\n";
    csvContent += `Name,${userProfile.name}\\n`;
    csvContent += `Target Vision,"${userProfile.oneYearVision.replace(/"/g, '""')}"\\n\\n`;
    
    csvContent += "Core Identity,Mantra,Daily Habit,Mistake to Avoid\\n";
    csvContent += `"${latestResult.futureIdentity.replace(/"/g, '""')}","${latestResult.mantra.replace(/"/g, '""')}","${latestResult.habit.replace(/"/g, '""')}","${latestResult.warning.replace(/"/g, '""')}"\\n\\n`;
    
    csvContent += "Day,Action Item,Status\\n";
    
    // Fill 30 days based on next moves
    for (let i = 1; i <= 30; i++) {
      // Rotate through the 3 action items
      const action = latestResult.nextMoves[(i-1) % latestResult.nextMoves.length].replace(/"/g, '""');
      csvContent += `Day ${i},"${action}",[]\\n`;
    }

    // Download Logic
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FutureMe_Blueprint_${userProfile.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Blueprint downloaded! Open it in Excel or Google Sheets.', 'success');
  });
}
