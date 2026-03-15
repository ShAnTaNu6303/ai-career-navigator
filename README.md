# 🧭 AI Career Navigator

An AI-powered full-stack platform providing personalized career guidance, skill gap analysis, and tailored roadmaps for professional growth.

**Stack:** React.js · Node.js · MongoDB · Claude AI (Anthropic)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 Resume Upload | Upload PDF/DOCX — Claude AI extracts structured data |
| 📝 Manual Profile | Fill field, role, experience, salary, goals |
| 🔍 Skill Analysis | Claude AI compares current vs required skills, calculates readiness score |
| 🗺️ Career Roadmap | Week/Month/3-Month personalized roadmap with tasks, resources, projects |
| 📥 PDF Export | Download roadmap as formatted PDF |
| 💼 Job Match | Filter jobs by field, role, experience — real seeded data |
| 👨‍💼 Mentor Booking | Book 15min/30min/1hr paid sessions with industry experts |
| 🏘️ Community | Posts, likes, comments, leaderboard, events |
| 🤖 AI Chatbot | 24/7 Claude AI career coach with persistent history |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Anthropic API Key

### 1. Clone & Setup

```bash
git clone https://github.com/yourname/ai-career-navigator
cd ai-career-navigator
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Fill in MONGODB_URI and ANTHROPIC_API_KEY in .env
npm run dev
```

### 3. Seed Database (jobs + mentors)

```bash
cd server
npm run seed
```

### 4. Frontend Setup

```bash
cd client
npm install
npm run dev
```

### 5. Open App

Navigate to `http://localhost:3000`

---

## 🔑 Environment Variables

### server/.env

```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
ANTHROPIC_API_KEY=sk-ant-api03-...
RAZORPAY_KEY_ID=rzp_test_...     
RAZORPAY_KEY_SECRET=...           
```

### client/.env (optional)

```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📁 Project Structure

```
ai-career-navigator/
├── client/          # React 18 + Vite + Tailwind
│   └── src/
│       ├── pages/   # 8 feature pages
│       ├── components/
│       ├── api/     # Axios API layer
│       └── store/   # Zustand auth state
└── server/          # Node.js + Express
    └── src/
        ├── routes/
        ├── controllers/
        ├── services/   # Claude AI integration
        ├── models/     # Mongoose schemas
        └── utils/      # Seed data
```

---

## 🤖 Claude AI Integration

All AI calls are in `server/src/services/claude.service.js`:

- `parseResume()` — Extract structured data from resume text
- `analyzeSkills()` — Generate skill gap analysis + readiness score
- `generateRoadmap()` — Build personalized week/month/quarter roadmap
- `chatMessage()` — 24/7 career coaching conversations

Model used: `claude-sonnet-4-20250514`

---

## 📦 Key Dependencies

**Backend:** express, mongoose, @anthropic-ai/sdk, pdf-parse, mammoth, multer, jsonwebtoken, bcryptjs, razorpay

**Frontend:** react-router-dom, zustand, @tanstack/react-query, axios, tailwindcss, recharts, jspdf, react-dropzone, react-hot-toast, lucide-react

---

## 🛠️ Deployment

**Frontend:** Vercel → `vercel --prod` from `/client`

**Backend:** Railway → connect GitHub, set env vars, deploy

**Database:** MongoDB Atlas (free tier works)

---

