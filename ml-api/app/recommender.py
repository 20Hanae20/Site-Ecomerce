import joblib
import os
import pandas as pd
import numpy as np

# Path to the model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

def load_model():
    """
    Loads the trained model from the pickle file.
    """
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
    
    try:
        model = joblib.load(MODEL_PATH)
        print("Model loaded successfully.")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        raise

def predict(model, data, available_perfumes=None, tenant_id=None):
    """
    Makes a prediction using the loaded model.
    Rank available_perfumes based on features if provided.
    """
    try:
        # If we have available perfumes and features, let's do a smart ranking
        if available_perfumes and isinstance(data, list):
            # Filter by tenant if provided (each perfume may include a tenant_id)
            if tenant_id is not None:
                available_perfumes = [p for p in available_perfumes if p.get('tenant_id') == tenant_id]

            if not available_perfumes:
                return []
            # Feature indices: 0:floral, 1:woody, 2:oriental, 3:fresh, 4:spicy, 5:fruity, 6:aromatic
            families = ['floral', 'boisé', 'oriental', 'frais', 'épicé', 'fruité', 'aromatique']
            
            # Simple scoring based on matching olfactory family string
            scores = []
            for p in available_perfumes:
                p_family = p.get('olfactory_family', '').lower()
                base_score = float(p.get('rating', 4.0)) * 10 # Base score from rating
                
                # Boost based on feature weights
                boost = 0
                for i, weight in enumerate(data):
                    if weight > 0 and families[i] in p_family:
                        boost += weight * 5
                
                scores.append({
                    "id": p['id'],
                    "final_score": base_score + boost
                })
            
            # Sort by score descending
            scores.sort(key=lambda x: x['final_score'], reverse=True)
            return [s['id'] for s in scores]

        # Standard model prediction fallback
        if isinstance(data, list):
            input_features = np.array(data).reshape(1, -1)
            # Many models aren't ready for direct ID output, so we return 
            # some sensible default IDs if it fails or returns unexpected shapes
            result = model.predict(input_features)
            return result.tolist() if hasattr(result, "tolist") else [1, 2, 3]
            
        return [1, 2, 3] # Ultimate fallback
    except Exception as e:
        print(f"Prediction error: {e}")
        return [p['id'] for p in available_perfumes[:3]] if available_perfumes else [1, 2, 3]
