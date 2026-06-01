from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Any
import uvicorn
from app.recommender import load_model, predict, available_models

# Initialize FastAPI app
app = FastAPI(
    title="Maison de Parfum - Recommendation Engine",
    description="API for providing personalized perfume recommendations.",
    version="1.0.0"
)

# Load the model at startup
try:
    model = load_model()
except Exception as e:
    print(f"Critical error: Could not load the model. {e}")
    model = None

# Define request schema
class RecommendRequest(BaseModel):
    user_id: Optional[int] = None
    features: Optional[List[float]] = None
    query: Optional[str] = None
    available_perfumes: Optional[List[dict]] = None
    tenant_id: Optional[int] = None
    model_name: Optional[str] = None
    top_n: Optional[int] = 5

# Root endpoint
@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Welcome to the Maison de Parfum Recommendation API",
        "model_loaded": model is not None,
        "available_models": available_models()
    }

@app.get("/models")
async def models():
    return {
        "available_models": available_models()
    }

# Recommendation endpoint
@app.post("/recommend")
async def get_recommendations(request: RecommendRequest):
    """
    Endpoint to get recommendations.
    Accepts user_id, features, or raw query text.
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        input_data = request.features if request.features is not None else []
        
        recommendations = predict(
            model,
            input_data,
            request.available_perfumes,
            request.tenant_id,
            request.model_name,
            request.query,
            request.top_n,
        )
        
        if isinstance(recommendations, list):
            recommendations = recommendations[:request.top_n]

        return {
            "success": True,
            "user_id": request.user_id,
            "model_name": request.model_name,
            "recommendations": recommendations,
            "count": len(recommendations) if isinstance(recommendations, list) else 1
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
