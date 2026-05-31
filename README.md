# FutureMe 🚀 
*An AI-powered personal reflection platform that lets you speak with your future self.*

![FutureMe Banner](https://via.placeholder.com/1200x600/101827/ffffff?text=FutureMe+-+Speak+To+Your+Future+Self)

FutureMe is a world-class, interactive web application that bridges the gap between your present struggles and your future success. By leveraging **Google Gemini 2.5 Flash**, it generates highly personalized, context-aware letters from your "future self" who has already achieved your one-year vision. 

## ✨ Key Features
- **🔮 Timeline Alignment:** Inputs your current goals, struggles, and desired tone to align with a future timeline.
- **🎙️ Voice of the Future (Voice Input):** Integrated Web Speech API allows you to dictate your thoughts via a microphone instead of typing.
- **🔊 Audio Synthesis:** The app can physically speak your future letter to you, dynamically adjusting the voice pitch and speed based on the selected archetype (e.g., CEO Mode, Calm Mentor).
- **📝 Expert Chat (Markdown Rendering):** Chat securely with your future self. Responses are rendered using rich Markdown (tables, bulleted lists) for actionable strategic plans.
- **📊 Blueprint Export:** Export your AI-generated daily habits and mantras directly to a `.csv` file.
- **🛡️ Emergency Protocol (Fail-Safe):** If the AI API fails, the backend seamlessly intercepts the crash and serves a high-fidelity fallback response, ensuring the UI never breaks during presentations.

---

## 🛠️ Tech Stack
- **Frontend:** Vanilla HTML5, CSS3 (Glassmorphism design, CSS Grid), Vanilla JavaScript (ES6+).
- **Backend:** Node.js, Express.js.
- **AI Integration:** Google Generative AI SDK (`@google/generative-ai`) using `gemini-2.5-flash`.
- **APIs:** Native browser `SpeechRecognition` and `SpeechSynthesisUtterance`.
- **Deployment & Hosting:** Vercel (Serverless Functions).

---

## 🚀 Step-by-Step Setup Guide

Follow these steps to run FutureMe on your local machine:

### 1. Prerequisites
- Node.js (v18 or higher) installed on your machine.
- A free Google Gemini API Key from Google AI Studio.

### 2. Clone & Install
Clone this repository and install the dependencies:
```bash
git clone https://github.com/YOUR_USERNAME/futureme.git
cd futureme
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory of the project:
```bash
touch .env
```
Inside the `.env` file, add your Gemini API Key:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Run Locally
Start the local Express server:
```bash
npm start
```
Open your browser and navigate to: `http://localhost:3000`

---

## ☁️ Deployment (Vercel)

This project is configured to run effortlessly on Vercel as a Serverless function. 

1. Install the Vercel CLI:
```bash
npm install -g vercel
```
2. Login to Vercel:
```bash
vercel login
```
3. Deploy:
```bash
vercel --prod
```
4. **Important:** Make sure to go to your Vercel Project Dashboard -> Settings -> Environment Variables, and add your `GEMINI_API_KEY`.

---

## 📄 License
This project is licensed under the MIT License. Feel free to use it, modify it, and present it!
