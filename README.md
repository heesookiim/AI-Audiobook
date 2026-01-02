# Personalized Bedtime Audiobook

A hackathon project that generates personalized, kid-safe bedtime audiobooks for children aged 3-5.

## Project Structure

- `backend/` - FastAPI server with story generation (Gemini) and audio generation (ElevenLabs)
- `frontend/` - Next.js web application
- Documentation files in root directory

## Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your API keys to `.env`:
- `GEMINI_API_KEY`: Get from https://makersuite.google.com/app/apikey
- `ELEVENLABS_API_KEY`: Get from https://elevenlabs.io/

5. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter a child's name
2. Click "Generate Story"
3. The story will be generated and audio will auto-play
4. Story text is displayed below the audio player

## Features

- Personalized stories using child's name
- Safe, calming content for ages 3-5
- Warm narration via ElevenLabs
- Simple, bedtime-appropriate UI

