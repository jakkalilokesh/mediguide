# 🏥 MediGuide — AI-Powered Health Guidance Assistant

<div align="center">

**Smart Health Guidance, Anytime You Need It**

A comprehensive, AI-powered health companion that provides symptom analysis, first aid instructions, medication information, mental health support, nutrition planning, drug interaction checking, virtual specialist consultations, and wellness guidance — all in one premium application.

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?logo=nodedotjs)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-purple?logo=vite)
![License](https://img.shields.io/badge/License-MIT-yellow)
![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-orange)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Pages & Modules](#-pages--modules)
- [Authentication](#-authentication)
- [Multilingual Support](#-multilingual-support)
- [PWA & Offline Support](#-pwa--offline-support)
- [Docker Deployment](#-docker-deployment)
- [Security](#-security)
- [Contributing](#-contributing)

---

## ✨ Features

### 🩺 Core Health Modules (12 Modules)

| Module | Description |
|--------|-------------|
| **Symptom Checker** | AI-powered triage with body area selection, severity scoring, image-based diagnostics, urgency levels, and home remedies |
| **First Aid Guide** | Step-by-step emergency instructions with common mistakes and aftercare tips |
| **Medicine Info** | Comprehensive medication lookup — uses, dosages, side effects, precautions, and interactions |
| **Wellness Tips** | Science-backed guidance for sleep, exercise, diet, and lifestyle with a **4-7-8 Breathing Pacer** |
| **Mental Health** | Coping strategies, grounding techniques, breathing exercises, and crisis resources |
| **Nutrition Planner** | AI-generated meal plans, nutrient analysis, and hydration targets |
| **Health Calculators** | BMI, daily calorie needs, water intake, heart rate zones — instant results |
| **Drug Interaction** | Check potential interactions between multiple medications |
| **AI Virtual Clinic** | Simulated consultations with 5 AI specialists (GP, Dermatologist, Nutritionist, Mental Health, Cardiologist) |
| **Analytics Dashboard** | Track health queries, module usage, and daily activity patterns |
| **Health Data Tracker** | Log and monitor vitals — heart rate, BP, weight, sleep, oxygen saturation, and more |
| **Emergency Setup** | Configure emergency contacts and SOS quick-dial |

### 🚀 Premium Features

- **🔍 Global Search** — Search any module instantly from the top navigation bar
- **📸 Multimodal Diagnostics** — Upload images in the Symptom Checker for AI visual analysis
- **🧘 4-7-8 Breathing Pacer** — Animated visual guide for stress relief on the Wellness page
- **💡 Daily Health Tips** — Rotating health tips on the home dashboard
- **📊 Quick Vitals** — At-a-glance health summary for logged-in users
- **🤖 AI Chatbot** — Floating chatbot assistant available on every page
- **🆘 SOS Button** — One-tap emergency call button (floating, always accessible)
- **🎓 Onboarding Tour** — First-time user walkthrough
- **🌙 Dark Mode** — Full theme toggle with glassmorphism design
- **🌐 5 Languages** — English, Hindi, Spanish, French, Telugu
- **📱 PWA** — Installable, offline-capable Progressive Web App
- **🔐 JWT Authentication** — Secure login/register with route protection
- **🎨 Canvas Particles** — Animated medical-themed background

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │  Pages   │ │Components│ │ Contexts │ │   Assets   │  │
│  │ (17 pgs) │ │ (10+)    │ │ Auth/Lang│ │ CSS/SW     │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
│                        │ HTTP/REST API                  │
├────────────────────────┼────────────────────────────────┤
│                    BACKEND (Express.js)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Routes   │ │ LLM API  │ │ Database │ │  Safety    │  │
│  │ auth/api │ │ Multi-   │ │ SQLite   │ │ Red Flags  │  │
│  │ /health  │ │ Provider │ │ /better- │ │ ML Scoring │  │
│  │ /analytics││          │ │ sqlite3  │ │            │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
- **React 18** — Component-based UI with hooks
- **Vite 6** — Lightning-fast build tool and dev server
- **React Router v6** — Client-side routing with protected routes
- **Lucide React** — 200+ medical-themed icons
- **Vanilla CSS** — 4,200+ lines of hand-crafted premium styling (glassmorphism, animations, responsive grids)

### Backend
- **Node.js + Express** — REST API server
- **better-sqlite3** — Embedded SQLite database
- **JSON Web Tokens (JWT)** — Authentication
- **node-fetch** — Multi-provider LLM API calls
- **uuid** — Session management

### AI / ML
- **Multi-Provider LLM** — Supports multiple AI model providers
- **Red Flag Detection** — Safety module that detects emergency symptoms
- **ML Symptom Scorer** — Mathematical scoring of symptom severity
- **Offline Fallback** — Pre-cached responses for common queries
- **Image Analysis** — Visual diagnostic analysis via AI

---

## 📁 Project Structure

```
MediGuide/
├── backend/
│   ├── server.js              # Main Express server (570 lines)
│   ├── .env                   # Environment variables
│   ├── db/
│   │   └── database.js        # SQLite schema + prepared statements
│   ├── middleware/
│   │   └── auth.js            # JWT auth middleware
│   ├── routes/
│   │   ├── auth.js            # Login, Register, Profile
│   │   ├── healthData.js      # Health metrics CRUD
│   │   └── analytics.js       # Usage analytics API
│   ├── safety/
│   │   └── redflags.js        # Emergency symptom detection
│   ├── prompts/
│   │   └── medicalPrompt.js   # Module-specific AI prompts
│   ├── ml/
│   │   └── symptomScorer.js   # ML symptom severity scoring
│   └── utils/
│       ├── formatter.js       # Response parsing + sanitization
│       ├── llmProviders.js    # Multi-model LLM abstraction
│       └── offlineFallback.js # Offline response cache
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── public/
│   │   ├── sw.js              # Service worker for PWA
│   │   └── manifest.json      # PWA manifest
│   └── src/
│       ├── App.jsx            # Main app (routes, canvas, sendMessage)
│       ├── main.jsx           # Entry point
│       ├── index.css          # 4,200+ lines of premium CSS
│       ├── context/
│       │   ├── AuthContext.jsx     # JWT auth context
│       │   └── LanguageContext.jsx # i18n with 5 languages
│       ├── components/
│       │   ├── Sidebar.jsx         # Top bar + sidebar + global search
│       │   ├── Footer.jsx          # App footer with links
│       │   ├── Chatbot.jsx         # Floating AI chatbot
│       │   ├── SOSButton.jsx       # Emergency SOS button
│       │   ├── ResponseCard.jsx    # Structured AI response display
│       │   ├── TypingIndicator.jsx # Loading animation
│       │   ├── ImageUpload.jsx     # Drag-and-drop image uploader
│       │   ├── ProtectedRoute.jsx  # Auth route guard
│       │   ├── LanguageSwitcher.jsx# Language dropdown
│       │   └── OnboardingTour.jsx  # First-time user guide
│       └── pages/
│           ├── Home.jsx            # Dashboard (tips, vitals, modules)
│           ├── SymptomChecker.jsx  # Multi-step symptom triage
│           ├── FirstAid.jsx        # Emergency first aid
│           ├── MedicineInfo.jsx    # Drug lookup
│           ├── Wellness.jsx        # Wellness + Breathing Pacer
│           ├── MentalHealth.jsx    # Mental health support
│           ├── NutritionPlanner.jsx# Meal planning
│           ├── HealthCalculators.jsx# BMI, calories, etc.
│           ├── DrugInteraction.jsx # Drug interaction checker
│           ├── Consultation.jsx    # AI Virtual Clinic
│           ├── Analytics.jsx       # Usage analytics
│           ├── HealthData.jsx      # Vital signs tracker
│           ├── EmergencySetup.jsx  # Emergency contacts
│           ├── History.jsx         # Query history
│           ├── Profile.jsx         # User profile
│           ├── Login.jsx           # Authentication
│           └── Register.jsx        # Registration
│
├── Dockerfile
├── docker-compose.yml
├── DOCS.md
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ (recommended: v20+)
- **npm** v9+
- A supported LLM API key (see Environment Variables)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/mediguide.git
cd mediguide

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

Create a `.env` file in the `backend/` directory:

```env
# LLM API Configuration
LLM_API_KEY=your_api_key_here
LLM_BASE_URL=https://your-llm-provider.com/v1
LLM_MODEL=your-model-name

# JWT Secret
JWT_SECRET=your-jwt-secret-key-here

# Server
PORT=3001
```

### Running the Application

```bash
# Terminal 1 — Start the backend server
cd backend
node server.js
# Server will start on http://localhost:3001

# Terminal 2 — Start the frontend dev server
cd frontend
npm run dev
# Frontend will start on http://localhost:5173
```

### Production Build

```bash
cd frontend
npm run build
# Output: frontend/dist/ (serve with any static file server)
```

> **⚠️ Note**: If your folder path contains special characters (like em dashes —), use `npm run build` instead of `npx vite build`.

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LLM_API_KEY` | ✅ | API key for your LLM provider |
| `LLM_BASE_URL` | ✅ | Base URL for the LLM API endpoint |
| `LLM_MODEL` | ✅ | Model name/identifier |
| `JWT_SECRET` | ✅ | Secret key for JWT token signing |
| `PORT` | ❌ | Backend server port (default: 3001) |

---

## 📡 API Reference

### Session Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/start` | Start a new chat session |

### Health Modules (all require `sessionId` + `message` in body)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/symptom` | Symptom analysis and triage |
| `POST` | `/api/firstaid` | First aid instructions |
| `POST` | `/api/medicine` | Medication information |
| `POST` | `/api/wellness` | Wellness and lifestyle tips |
| `POST` | `/api/mentalhealth` | Mental health support |
| `POST` | `/api/nutrition` | Nutrition and meal planning |
| `POST` | `/api/chat` | General health chat |
| `POST` | `/api/druginteraction` | Drug interaction checking |
| `POST` | `/api/analyze-image` | Image-based visual analysis |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create new account |
| `POST` | `/api/auth/login` | Login with credentials |
| `GET` | `/api/auth/profile` | Get user profile |
| `PUT` | `/api/auth/profile` | Update user profile |

### Health Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health-data` | Get all health metrics |
| `POST` | `/api/health-data` | Add a health metric |
| `DELETE` | `/api/health-data/:id` | Delete a metric |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics` | Get usage analytics |

---

## 📄 Pages & Modules

| Page | Route | Auth Required | Description |
|------|-------|:---:|-------------|
| Home | `/` | ❌ | Dashboard with daily tips, quick vitals, and module grid |
| Symptom Checker | `/symptoms` | ✅ | Multi-step triage with body map, severity, and image upload |
| First Aid | `/firstaid` | ✅ | Emergency first aid guide |
| Medicine Info | `/medicine` | ✅ | Drug information lookup |
| Wellness | `/wellness` | ✅ | Wellness tips + 4-7-8 Breathing Pacer |
| Mental Health | `/mentalhealth` | ✅ | Mental health support and coping strategies |
| Nutrition | `/nutrition` | ✅ | AI-powered meal planning |
| Calculators | `/calculators` | ✅ | BMI, calories, water intake, heart rate zones |
| Drug Interaction | `/druginteraction` | ✅ | Multi-drug interaction checker |
| AI Virtual Clinic | `/consultation` | ✅ | Chat with 5 AI specialist doctors |
| Analytics | `/analytics` | ✅ | Usage statistics and charts |
| Health Data | `/health-data` | ✅ | Vital signs tracking and logging |
| Emergency | `/emergency` | ✅ | Emergency contacts and SOS setup |
| History | `/history` | ✅ | Past health queries |
| Profile | `/profile` | ✅ | User health profile management |
| Login | `/login` | ❌ | User authentication |
| Register | `/register` | ❌ | New user registration |

---

## 🔐 Authentication

MediGuide uses **JWT (JSON Web Tokens)** for authentication:

1. **Register** → Creates account + returns JWT token
2. **Login** → Validates credentials + returns JWT token
3. **Protected Routes** → `ProtectedRoute` component checks `isAuthenticated` from `AuthContext`
4. **API Calls** → Token automatically attached via `authFetch()` or `Authorization` header

Public pages: Home, Login, Register. All other 13 pages require authentication.

---

## 🌐 Multilingual Support

MediGuide supports **5 languages** with complete UI translation:

| Language | Code | Flag |
|----------|------|------|
| English | `en` | 🇺🇸 |
| Hindi (हिन्दी) | `hi` | 🇮🇳 |
| Spanish (Español) | `es` | 🇪🇸 |
| French (Français) | `fr` | 🇫🇷 |
| Telugu (తెలుగు) | `te` | 🇮🇳 |

Translations cover: navigation, common UI, authentication, home, profile, analytics, health data, and emergency sections. Language preference is persisted in `localStorage`.

---

## 📱 PWA & Offline Support

MediGuide is a **Progressive Web App**:

- **Installable** — Can be installed on mobile and desktop
- **Offline Capable** — Service worker caches critical assets
- **Offline Fallback** — Pre-cached responses for common health queries when the LLM API is unreachable
- **Responsive** — Works on mobile, tablet, and desktop

---

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t mediguide .
docker run -p 3001:3001 mediguide
```

---

## 🛡 Security

- **JWT Authentication** — Secure token-based auth
- **Input Sanitization** — All user inputs are sanitized
- **Red Flag Detection** — Emergency symptoms trigger immediate safety alerts
- **Rate Limiting** — API rate limiting to prevent abuse
- **No External Data Storage** — All data stored locally in SQLite
- **CORS Protection** — Cross-origin request filtering

---

## ⚠️ Medical Disclaimer

> **MediGuide is a health guidance tool — not a replacement for professional medical advice.**
> Always consult a healthcare provider for serious health concerns.
> In emergencies, call your local emergency number immediately.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

**Built with 💚 for better health**

⭐ Star this repository if you found it helpful!

</div>
