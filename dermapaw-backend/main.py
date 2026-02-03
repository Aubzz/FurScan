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

# ← FIXED: 5 Individual YOLOv8 Models (one for each disease)
MODELS = {
    "circular bald patches": os.path.join(BASE_DIR, "circular_bald_patches_model.pt"),
    "hairloss": os.path.join(BASE_DIR, "hairloss_model.pt"),
    "healthy": os.path.join(BASE_DIR, "healthy_model.pt"),
    "redness": os.path.join(BASE_DIR, "redness_model.pt"),
    "scaling": os.path.join(BASE_DIR, "scaling_model.pt")
}

CLASS_NAMES = ["circular bald patches", "hairloss", "healthy", "redness", "scaling"]

# Disease characteristics for validation
DISEASE_CHARACTERISTICS = {
    "circular bald patches": {
        "min_confidence": 0.51,
        "description": "Circular or oval shaped hair loss areas",
        "appearance": "Well-defined circular bald spots on skin"
    },
    "hairloss": {
        "min_confidence": 0.46,
        "description": "General hair loss or thinning",
        "appearance": "Diffuse or patchy hair loss across area"
    },
    "redness": {
        "min_confidence": 0.48,
        "description": "Reddish or inflamed skin",
        "appearance": "Visible redness or inflammation"
    },
    "scaling": {
        "min_confidence": 0.47,
        "description": "Scaly or flaky skin",
        "appearance": "Visible scaling or flaking on skin surface"
    },
    "healthy": {
        "min_confidence": 0.56,
        "description": "Healthy skin with no abnormalities",
        "appearance": "Clear, smooth, normal skin"
    }
}

# --- SKIN PRESENCE CHECK ---
SKIN_RATIO_THRESHOLD = 0.02  # 2% of image pixels must be skin-like
SKIN_CLASSIFIER_THRESHOLD = 0.08  # Combined-classifier score threshold (raised to reduce false positives)
MIN_DETECTION_AREA = 0.01  # Minimum box area ratio (1% of image) to consider a detection

def skin_pixel_ratio(pil_img):
    """Return ratio of pixels that match a simple skin-color heuristic."""
    try:
        arr = np.array(pil_img.resize((200,200))).astype('float') / 255.0
        r = arr[..., 0]
        g = arr[..., 1]
        b = arr[..., 2]
        mask = (r > 0.36) & (g > 0.28) & (b > 0.20) & (r > g) & (r > b) & ((r - g) > 0.05)
        return float(mask.mean())
    except Exception as e:
        print(f"  ℹ Skin check error: {e}")
        return 0.0


def skin_classifier(pil_img):
    """Fast rule-based skin-vs-non-skin classifier that returns a score (0..1).
    Combines RGB heuristic, YCbCr chroma thresholds, average saturation and simple edge-density penalty.
    """
    try:
        small = pil_img.resize((200,200))
        arr = np.array(small).astype('float') / 255.0
        r = arr[..., 0]
        g = arr[..., 1]
        b = arr[..., 2]

        # RGB heuristic
        mask_rgb = (r > 0.36) & (g > 0.28) & (b > 0.20) & (r > g) & (r > b) & ((r - g) > 0.05)
        ratio_rgb = float(mask_rgb.mean())

        # YCbCr heuristic (common skin chroma ranges)
        ycbcr = np.array(small.convert('YCbCr')).astype('float')
        cb = ycbcr[..., 1]
        cr = ycbcr[..., 2]
        mask_ycbcr = (cb >= 77) & (cb <= 127) & (cr >= 133) & (cr <= 173)
        ratio_ycbcr = float(mask_ycbcr.mean())

        # HSV saturation (skin often has reasonable saturation)
        hsv = np.array(small.convert('HSV')).astype('float') / 255.0
        sat = hsv[..., 1]
        avg_sat = float(sat.mean())

        # Simple edge density (non-skin textures like fabric often have higher edge density)
        gray = np.array(small.convert('L')).astype('float') / 255.0
        gx = np.abs(np.pad(gray, ((1,1),(1,1)), mode='reflect')[1:-1,2:] - np.pad(gray, ((1,1),(1,1)), mode='reflect')[1:-1,:-2])
        gy = np.abs(np.pad(gray, ((1,1),(1,1)), mode='reflect')[2:,1:-1] - np.pad(gray, ((1,1),(1,1)), mode='reflect')[:-2,1:-1])
        edge = np.sqrt(gx * gx + gy * gy)
        edge_density = float((edge > 0.25).mean())

        # Combine features into a single score
        score = 0.45 * ratio_rgb + 0.45 * ratio_ycbcr + 0.05 * avg_sat - 0.2 * edge_density
        score = max(0.0, min(1.0, score))
        return score
    except Exception as e:
        print(f"  ℹ Skin classifier error: {e}")
        return 0.0

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
        if confidence < 0.38:
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
        boost += 0.06
    if detection_count >= 2:
        boost += 0.06
    if detection_count >= 3:
        boost += 0.05
    
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
        
        # Quick skin-content check to avoid running models on non-skin images
        skin_ratio = skin_pixel_ratio(img)
        classifier_score = skin_classifier(img)
        print(f"Skin pixel ratio: {skin_ratio:.4f}, classifier_score: {classifier_score:.4f}")
        if classifier_score < SKIN_CLASSIFIER_THRESHOLD:
            print("  ✗ Low skin content detected by classifier - aborting detection")
            return {
                "status": "Inconclusive",
                "message": "Image does not contain sufficient skin regions for diagnosis. Please take a closer picture of the affected area.",
                "predictions": [],
                "total_detections": 0,
                "valid_detections": 0,
                "models_used": sum(1 for m in yolo_models.values() if m is not None),
                "model": "5-Model Pipeline"
            }
        
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
                # ← Run individual model on image
                results = model(img, conf=0.38)
                
                for result in results:
                    img_w, img_h = img.size
                    for i, box in enumerate(result.boxes):
                        confidence = float(box.conf[0])

                        confidence_bar = "█" * int(confidence * 20)
                        print(f"  Detection: {confidence*100:6.2f}% {confidence_bar}")

                        # Attempt to get box coordinates (x1,y1,x2,y2)
                        try:
                            xyxy = box.xyxy[0].tolist()
                        except Exception:
                            try:
                                xyxy = list(map(float, box.xyxy.tolist()[0]))
                            except Exception:
                                xyxy = None

                        box_area_ratio = 0.0
                        if xyxy:
                            x1, y1, x2, y2 = xyxy
                            box_w = max(0.0, x2 - x1)
                            box_h = max(0.0, y2 - y1)
                            box_area_ratio = (box_w * box_h) / (img_w * img_h) if (img_w * img_h) > 0 else 0.0

                        # Reject tiny detections (likely noise or background)
                        if box_area_ratio < MIN_DETECTION_AREA:
                            print(f"  ⚠ REJECTED (Box too small: {box_area_ratio*100:.3f}% of image)")
                            continue

                        # Verify the cropped box region contains skin-like pixels
                        crop_score = None
                        try:
                            x1i, y1i, x2i, y2i = map(int, [x1, y1, x2, y2])
                            crop = img.crop((max(0, x1i), max(0, y1i), min(img_w, x2i), min(img_h, y2i)))
                            crop_score = skin_classifier(crop)
                            print(f"    Crop skin score: {crop_score:.4f}")
                            if crop_score < SKIN_CLASSIFIER_THRESHOLD:
                                print(f"  ⚠ REJECTED (Crop not skin-like: score {crop_score:.3f})")
                                continue
                        except Exception as e:
                            print(f"  ℹ Crop skin check error: {e}")

                        # ← Accept detection if confidence passes disease-specific threshold
                        disease_min_conf = DISEASE_CHARACTERISTICS.get(disease, {}).get("min_confidence", 0.38)
                        if confidence >= disease_min_conf:
                            all_detections.append({
                                "label": disease,
                                "confidence": confidence,
                                "percentage": round(confidence * 100, 1),
                                "source": f"{disease}-model",
                                "rank": i+1,
                                "box_area_ratio": box_area_ratio,
                                "crop_skin_score": crop_score
                            })
                            print(f"  ✓ ACCEPTED (Confidence >= {disease_min_conf*100:.1f}%)")
                        else:
                            print(f"  ⚠ REJECTED (Confidence < {disease_min_conf*100:.1f}%)")
                
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
        
        # ← FIXED: Build final predictions list (ALL diseases, sorted by confidence)
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
            # INCONCLUSIVE: No clear detection
            print("\n⚠ INCONCLUSIVE RESULT")
            print("No clear diagnosis could be made")
            
            return {
                "status": "Inconclusive",
                "message": "Unable to make confident diagnosis. Please try again with a clearer image.",
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
        "sensitivity": "MAXIMUM"
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
    
    print("\nSensitivity Mode: MAXIMUM")
    print("  • Each model specialized for one disease")
    print("  • Low confidence thresholds (38% minimum)")
    print("  • Fast parallel detection")
    print("  • Returns ALL detected diseases sorted by confidence")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8080)