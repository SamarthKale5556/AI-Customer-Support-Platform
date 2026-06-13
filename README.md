# AI-Powered Customer Support Platform

This is a full-stack, AI-driven customer support platform featuring intelligent automation, real-time communication, a hybrid RAG knowledge base, and comprehensive analytics.

## Architecture

- **Frontend**: React, React Router, Recharts, TailwindCSS, Vite
- **Backend**: FastAPI, SQLAlchemy, WebSockets
- **Primary Database**: Supabase PostgreSQL
- **Vector Database**: ChromaDB (with Gemini Embeddings)
- **AI Models**: Google Gemini (GenAI API)

### Key Features
1. **Real-time Chat**: WebSocket-based instant messaging between customers and agents.
2. **Global Notifications**: WebSocket broadcasts for new tickets, assignments, closures, and negative sentiment detection.
3. **AI Reply Suggestions**: Context-aware, professional, and polite reply suggestions for agents.
4. **Sentiment Analysis**: Automatic detection of positive, neutral, or negative ticket sentiment.
5. **Chat Summarization**: One-click summary generation of long ticket conversations.
6. **Hybrid RAG Knowledge Base**: Agents can ingest documentation and query it using Gemini, powered by a ChromaDB vector index.
7. **Analytics Dashboard**: Real-time KPI cards and charts (Pie, Bar) displaying ticket volume, resolution times, and sentiment distribution.

## Setup Guide

### 1. Backend Setup
1. Navigate to the `backend/` directory.
2. Install dependencies: `pip install -r requirements.txt`
3. Configure `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:[password]@[db-url]:5432/postgres
   GEMINI_API_KEY=your_gemini_api_key
   CHROMA_DB_PATH=./chroma_data
   ```
4. Run migrations if necessary: `python scripts/migrate_to_supabase.py`
5. Start the server: `python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`

### 2. Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

## Deployment Guide

### Frontend Deployment (Vercel)
- The `frontend/` directory is pre-configured with a `vercel.json` file for single-page application routing.
- Simply import the frontend directory into Vercel and deploy.

### Backend Deployment (Render)
- The `backend/` directory includes a `render.yaml` configuration.
- It defines a Web Service running FastAPI using Uvicorn.
- It provisions a persistent disk (`/var/data/chroma`) for the ChromaDB local vector store.
- Add your secret Environment Variables (`DATABASE_URL`, `GEMINI_API_KEY`) in the Render Dashboard.
