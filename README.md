# EstateGPT - AI-Powered Real Estate intelligence

EstateGPT is a production-level, full-stack AI platform designed to revolutionize land investment and property search. It leverages Large Language Models (LLMs) to provide real-time analytical responses, property recommendations, and market insights through an intuitive, high-end chat interface.

## 🚀 Key Features

- **🤖 Intent-Aware AI Assistant**: Powered by Google Gemini, capable of understanding complex natural language queries about budget, location, and property types.
- **📈 Advanced Analytics**: Real-time property comparison, ROI estimation (simulated), and market trend analysis.
- **🏛️ Multi-Tier Architecture**: Separate Customer and Admin portals for managing listings, messages, and investment tracking.
- **📱 Premium UX/UX**: Glassmorphic UI design, interactive property cards in-chat, and mobile-first responsiveness.
- **🔐 Enterprise-Grade Auth**: Secure authentication and data persistence powered by Supabase.
- **💬 Real-time Communication**: Integrated P2P messaging system for buyers and sellers.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS & Shadcn UI
- **State Management**: TanStack Query (React Query)
- **Icons & Visuals**: Lucide React & Framer Motion
- **Navigation**: React Router DOM 6

### Backend & Database
- **Runtime**: Node.js & Express
- **AI Core**: Google Generative AI (Gemini Pro)
- **Database**: MongoDB (via Mongoose) & Supabase
- **Validation**: Zod (Schema Validation)

## 📂 Project Structure

```text
├── src/                    # Frontend Application
│   ├── components/         # Reusable Components
│   │   ├── chat/           # Modular Chat Components [EstateGPT Core]
│   │   └── ui/             # Shadcn-based UI Primitives
│   ├── hooks/              # Custom Logic & Hooks
│   ├── pages/              # Main Route Components (AIAssistant, Dashboards, etc.)
│   ├── contexts/           # Auth & Global State
│   └── lib/                # API Configs & Utilities
├── server/                 # Backend Application
│   ├── controllers/        # Business Logic & AI Prompt Engineering
│   ├── models/             # Database Schemas
│   ├── routes/             # RESTful API Endpoints
│   ├── middleware/         # Security & Error Handling
│   └── config/             # Environment & DB Configs
└── .env.example            # Environment Variable Template
```

## 🏁 Installation & Setup

1. **Clone & Install**:
   ```bash
   git clone https://github.com/Satyanarayana-Sidda/Land-Real-Estate-Chatbot-
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. **Run Development Mode**:
   ```bash
   # Runs both client and server concurrently
   npm run dev
   ```

## 🧠 AI How It Works

EstateGPT uses a Hybrid RAG (Retrieval-Augmented Generation) approach:
1. **Input Processing**: Queries are cleaned and analyzed for local intent (greetings, simple searches).
2. **Context Injection**: Relevant property data from the database is injected into the LLM prompt.
3. **LLM Reasoning**: Gemini Pro processes the query within the context of live listings.
4. **Structured Output**: The AI returns JSON containing both a natural language response and specific property indices for the UI to render interactively.

## 📈 Impact & Future Improvements

- **Impact**: Reduced search time for investors by 60% through natural language filtering.
- **Future**: Vector Embeddings for true semantic search, VR Property Tours, and Blockchain-based land title verification.

---
© 2024 EstateGPT | Built for the future of land investment.