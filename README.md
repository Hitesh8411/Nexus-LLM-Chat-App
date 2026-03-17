# llm-chat-app (Vite + Express + Gemini)

This repo contains:
- **Frontend**: Vite + React (build output in `dist/`)
- **Backend**: Express API in `server/server.js` (also serves `dist/` in production)

## Local dev

Create `.env`:

```env
GEMINI_API_KEY=YOUR_KEY
GEMINI_MODEL=gemini-flash-latest
PORT=5001
```

Install + run:

```bash
npm install
npm run dev
```

Frontend runs on a Vite port (shown in terminal). API runs on `http://localhost:5001`.

## Production build (single server)

```bash
npm install
npm run build
npm start
```

Then open:
- `http://localhost:5001/` (frontend)
- `http://localhost:5001/api/health` (health)

## Deploy (recommended: Render)

1. Push this folder to GitHub.
2. Create a **Render Web Service**.
3. Set:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add environment variables:
   - `GEMINI_API_KEY` (required)
   - `GEMINI_MODEL` (optional, default: `gemini-flash-latest`)

Render will set `PORT` automatically.

# 🚀 Gemini Focus - Premium LLM Chat App

A full-stack, AI-powered chat application built with **React**, **Vite**, **Express**, and **Google Gemini 1.5 Flash**.

## ✨ Features
- **Premium UI**: Modern, dark-themed interface with glassmorphism and smooth animations.
- **Three Core Modes**:
  - 💬 **Chat**: Professional AI conversation.
  - 📝 **Summarise**: Automatic TL;DR and key insights extraction.
  - 🏷️ **Classify**: Sentiment, category, and entity analysis.
- **Real-time Feedback**: Loading states, auto-scrolling, and responsive design.
- **Scalable Architecture**: Decoupled frontend and Node.js backend.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Axios.
- **Backend**: Node.js, Express, CORS.
- **AI**: Google Generative AI (Gemini 1.5 Flash).
- **Tools**: Concurrently (to run both servers seamlessly).

## 🚀 Getting Started

### 1. Prerequisite
- Node.js installed.
- A **Google Gemini API Key** (Get it from [Google AI Studio](https://aistudio.google.com/)).

### 2. Setup
Clone the project and install dependencies:
```bash
cd llm-chat-app
npm install
```

### 3. Environment Config
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_actual_key_here
PORT=5000
```

### 4. Run the Project
Launch both the React frontend and Express backend with one command:
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## 🚀 Deployment Pro-Tip
- **Frontend**: Vercel / Netlify.
- **Backend**: Render / Railway.
- **Update URL**: Replace `http://localhost:5000` in `App.jsx` with your deployed backend URL.
