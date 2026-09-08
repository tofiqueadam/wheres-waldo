# Where's Waldo

A full-stack photo-tagging game inspired by Where's Waldo. Find every character,
finish as quickly as possible, and save your time to the leaderboard.

## Tech Stack

- Frontend: Next.js, React, and TypeScript
- Backend: FastAPI, Python, and SQLAlchemy
- Database: PostgreSQL

## Features

- Responsive game screen for desktop, tablet, and mobile
- Start screen with player name
- Responsive image coordinates and character detection
- Zoom, pan, and touch pinch gestures
- Timer and progress tracking
- FastAPI validation for character guesses
- Score persistence and fastest-time leaderboard
- Play Again without refreshing the browser
- Loading and API error states

## Project Structure

- `frontend/` - Next.js application and game UI
- `backend/` - FastAPI application, SQLAlchemy models, and API routers

## Setup

### Backend

Create `backend/.env` from `backend/.env.example` and set your PostgreSQL
connection string:

```env
DATABASE_URL=postgresql+psycopg://username:password@localhost/waldo_db
```

Install dependencies and start FastAPI:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API and Swagger documentation are available at:

- `http://127.0.0.1:8000`
- `http://127.0.0.1:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000/game` to play.

## API

- `GET /api/characters/` - list characters
- `GET /api/characters/{id}` - get one character
- `POST /api/game/guess` - validate a character guess
- `POST /api/scores/` - save a completed game score
- `GET /api/scores/` - list scores by fastest time

## Database Tables

- `images` - source image records
- `characters` - character names and original-image bounding boxes
- `scores` - player names and completion times

## Security

The real `backend/.env` file is local-only and ignored by Git. Use
`backend/.env.example` as the shareable configuration template.