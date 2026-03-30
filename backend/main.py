import os
os.environ["TF_USE_LEGACY_KERAS"] = "1"

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model_loader import model_loader
from processor import processor
import os

app = FastAPI(title="TB Detection API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model", "fixed_model.keras")

@app.on_event("startup")
async def startup_event():
    # Load model on startup
    try:
        model_loader.load_model(MODEL_PATH)
    except Exception as e:
        print(f"Error loading model: {e}")

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/model-info")
async def model_info():
    return {
        "model": "ResNet50",
        "input_size": "256x256",
        "classes": ["Normal", "Tuberculosis"]
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read image bytes
        img_bytes = await file.read()
        
        # Get model
        model = model_loader.get_model()
        
        # Run pipeline
        result = processor.run_pipeline(img_bytes, model)
        
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
