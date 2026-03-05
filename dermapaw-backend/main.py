import io
import os
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import uvicorn

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "online", "message": "DermaPaw ML Backend is running!"}

# --- 1. CONFIGURATION & PATHS ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 5 Individual YOLOv8 Models (one for each disease)
MODELS = {
    "circular bald patches": os.path.join(BASE_DIR, "circular_bald_patches_model.pt"),
    "hairloss": os.path.join(BASE_DIR, "hairloss_model.pt"),
    "healthy": os.path.join(BASE_DIR, "healthy_model.pt"),
    "redness": os.path.join(BASE_DIR, "redness_model.pt"),
    "scaling": os.path.join(BASE_DIR, "scaling_model.pt")
}

CLASS_NAMES = ["circular bald patches", "hairloss", "healthy", "redness", "scaling"]

# Disease characteristics for validation (High thresholds for accuracy)
DISEASE_CHARACTERISTICS = {
    "circular bald patches": {
        "min_confidence": 0.45,
        "description": "Circular or oval shaped hair loss areas",
        "appearance": "Well-defined circular bald spots on skin"
    },
    "hairloss": {
        "min_confidence": 0.45,
        "description": "General hair loss or thinning",
        "appearance": "Diffuse or patchy hair loss across area"
    },
    "redness": {
        "min_confidence": 0.45,
        "description": "Reddish or inflamed skin",
        "appearance": "Visible redness or inflammation"
    },
    "scaling": {
        "min_confidence": 0.45,
        "description": "Scaly or flaky skin",
        "appearance": "Visible scaling or flaking on skin surface"
    },
    "healthy": {
        "min_confidence": 0.50,
        "description": "Healthy skin with no abnormalities",
        "appearance": "Clear, smooth, normal skin"
    }
}

def load_models():
    """Load all 5 individual YOLOv8 models"""
    try:
        from ultralytics import YOLO
        loaded_models = {}
        
        for disease, model_path in MODELS.items():
            try:
                if os.path.exists(model_path):
                    model = YOLO(model_path)
                    loaded_models[disease] = model
                    print(f"✓ {disease.upper()} model loaded: {model_path}")
                else:
                    print(f"⚠ {disease.upper()} model not found: {model_path}")
                    loaded_models[disease] = None
            except Exception as e:
                print(f"❌ Error loading {disease} model: {e}")
                loaded_models[disease] = None
        
        return loaded_models
    except Exception as e:
        print(f"❌ Error: Could not load models: {e}")
        return {disease: None for disease in MODELS.keys()}

yolo_models = load_models()

# --- VALIDATION LOGIC ---

def validate_detection(label, confidence, detection_count):
    """
    Validate detection with if-else logic based on disease characteristics
    """
    if label not in DISEASE_CHARACTERISTICS:
        return False, "Unknown disease class"
    
    disease_info = DISEASE_CHARACTERISTICS[label]
    min_confidence = disease_info["min_confidence"]
    
    # Rule 1: Check minimum confidence threshold
    if confidence < min_confidence:
        return False, f"Confidence {confidence*100:.1f}% below minimum {min_confidence*100:.1f}%"
    
    # Rule 2: Healthy requires consistent detections
    if label == "healthy":
        if detection_count < 1:
            return False, f"Healthy requires at least 1 detection (found {detection_count})"
    
    # Rule 3: Disease detection
    elif label != "healthy":
        if confidence < 0.45:
            return False, f"Disease confidence too low: {confidence*100:.1f}%"
    
    # All validation passed
    return True, "PASSED"

def calculate_confidence_boost(label, detection_count, original_confidence):
    """
    Calculate confidence boost based on detection count
    """
    boost = 0.0
    
    # Boost 1: Multiple detections increase confidence
    if detection_count >= 1:
        boost += 0.04
    if detection_count >= 2:
        boost += 0.08
    if detection_count >= 3:
        boost += 0.08
    
    # Boost 2: Disease-specific boosts
    if label == "circular bald patches" and detection_count >= 1:
        boost += 0.08
    
    if label == "hairloss" and detection_count >= 1:
        boost += 0.07
    
    if label == "redness" and detection_count >= 1:
        boost += 0.07
    
    if label == "scaling" and detection_count >= 1:
        boost += 0.07
    
    # Apply boost but cap at max confidence
    boosted_confidence = min(original_confidence + boost, 0.99)
    
    return boosted_confidence

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. PROCESSING LOGIC ---

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        bytes_data = await file.read()
        img = Image.open(io.BytesIO(bytes_data)).convert("RGB")
        
        print("\n" + "="*60)
        print("🐾 DERMAPAW 5-MODEL DETECTION PIPELINE")
        print("="*60)
        
        all_detections = []
        
        # --- STAGE 1: RUN ALL 5 MODELS ---
        print("\n[STAGE 1] Running 5 Individual Disease Models")
        print("-" * 60)
        
        models_available = sum(1 for m in yolo_models.values() if m is not None)
        print(f"Available models: {models_available}/5\n")
        
        for disease, model in yolo_models.items():
            print(f"[MODEL] {disease.upper()}")
            
            if model is None:
                print(f"  ⚠ Model not loaded, skipping...")
                continue
            
            try:
                # ← Run individual model on image with updated base threshold
                results = model(img, conf=0.45)
                
                for result in results:
                    # REMOVED: Mask/Polygon extraction logic

                    for i, box in enumerate(result.boxes):
                        confidence = float(box.conf[0])

                        # REMOVED: BBox extraction logic
                        
                        confidence_bar = "█" * int(confidence * 20)
                        print(f"  Detection: {confidence*100:6.2f}% {confidence_bar}")
                        
                        # ← Accept detection if confidence passes threshold
                        if confidence > 0.45:
                            all_detections.append({
                                "label": disease,
                                "confidence": confidence,
                                "percentage": round(confidence * 100, 1),
                                "source": f"{disease}-model",
                                "rank": i+1,
                                # REMOVED: "bbox" and "polygon" fields
                            })
                            print(f"  ✓ ACCEPTED (Confidence >= 45%)")
                        else:
                            print(f"  ⚠ REJECTED (Confidence < 45%)")
                
                if len(results[0].boxes) == 0:
                    print(f"  ℹ No detection")
                    
            except Exception as e:
                print(f"  ❌ Error: {e}")

        print("\n" + "="*60)
        print("STAGE 2: MERGING DETECTIONS FROM ALL MODELS")
        print("="*60)
        merged_detections = {}
        
        for detection in all_detections:
            label = detection["label"].lower()
            
            if label not in merged_detections:
                merged_detections[label] = {
                    "label": label,
                    "confidence": detection["confidence"],
                    "percentage": detection["percentage"],
                    "detection_count": 1,
                    # REMOVED: lists for boxes/polygons
                    "scan_sources": [detection["source"]],
                }
            else:
                existing = merged_detections[label]
                existing["detection_count"] += 1
                existing["scan_sources"].append(detection["source"])
                existing["confidence"] = (existing["confidence"] + detection["confidence"]) / 2
                existing["percentage"] = round(existing["confidence"] * 100, 1)
        
        print(f"\nTotal detections: {len(all_detections)}")
        print(f"Unique conditions found: {len(merged_detections)}")
        
        # Display merged detections
        for label, data in merged_detections.items():
            print(f"\n{label.upper()}:")
            print(f"  Times detected: {data['detection_count']}")
            print(f"  Average confidence: {data['percentage']}%")
        
        # --- STAGE 3: VALIDATION ---
        print("\n" + "="*60)
        print("STAGE 3: VALIDATION & CONFIDENCE SCORING")
        print("="*60)
        
        validated_detections = {}
        
        for label, data in merged_detections.items():
            
            # --- VALIDATION IF-ELSE LOGIC ---
            is_valid, validation_msg = validate_detection(
                label, 
                data["confidence"], 
                data["detection_count"]
            )
            
            print(f"\n{label.upper()}:")
            print(f"  Confidence: {data['percentage']}%")
            print(f"  Times detected: {data['detection_count']}")
            
            if is_valid:
                # --- CONFIDENCE BOOST LOGIC ---
                boosted_confidence = calculate_confidence_boost(
                    label,
                    data["detection_count"],
                    data["confidence"]
                )
                
                # Set reliability
                if data["detection_count"] >= 2:
                    data["reliability"] = "HIGH"
                else:
                    data["reliability"] = "MEDIUM"
                
                data["confidence"] = boosted_confidence
                data["percentage"] = round(boosted_confidence * 100, 1)
                data["is_valid"] = True
                data["validation_status"] = validation_msg
                
                # Add to validated detections
                validated_detections[label] = data
                
                print(f"  ✓ VALIDATED: {validation_msg}")
                print(f"  Boosted Confidence: {data['percentage']}%")
                print(f"  Reliability: {data['reliability']}")
            else:
                print(f"  ✗ REJECTED: {validation_msg}")
        
        # --- FINAL DECISION LOGIC ---
        print("\n" + "="*60)
        print("STAGE 4: FINAL DECISION LOGIC")
        print("="*60)
        
        # Check if any disease is detected
        disease_detections = {
            k: v for k, v in validated_detections.items() 
            if k != "healthy"
        }
        
        print(f"\nDisease detections: {len(disease_detections)}")
        print(f"Validated detections total: {len(validated_detections)}")
        
        if disease_detections:
            # DISEASE DETECTED: Return all diseases sorted by confidence
            print("\n✓ SKIN CONDITION DETECTED")
            
            final_predictions = list(disease_detections.values())
            
            # Sort by confidence (highest first)
            final_predictions = sorted(
                final_predictions,
                key=lambda x: x['confidence'],
                reverse=True
            )
            
            for i, pred in enumerate(final_predictions, 1):
                print(f"\n[{i}] {pred['label'].upper()}")
                print(f"    Confidence: {pred['percentage']}%")
                print(f"    Reliability: {pred['reliability']}")
            
            return {
                "status": "Issues Detected",
                "predictions": final_predictions,
                "total_detections": len(all_detections),
                "valid_detections": len(validated_detections),
                "models_used": models_available,
                "model": "5-Model Pipeline"
            }
        
        # NO DISEASES: Check if healthy was ACTIVELY DETECTED
        elif "healthy" in validated_detections:
            # Only show healthy if it was ACTIVELY DETECTED and VALIDATED
            healthy_data = validated_detections["healthy"].copy()
            
            print("\n✓ HEALTHY SKIN CONFIRMED")
            
            return {
                "status": "No skin diseases found",
                "predictions": [healthy_data],
                "total_detections": len(all_detections),
                "valid_detections": 1,
                "models_used": models_available,
                "model": "5-Model Pipeline"
            }
        
        else:
            # --- MODIFIED: NO PET DETECTED STATUS ---
            # If we are here, we found NO valid diseases and NO healthy skin.
            print("\n⚠ NO DOG SKIN DETECTED")
            print("No recognizable skin features found.")
            
            return {
                "status": "No Pet Detected",
                "message": "We could not identify dog skin in this image. Please try again with a clear, close-up photo.",
                "predictions": [],
                "total_detections": len(all_detections),
                "valid_detections": len(validated_detections),
                "models_used": models_available,
                "model": "5-Model Pipeline"
            }

    except Exception as e:
        print(f"\n❌ SERVER ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e), "status": "error"}

# --- 4. HEALTH CHECK ENDPOINT ---
@app.get("/health")
async def health_check():
    models_status = {
        disease: "✓" if model else "✗"
        for disease, model in yolo_models.items()
    }
    
    return {
        "status": "ok",
        "models_loaded": models_status,
        "total_models": f"{sum(1 for m in yolo_models.values() if m)}/5",
        "model_type": "5-Model Pipeline (Individual YOLOv8 per disease)",
        "class_names": CLASS_NAMES,
        "validation_rules": "ENABLED",
        "sensitivity": "OPTIMIZED"
    }

# --- 5. SERVER STARTUP ---
if __name__ == "__main__":
    print("\n" + "="*60)
    print("🐾 DermaPaw 5-MODEL BACKEND Server Starting...")
    print("="*60)
    print("\nModel Paths:")
    for disease, path in MODELS.items():
        status = "✓" if os.path.exists(path) else "✗"
        print(f"  [{status}] {disease.upper():25} {path}")
    
    print(f"\nClasses: {', '.join(CLASS_NAMES)}")
    print("\nConfiguration:")
    print("  ✓ 5 Individual YOLOv8 Models")
    print("  ✓ One model per disease")
    print("  ✓ Parallel detection pipeline")
    print("  ✓ Multi-stage validation")
    
    print("\nSensitivity Mode: OPTIMIZED")
    print("  • Each model specialized for one disease")
    print("  • Conservative confidence thresholds (45%-65%)")
    print("  • Fast parallel detection (No Annotations)")
    print("  • Returns ALL detected diseases sorted by confidence")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8082)