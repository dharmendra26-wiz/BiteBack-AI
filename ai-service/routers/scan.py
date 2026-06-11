import os
import base64
import json
import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
from PIL import Image
import io

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
    genai.configure(api_key=GEMINI_API_KEY)
    GEMINI_AVAILABLE = True
else:
    GEMINI_AVAILABLE = False


class ScanRequest(BaseModel):
    image: str  # base64-encoded image
    mimeType: str = "image/jpeg"


MOCK_RESULTS = [
    {"name": "Sourdough Bread", "quantity": 3, "category": "Bakery", "estimatedValue": 12.00, "dietaryTags": ["Vegan"]},
    {"name": "Croissants", "quantity": 6, "category": "Bakery", "estimatedValue": 9.00, "dietaryTags": ["Vegetarian"]},
    {"name": "Blueberry Muffins", "quantity": 4, "category": "Bakery", "estimatedValue": 8.00, "dietaryTags": ["Vegetarian"]},
]


@router.post("/scan")
async def scan_inventory(request: ScanRequest):
    """
    Accepts a base64-encoded image of a shop shelf.
    Returns a list of detected food items with quantity, category, and dietary tags.
    """
    if not GEMINI_AVAILABLE:
        # Return mock data if no API key
        return {
            "items": MOCK_RESULTS,
            "confidence": 0.95,
            "source": "mock",
            "message": "Demo mode — add GEMINI_API_KEY to .env for real AI scanning"
        }

    try:
        # Decode image
        image_data = base64.b64decode(request.image)
        image = Image.open(io.BytesIO(image_data))

        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = """
        You are an AI assistant for a food rescue platform. 
        Look at this image of a shop shelf or food display.
        
        Identify all visible food items and return a JSON array.
        For each item include:
        - name: string (item name)
        - quantity: integer (estimated count visible)
        - category: one of ["Bakery","Produce","Dairy","Deli","Beverages","Prepared","Other"]
        - estimatedValue: number (estimated retail price in GBP)
        - dietaryTags: array of applicable tags from ["Vegan","Vegetarian","Gluten-Free","High-Protein","Dairy-Free","Organic","Halal","Kosher"]
        
        Return ONLY valid JSON like this example:
        [{"name":"Sourdough Bread","quantity":3,"category":"Bakery","estimatedValue":4.50,"dietaryTags":["Vegan"]}]
        
        If you cannot identify any food items, return an empty array: []
        """

        response = model.generate_content([prompt, image])
        text = response.text.strip()

        # Extract JSON from response
        json_match = re.search(r'\[.*\]', text, re.DOTALL)
        if json_match:
            items = json.loads(json_match.group())
        else:
            items = []

        return {
            "items": items,
            "confidence": 0.92,
            "source": "gemini",
            "message": f"Detected {len(items)} item(s)"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")
