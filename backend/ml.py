"""
Gemini-powered Food Analysis & Nutrition Tracking API
Production-ready backend with Google Gemini AI
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import os
import io
import json
import base64
import re

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("✅ Loaded environment from .env file")
except ImportError:
    print("⚠️ python-dotenv not installed, using system environment variables")

# Google Gemini AI
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    print("⚠️ Google Generative AI not installed. Run: pip install google-generativeai")
    GEMINI_AVAILABLE = False

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    print("⚠️ Pillow not available")
    PIL_AVAILABLE = False

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False

app = FastAPI(
    title="Intake Tracker API",
    description="AI-powered food recognition and nutrition tracking with Google Gemini",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
gemini_model = None
gemini_vision_model = None

def initialize_gemini():
    """Initialize Gemini AI models"""
    global gemini_model, gemini_vision_model
    
    if not GEMINI_AVAILABLE:
        return False
        
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("⚠️ GEMINI_API_KEY environment variable not set")
        return False
    
    try:
        genai.configure(api_key=api_key)
        
        # Text model for nutrition advice and meal logging
        gemini_model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Vision model for food image analysis
        gemini_vision_model = genai.GenerativeModel('gemini-2.5-flash')
        
        print("✅ Gemini AI models initialized successfully")
        return True
    except Exception as e:
        print(f"⚠️ Failed to initialize Gemini: {e}")
        return False

# Initialize on startup
initialize_gemini()

# Pydantic models
class TextMealRequest(BaseModel):
    description: str
    weight_g: Optional[int] = None

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

class NutritionInfo(BaseModel):
    name: str
    weight_g: int
    kcal: int
    protein_g: int
    carbs_g: int
    fat_g: int
    confidence: float

def parse_nutrition_response(response_text: str) -> List[dict]:
    """Parse Gemini's response to extract nutrition information"""
    try:
        # Try to extract JSON from the response
        json_match = re.search(r'\[[\s\S]*?\]', response_text)
        if json_match:
            return json.loads(json_match.group())
        
        # Try to find a single JSON object
        obj_match = re.search(r'\{[\s\S]*?\}', response_text)
        if obj_match:
            return [json.loads(obj_match.group())]
            
    except json.JSONDecodeError:
        pass
    
    return []

@app.get("/")
async def root():
    """API health check"""
    return {
        "status": "healthy",
        "service": "Intake Tracker API",
        "version": "2.0.0",
        "gemini_available": gemini_model is not None
    }

@app.post("/infer")
async def infer_nutrition(file: UploadFile = File(...)):
    """
    AI-powered food recognition using Google Gemini Vision
    Analyzes food images and returns detailed nutrition information
    """
    
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Please upload a valid image file")
    
    if not gemini_vision_model:
        raise HTTPException(
            status_code=503, 
            detail="Gemini AI service not configured. Please set GEMINI_API_KEY environment variable."
        )
    
    try:
        # Read and process image
        image_bytes = await file.read()
        
        if not PIL_AVAILABLE:
            raise HTTPException(status_code=500, detail="Image processing not available")
        
        # Open image with PIL
        image = Image.open(io.BytesIO(image_bytes))
        
        # Prepare the prompt for Gemini Vision
        prompt = """Analyze this food image and provide detailed nutrition information.

IMPORTANT: You must respond ONLY with a valid JSON array, no other text.

For each food item visible in the image, provide:
- name: The name of the food item
- weight_g: Estimated weight in grams (be realistic based on typical serving sizes)
- kcal: Estimated calories
- protein_g: Protein in grams
- carbs_g: Carbohydrates in grams
- fat_g: Fat in grams
- confidence: Your confidence level (0.0 to 1.0)

Example response format:
[
  {"name": "Grilled Chicken Breast", "weight_g": 150, "kcal": 248, "protein_g": 46, "carbs_g": 0, "fat_g": 5, "confidence": 0.95}
]

If you cannot identify the food clearly, still provide your best estimate with a lower confidence score.
Respond ONLY with the JSON array, nothing else."""

        # Generate response using Gemini Vision
        response = gemini_vision_model.generate_content([prompt, image])
        
        if not response.text:
            raise HTTPException(status_code=422, detail="Could not analyze the food image")
        
        # Parse the response
        dishes = parse_nutrition_response(response.text)
        
        if not dishes:
            # If parsing failed, create a fallback response
            dishes = [{
                "name": "Unknown Food",
                "weight_g": 150,
                "kcal": 200,
                "protein_g": 10,
                "carbs_g": 20,
                "fat_g": 8,
                "confidence": 0.5
            }]
        
        # Ensure all required fields are present and convert to proper types
        processed_dishes = []
        for dish in dishes:
            processed_dish = {
                "name": str(dish.get("name", "Unknown Food")),
                "weight_g": int(dish.get("weight_g", 150)),
                "kcal": int(dish.get("kcal", 200)),
                "protein_g": int(dish.get("protein_g", 10)),
                "carbs_g": int(dish.get("carbs_g", 20)),
                "fat_g": int(dish.get("fat_g", 8)),
                "confidence": round(float(dish.get("confidence", 0.8)) * 100, 1)
            }
            processed_dishes.append(processed_dish)
        
        return {"dishes": processed_dishes}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail=f"Food analysis failed: {str(e)}")

@app.post("/analyze-text")
async def analyze_text_meal(request: TextMealRequest):
    """
    Analyze a meal described in natural language text using Gemini AI
    Example: "I had a bowl of rice with grilled chicken and vegetables"
    """
    
    if not gemini_model:
        raise HTTPException(
            status_code=503,
            detail="Gemini AI service not configured. Please set GEMINI_API_KEY environment variable."
        )
    
    try:
        weight_hint = f"\nThe user mentioned the total weight is approximately {request.weight_g}g." if request.weight_g else ""
        
        prompt = f"""Analyze this meal description and provide detailed nutrition information.

Meal description: "{request.description}"{weight_hint}

IMPORTANT: You must respond ONLY with a valid JSON array, no other text.

For each food item mentioned, provide:
- name: The name of the food item
- weight_g: Estimated weight in grams (be realistic based on typical serving sizes)
- kcal: Estimated calories
- protein_g: Protein in grams
- carbs_g: Carbohydrates in grams
- fat_g: Fat in grams
- confidence: Your confidence level (0.0 to 1.0)

Example response format:
[
  {{"name": "White Rice", "weight_g": 200, "kcal": 260, "protein_g": 5, "carbs_g": 56, "fat_g": 1, "confidence": 0.9}},
  {{"name": "Grilled Chicken", "weight_g": 100, "kcal": 165, "protein_g": 31, "carbs_g": 0, "fat_g": 4, "confidence": 0.9}}
]

Be specific with portion sizes based on common serving sizes.
Respond ONLY with the JSON array, nothing else."""

        response = gemini_model.generate_content(prompt)
        
        if not response.text:
            raise HTTPException(status_code=422, detail="Could not analyze the meal description")
        
        # Parse the response
        dishes = parse_nutrition_response(response.text)
        
        if not dishes:
            raise HTTPException(
                status_code=422, 
                detail="Could not parse nutrition information from the description"
            )
        
        # Process and validate dishes
        processed_dishes = []
        for dish in dishes:
            processed_dish = {
                "name": str(dish.get("name", "Unknown Food")),
                "weight_g": int(dish.get("weight_g", 150)),
                "kcal": int(dish.get("kcal", 200)),
                "protein_g": int(dish.get("protein_g", 10)),
                "carbs_g": int(dish.get("carbs_g", 20)),
                "fat_g": int(dish.get("fat_g", 8)),
                "confidence": round(float(dish.get("confidence", 0.8)) * 100, 1)
            }
            processed_dishes.append(processed_dish)
        
        return {"dishes": processed_dishes}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Text analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Meal analysis failed: {str(e)}")

@app.post("/nutrition-chat")
async def nutrition_chat(request: ChatRequest):
    """
    Chat with AI about nutrition, diet, and health questions
    Powered by Google Gemini
    """
    
    if not gemini_model:
        raise HTTPException(
            status_code=503,
            detail="Gemini AI service not configured. Please set GEMINI_API_KEY environment variable."
        )
    
    try:
        context_info = ""
        if request.context:
            context_info = f"\n\nUser's current nutrition context:\n{request.context}"
        
        prompt = f"""You are a helpful and knowledgeable nutrition and health assistant. 
Provide accurate, science-based information about nutrition, diet, and wellness.

Guidelines:
1. Be helpful and conversational
2. Provide specific, actionable advice when possible
3. Include relevant nutritional information when discussing foods
4. Always recommend consulting healthcare professionals for medical concerns
5. Be encouraging and supportive about healthy eating habits
6. If asked about specific foods, include calorie and macro information when relevant
{context_info}

User question: {request.message}

Provide a helpful, informative response:"""

        response = gemini_model.generate_content(prompt)
        
        if not response.text:
            return {
                "response": "I'm having trouble processing your question right now. Please try again.",
                "confidence": 0.5,
                "urgency": "low"
            }
        
        # Determine urgency based on content
        urgency = "low"
        urgent_keywords = ["emergency", "severe pain", "difficulty breathing", "chest pain", "allergic reaction"]
        moderate_keywords = ["concerned", "worried", "persistent", "recurring", "unusual"]
        
        message_lower = request.message.lower()
        if any(keyword in message_lower for keyword in urgent_keywords):
            urgency = "high"
        elif any(keyword in message_lower for keyword in moderate_keywords):
            urgency = "moderate"
        
        return {
            "response": response.text,
            "confidence": 0.9,
            "urgency": urgency
        }
        
    except Exception as e:
        print(f"Chat error: {e}")
        return {
            "response": "I'm experiencing technical difficulties. Please try again or consult a healthcare professional for urgent concerns.",
            "confidence": 0.5,
            "urgency": "low"
        }

@app.post("/quick-log")
async def quick_log_meal(request: TextMealRequest):
    """
    Quick meal logging with natural language
    Optimized for fast, single-food entries
    """
    
    if not gemini_model:
        raise HTTPException(
            status_code=503,
            detail="Gemini AI service not configured."
        )
    
    try:
        weight_hint = f" (approximately {request.weight_g}g)" if request.weight_g else ""
        
        prompt = f"""Quickly estimate the nutrition for: "{request.description}"{weight_hint}

Respond with ONLY a single JSON object (not an array):
{{"name": "Food Name", "weight_g": 150, "kcal": 200, "protein_g": 10, "carbs_g": 20, "fat_g": 8, "confidence": 0.9}}

Use realistic serving sizes and accurate nutrition data."""

        response = gemini_model.generate_content(prompt)
        
        if not response.text:
            raise HTTPException(status_code=422, detail="Could not analyze the food")
        
        # Parse single object response
        dishes = parse_nutrition_response(response.text)
        
        if not dishes:
            raise HTTPException(status_code=422, detail="Could not parse nutrition information")
        
        dish = dishes[0]
        return {
            "name": str(dish.get("name", request.description.title())),
            "weight_g": int(dish.get("weight_g", request.weight_g or 150)),
            "kcal": int(dish.get("kcal", 200)),
            "protein_g": int(dish.get("protein_g", 10)),
            "carbs_g": int(dish.get("carbs_g", 20)),
            "fat_g": int(dish.get("fat_g", 8)),
            "confidence": round(float(dish.get("confidence", 0.85)) * 100, 1)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Quick log error: {e}")
        raise HTTPException(status_code=500, detail=f"Quick log failed: {str(e)}")

@app.post("/suggest-meals")
async def suggest_meals(request: ChatRequest):
    """
    Get personalized meal suggestions based on remaining macros
    """
    
    if not gemini_model:
        raise HTTPException(
            status_code=503,
            detail="Gemini AI service not configured."
        )
    
    try:
        prompt = f"""Based on the user's nutritional needs and preferences, suggest 3-5 meal ideas.

User request: {request.message}

{f"Additional context: {request.context}" if request.context else ""}

Provide meal suggestions in this JSON format:
[
  {{"name": "Meal Name", "description": "Brief description", "estimated_kcal": 400, "protein_g": 30, "carbs_g": 40, "fat_g": 15}}
]

Focus on balanced, healthy options that match the user's needs.
Respond ONLY with the JSON array."""

        response = gemini_model.generate_content(prompt)
        
        if not response.text:
            return {"suggestions": []}
        
        # Parse suggestions
        try:
            json_match = re.search(r'\[[\s\S]*?\]', response.text)
            if json_match:
                suggestions = json.loads(json_match.group())
                return {"suggestions": suggestions}
        except json.JSONDecodeError:
            pass
        
        return {"suggestions": []}
        
    except Exception as e:
        print(f"Suggestion error: {e}")
        return {"suggestions": []}

# Legacy endpoint for backward compatibility
@app.post("/medical-chat")
async def medical_chat(request: dict):
    """Legacy medical chat endpoint - redirects to nutrition-chat"""
    chat_request = ChatRequest(
        message=request.get("message", ""),
        context=request.get("context")
    )
    return await nutrition_chat(chat_request)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)