import io
import os
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import uvicorn

app = FastAPI()

# --- 1. CONFIGURATION & PATHS ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 5 Individual YOLOv8 Models
MODELS = {
    "circular bald patches": os.path.join(BASE_DIR, "circular_bald_patches_model.pt"),
    "hairloss": os.path.join(BASE_DIR, "hairloss_model.pt"),
    "healthy": os.path.join(BASE_DIR, "healthy_model.pt"),
    "redness": os.path.join(BASE_DIR, "redness_model.pt"),
    "scaling": os.path.join(BASE_DIR, "scaling_model.pt")
}

CLASS_NAMES = ["circular bald patches", "hairloss", "healthy", "redness", "scaling"]

DISEASE_CHARACTERISTICS = {
    "circular bald patches": { "min_confidence": 0.51 },
    "hairloss": { "min_confidence": 0.46 },
    "redness": { "min_confidence": 0.48 },
    "scaling": { "min_confidence": 0.47 },
    "healthy": { "min_confidence": 0.56 }
}

SKIN_CLASSIFIER_THRESHOLD = 0.08
MIN_DETECTION_AREA = 0.01

# --- 2. IMAGE PROCESSING HELPERS ---

def skin_classifier(pil_img):
    try:
        small = pil_img.resize((200,200))
        arr = np.array(small).astype('float') / 255.0
        r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
        ratio_rgb = float(((r > 0.36) & (g > 0.28) & (b > 0.20) & (r > g) & (r > b) & ((r - g) > 0.05)).mean())
        ycbcr = np.array(small.convert('YCbCr')).astype('float')
        cb, cr = ycbcr[..., 1], ycbcr[..., 2]
        ratio_ycbcr = float(((cb >= 77) & (cb <= 127) & (cr >= 133) & (cr <= 173)).mean())
        score = 0.45 * ratio_rgb + 0.45 * ratio_ycbcr
        return max(0.0, min(1.0, score))
    except: return 0.0

def load_models():
    try:
        from ultralytics import YOLO
        loaded_models = {}
        for disease, model_path in MODELS.items():
            if os.path.exists(model_path):
                loaded_models[disease] = YOLO(model_path)
                print(f"✓ {disease.upper()} model loaded")
            else:
                loaded_models[disease] = None
        return loaded_models
    except: return {}

yolo_models = load_models()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. PREDICT ENDPOINT ---

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        bytes_data = await file.read()
        img = Image.open(io.BytesIO(bytes_data)).convert("RGB")
        
        # Skin Check
        if skin_classifier(img) < SKIN_CLASSIFIER_THRESHOLD:
            return {"status": "Inconclusive", "message": "Low skin content detected.", "predictions": []}
        
        all_detections = []
        for disease, model in yolo_models.items():
            if model is None: continue
            results = model(img, conf=0.38)
            for result in results:
                for box in result.boxes:
                    confidence = float(box.conf[0])
                    disease_min_conf = DISEASE_CHARACTERISTICS.get(disease, {}).get("min_confidence", 0.38)
                    
                    if confidence >= disease_min_conf:
                        all_detections.append({
                            "label": disease,
                            "confidence": confidence,
                            "percentage": round(confidence * 100, 1)
                        })

        # Merge results
        merged = {}
        for d in all_detections:
            lbl = d["label"]
            if lbl not in merged or d["confidence"] > merged[lbl]["confidence"]:
                merged[lbl] = d

        final_preds = sorted(list(merged.values()), key=lambda x: x['confidence'], reverse=True)
        
        return {
            "status": "Issues Detected" if any(p['label'] != 'healthy' for p in final_preds) else "Healthy",
            "predictions": final_preds
        }

    except Exception as e:
        return {"error": str(e), "status": "error"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "AI Microservice"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)