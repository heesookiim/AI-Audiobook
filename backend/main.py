from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import google.generativeai as genai
from google.generativeai.types import GenerationConfig
from elevenlabs.client import ElevenLabs
import base64

load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize APIs
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Initialize ElevenLabs client
elevenlabs_client = None
if ELEVENLABS_API_KEY:
    elevenlabs_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)


class StoryRequest(BaseModel):
    child_name: str


class StoryResponse(BaseModel):
    story_text: str
    audio_base64: str


def load_story_prompt() -> str:
    """Load the canonical story prompt from story_prompt.md"""
    prompt_path = os.path.join(os.path.dirname(__file__), "..", "story_prompt.md")
    with open(prompt_path, "r") as f:
        return f.read()


def generate_story(child_name: str) -> str:
    """Generate a bedtime story using Gemini"""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    prompt_template = load_story_prompt()
    prompt = prompt_template.replace("{{CHILD_NAME}}", child_name)
    
    try:
        model = genai.GenerativeModel("gemini-3-flash-preview")
        
        # Configure generation to limit output length
        generation_config = genai.types.GenerationConfig(
            max_output_tokens=8000,  # Limit to help stay within 5 minutes of audio
            temperature=0.7,  # Balanced creativity
        )
        
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        story_text = response.text.strip()
        
        # Validate character count
        char_count = len(story_text)
        
        if char_count < 2000:
            raise HTTPException(
                status_code=500, 
                detail=f"Generated story is too short ({char_count} characters, minimum 2000)"
            )
        if char_count > 5000:
            raise HTTPException(
                status_code=500, 
                detail=f"Generated story is too long ({char_count} characters, maximum 5000)"
            )
        
        return story_text
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Story generation failed: {str(e)}")


def generate_audio(story_text: str) -> bytes:
    """Generate audio using ElevenLabs"""
    if not elevenlabs_client:
        raise HTTPException(status_code=500, detail="ElevenLabs API key not configured")
    
    try:
        # Use a warm, calm voice for bedtime stories
        # Using default voice or Rachel for calm bedtime narration
        audio = elevenlabs_client.text_to_speech.convert(
            text=story_text,
            voice_id="Tfv2PGiTliSQ4XSXrJmA",  # 
            model_id="eleven_v3",
            output_format="mp3_44100_128"
            # speed=0.80,
            # stability=0.87,
            # similarity_boost=0.63,
            # style=0.50,
            # use_speaker_boost=True,
        )
        
        # Convert generator/stream to bytes
        audio_bytes = b"".join(audio)
        
        return audio_bytes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio generation failed: {str(e)}")


@app.get("/")
def root():
    return {"message": "Bedtime Audiobook API"}


@app.post("/generate", response_model=StoryResponse)
async def generate_audiobook(request: StoryRequest):
    """Generate a personalized bedtime story and audio"""
    if not request.child_name or len(request.child_name.strip()) == 0:
        raise HTTPException(status_code=400, detail="Child name is required")
    
    child_name = request.child_name.strip()
    
    # Generate story
    story_text = generate_story(child_name)
    
    # Generate audio
    audio_bytes = generate_audio(story_text)
    
    # Convert audio to base64 for frontend
    audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
    
    return StoryResponse(
        story_text=story_text,
        audio_base64=audio_base64
    )

