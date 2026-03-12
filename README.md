# AI-Powered Team Builder + Skill Match Platform

A full-stack platform that helps students form teams for hackathons using AI-powered recommendations.

## Tech Stack
- Backend: Python FastAPI
- Database: MongoDB
- Frontend: React
- Mobile: React Native (WebView hybrid)
- AI: OpenAI/LLM API

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Configure MongoDB URI and API keys in .env
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Mobile
```bash
cd mobile
npm install
npx react-native run-android
```

## API Endpoints
- POST /register - User registration
- POST /login - User login
- GET /users - List all users
- GET /users/{id} - Get user profile
- PUT /users/{id} - Update user profile
- POST /projects - Create project
- GET /projects - List projects
- GET /projects/{id} - Get project details
- GET /match/{project_id} - Get skill matches
- POST /ai/team-builder - AI team recommendations
