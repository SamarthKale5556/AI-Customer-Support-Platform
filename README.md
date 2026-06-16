<div align="center">
  <img src="https://img.shields.io/badge/AI_Powered-Customer_Support-6366f1?style=for-the-badge&logo=probot" alt="AI Support Platform" />
  <h1>🚀 Next-Gen AI Customer Support Platform</h1>
  <p><em>Intelligent automation, real-time communication, and RAG-powered knowledge bases—all in one place.</em></p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Gemini_2.5_AI-4285F4?style=flat-square&logo=google&logoColor=white" alt="Google Gemini" />
    <img src="https://img.shields.io/badge/ChromaDB-FF69B4?style=flat-square&logo=database&logoColor=white" alt="ChromaDB" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

---

## 🌟 Overview

The **AI Customer Support Platform** is a modern, enterprise-ready ticketing system built for the future. It empowers customer support agents by augmenting their workflow with Google's **Gemini 2.5 Flash** AI models. From generating perfect, polite responses to intelligently summarizing 50-message threads, the platform radically reduces ticket resolution times.

This platform doesn't just use AI blindly; it utilizes **Retrieval-Augmented Generation (RAG)** via **ChromaDB Cloud** to give the AI direct access to your company's private, up-to-date documentation.

## ✨ Core Features

### 🤖 AI-Augmented Workflows
- **Fully Autonomous AI Agent:** Operates as your first-line support. Automatically responds to customer messages in real-time (< 2s latency) using up-to-date company policies.
- **Smart Human Handoff:** The AI seamlessly escalates tickets to human agents when it encounters complex issues or when a user explicitly asks for human support.
- **RAG Knowledge Base:** Upload your company documents. The AI searches the vector database (ChromaDB) to ground its responses and answer specific business questions accurately.
- **Intelligent Reply Suggestions:** Context-aware, professional, and polite reply suggestions generated instantly for agents to manually approve.
- **Sentiment Analysis:** Automatically detects if a ticket is *Positive*, *Neutral*, or *Negative*, allowing agents to prioritize frustrated customers.
- **One-Click Summarization:** Instantly generate concise, bulleted summaries of long, complex ticket conversations.

### ⚡ Real-Time Infrastructure
- **Live Chat & Typing Indicators:** WebSocket-based instant messaging with real-time "AI is typing..." animations for a natural user experience.
- **Global Notifications:** Instant broadcasts for new tickets, AI escalations, reassignments, closures, and critical sentiment shifts.

### 🔒 Enterprise-Grade Security & Auth
- **Robust JWT Authentication:** Secure session management using industry-standard JWT Access and Refresh tokens.
- **Bcrypt Password Hashing:** Direct integration with Bcrypt for uncompromised password storage and verification.
- **Role-Based Access Control (RBAC):** Strict isolation between Customers, Agents, and Admins to ensure data privacy and authorized interactions.
- **Premium Auth UI:** A split-screen, highly dynamic, $100M SaaS-style login and registration experience featuring smooth animations and immersive aesthetics.

### 📊 Powerful Analytics
- **Live Dashboard:** Real-time KPI cards displaying ticket volume, resolution times, and sentiment distributions.
- **Interactive Charts:** Beautiful Recharts-powered pie and bar graphs.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Frontend UI** | React, Vite, React Router, TailwindCSS, Recharts |
| **Backend API** | Python, FastAPI, Uvicorn, WebSockets |
| **ORM & DB Layer** | SQLAlchemy |
| **Primary Database** | Supabase (PostgreSQL with IPv4/IPv6 Connection Pooling) |
| **Vector Database** | ChromaDB Cloud |
| **AI Integration** | Google GenAI SDK (Gemini 2.5 Flash & Gemini Embeddings 2) |

---

## 🚀 Quick Start Guide

### 1. Database Setup
1. Create a project on **Supabase** and copy your Connection Pooling URL (IPv4 compatible, Port 6543/5432).
2. Create an account on **ChromaDB Cloud** and grab your API Key, Tenant ID, and Database Name.
3. Get a **Google Gemini API Key** from Google AI Studio.

### 2. Backend Installation
```bash
cd backend
python -m venv env
source env/bin/activate  # Or `env\Scripts\activate` on Windows
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
SECRET_KEY="your-secret-key"
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
SUPABASE_URL="https://[YOUR_PROJECT_REF].supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
GEMINI_API_KEY="your-gemini-key"
CHROMA_API_KEY="your-chromadb-key"
CHROMA_TENANT="your-chromadb-tenant"
CHROMA_CLOUD_DB="your-chromadb-database"
```

Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```

### 3. Frontend Installation
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser!

---

## 🌐 Deployment

- **Frontend:** Pre-configured with a `vercel.json` file for instant deployment on **Vercel**.
- **Backend:** Ready for deployment on **Render** (or any ASGI-compatible hosting). Just add your Environment Variables securely in your hosting dashboard.

<div align="center">
  <p>Built with ❤️ for modern customer success teams.</p>
</div>
