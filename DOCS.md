# MediGuide Technical Documentation

## 1. LLM Provider Architecture
MediGuide uses a custom abstraction layer in `backend/utils/llmProviders.js` to manage multiple AI models.

### Fallback Mechanism
1. The system attempts the `PRIMARY_PROVIDER` defined in `.env`.
2. If the request fails (timeout, 5xx, or invalid key), it iterates through other configured providers.
3. If all providers fail, it returns an `offlineFallback` response.

### Available Providers
- **Groq**: Optimized for low latency (Llama 3.3).
- **OpenAI**: High-accuracy (GPT-4o).
- **Google**: Massive context (Gemini 1.5 Pro).
- **Deepseek**: High-performance chat.

---

## 2. Machine Learning Symptom Scorer
Located in `backend/ml/symptomScorer.js`, this module analyzes incoming user messages for severity markers independently of the LLM.

- **Urgency Mapping**: Calculates an integer score (1-5) based on keyword density and context rules.
- **Overlay Logic**: The ML score is merged with the LLM's `urgencyLevel`. If the ML engine detects a critical red flag, it can override the LLM's assessment to ensure safety.

---

## 3. Frontend Design System
The UI is built with vanilla CSS to maintain a light footprint while delivering a premium feel.

- **Responsive Grid**: Modules use a dynamic 1/2/4 column layout depending on screen width.
- **Glassmorphism**: Accomplished through `backdrop-filter` and semi-transparent backgrounds.
- **Micro-animations**: Includes floating background particles, typewriter effects for AI streaming (simulated), and shimmering skeleton loaders.

---

## 4. API Endpoints Summary

### Session Management
- `POST /api/start`: Generates a unique `sessionId`.

### Health Modules
All endpoints accept `{ sessionId, message }` and return a structured JSON response.
- `/api/symptom`
- `/api/firstaid`
- `/api/medicine`
- `/api/wellness`
- `/api/mentalhealth`
- `/api/nutrition`
- `/api/chat`
- `/api/druginteraction`

### Utilities
- `GET /api/health`: Comprehensive system status.
- `GET /api/history`: Returns list of previous sessions.
- `GET /api/history/:id`: Returns full conversation for a session.
- `DELETE /api/history/:id`: Removes a session.

---

## 5. Deployment Options

### Docker
The `Dockerfile` is a multi-stage build that:
1. Installs backend dependencies.
2. Builds the frontend React bundle.
3. Serves the static dist via the Express server on port 5000.

### PWA
Configured in `public/sw.js` and `manifest.json`. The app can be "Installed" on iOS/Android for a native-like experience.
