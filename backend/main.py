import os
os.environ["TF_USE_LEGACY_KERAS"] = "1"

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from model_loader import model_loader
from processor import processor
import os
import json

app = FastAPI(title="TB Detection API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static directory for dynamic images
static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Configuration
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model", "OGbest_model.keras")

@app.on_event("startup")
async def startup_event():
    # Load model on startup
    try:
        model_loader.load_model(MODEL_PATH)
    except Exception as e:
        print(f"Error loading model: {e}")

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

@app.post("/explain")
async def explain(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        img_bytes = await file.read()
        model = model_loader.get_model()
        
        result = processor.generate_shap_explanation(img_bytes, model)
        return {"shap_image": result}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/evaluate")
async def evaluate():
    """Get model evaluation metrics. Runs once and caches results."""
    results_path = os.path.join(os.path.dirname(__file__), "evaluation_results.json")
    
    if not os.path.exists(results_path):
        return JSONResponse(
            status_code=404,
            content={
                "error": "Evaluation results not found",
                "message": "Please run evaluation.py in Kaggle to generate evaluation_results.json",
                "instructions": [
                    "1. Copy evaluation.py to your Kaggle notebook",
                    "2. Ensure OGbest_model.keras is in /kaggle/working/",
                    "3. Run the evaluation script",
                    "4. Download evaluation_results.json",
                    "5. Place it in the backend folder"
                ]
            }
        )
    
    try:
        with open(results_path, 'r') as f:
            results = json.load(f)
        return results
    except json.JSONDecodeError:
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to parse evaluation results"}
        )

@app.get("/model-info")
async def model_info():
    return {
        "model": "ResNet50",
        "input_size": "256x256",
        "classes": ["Normal", "Tuberculosis"]
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Mount built frontend dist (for production)
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend-dist")
if os.path.exists(frontend_dist):
    # This must be at the end of the file so it doesn't catch the /api routes
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
    
    # Catch-all route to serve index.html for SPA (React Router support)
    from fastapi.responses import FileResponse
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
