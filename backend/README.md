# Backend API

## Setup

1. Create and activate a virtual environment:
```bash
# Create virtual environment
python3.11 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory with your API keys:
```bash
# Create .env file
touch .env
```

4. Add your API keys to `.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

Get your API keys:
- `GEMINI_API_KEY`: Get from https://makersuite.google.com/app/apikey
- `ELEVENLABS_API_KEY`: Get from https://elevenlabs.io/ (sign up and get API key from your profile)

## Run

Make sure your virtual environment is activated, then:

```bash
uvicorn main:app --reload --port 8000
```

To deactivate the virtual environment when done:
```bash
deactivate
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - Health check
- `POST /generate` - Generate a personalized bedtime story and audio
  - Request body: `{"child_name": "Emma"}`
  - Response: `{"story_text": "...", "audio_base64": "..."}`

