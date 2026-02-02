#!/usr/bin/env python3
"""
Train K-Means Recommender Model from Scratch
Creates and exports a pre-trained K-Means model for perfume recommendations
"""

import pickle
import sys
import json
import numpy as np
from pathlib import Path
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

def create_training_data():
    """
    Generate synthetic perfume data with olfactory attributes.
    In production, this would load from the database.
    """
    
    # Sample perfume profiles (7 olfactory attributes)
    perfumes = [
        {'id': 1, 'name': 'Rose Garden', 'features': [8, 2, 3, 1, 1, 2, 4]},      # High floral
        {'id': 2, 'name': 'Ocean Breeze', 'features': [1, 2, 1, 9, 2, 1, 3]},      # High fresh
        {'id': 3, 'name': 'Dark Wood', 'features': [2, 9, 7, 1, 3, 1, 2]},        # High woody
        {'id': 4, 'name': 'Spice Market', 'features': [2, 3, 2, 2, 8, 3, 4]},     # High spicy
        {'id': 5, 'name': 'Sweet Vanilla', 'features': [3, 2, 8, 1, 1, 4, 2]},    # High oriental
        {'id': 6, 'name': 'Fruit Paradise', 'features': [1, 1, 2, 3, 1, 9, 1]},   # High fruity
        {'id': 7, 'name': 'Lavender Fields', 'features': [5, 1, 2, 4, 2, 1, 9]},  # High aromatic
        {'id': 8, 'name': 'Rose Vanilla', 'features': [7, 2, 5, 1, 1, 2, 3]},     # Floral + Oriental
        {'id': 9, 'name': 'Fresh Citrus', 'features': [2, 1, 1, 8, 1, 7, 2]},     # Fresh + Fruity
        {'id': 10, 'name': 'Woody Oriental', 'features': [1, 8, 6, 1, 2, 1, 3]},  # Woody + Oriental
        {'id': 11, 'name': 'Floral Spice', 'features': [6, 2, 2, 1, 6, 1, 3]},    # Floral + Spicy
        {'id': 12, 'name': 'Herb Garden', 'features': [3, 2, 1, 5, 4, 2, 8]},     # Aromatic + Herbal
        {'id': 13, 'name': 'Pink Petal', 'features': [9, 1, 2, 2, 1, 3, 2]},      # Pure floral
        {'id': 14, 'name': 'Sandalwood', 'features': [1, 7, 5, 1, 4, 1, 3]},      # Woody + Spicy
        {'id': 15, 'name': 'Tropical Fruit', 'features': [1, 1, 1, 4, 1, 8, 1]},  # Pure fruity
    ]
    
    return perfumes

def train_model(perfumes, n_clusters=5):
    """
    Train K-Means model on perfume data.
    
    Attributes: [floral, woody, oriental, fresh, spicy, fruity, aromatic]
    """
    
    # Extract features
    X = np.array([p['features'] for p in perfumes])
    
    print(f"Training data shape: {X.shape}")
    print(f"Number of perfumes: {len(perfumes)}")
    print(f"Number of clusters: {n_clusters}")
    
    # Standardize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train K-Means
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    kmeans.fit(X_scaled)
    
    # Get cluster assignments
    clusters = kmeans.predict(X_scaled)
    
    # Add cluster info and score to perfumes
    for i, perfume in enumerate(perfumes):
        perfume['cluster'] = int(clusters[i])
        perfume['score'] = 1.0  # Default score
    
    print(f"\n✅ Model trained successfully")
    print(f"   - Cluster distribution: {np.bincount(clusters)}")
    
    return kmeans, scaler, perfumes

def save_model(kmeans, scaler, perfumes, output_path):
    """
    Save model, scaler, and perfume data to pickle file.
    """
    
    model_data = {
        'model': kmeans,
        'scaler': scaler,
        'perfumes': perfumes,
        'metadata': {
            'n_clusters': kmeans.n_clusters,
            'n_samples': len(perfumes),
            'attributes': ['floral', 'woody', 'oriental', 'fresh', 'spicy', 'fruity', 'aromatic']
        }
    }
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'wb') as f:
        pickle.dump(model_data, f)
    
    print(f"\n✅ Model saved to: {output_path}")
    print(f"   - File size: {output_path.stat().st_size / 1024:.2f} KB")
    
    return True

def main():
    """Main training pipeline"""
    print("=" * 60)
    print("K-Means Perfume Recommender Model Training")
    print("=" * 60)
    
    try:
        # Create training data
        print("\n📊 Creating training data...")
        perfumes = create_training_data()
        print(f"✅ Generated {len(perfumes)} synthetic perfume profiles")
        
        # Train model
        print("\n🤖 Training K-Means model...")
        kmeans, scaler, perfumes_with_clusters = train_model(perfumes, n_clusters=5)
        
        # Save model
        print("\n💾 Saving model...")
        model_path = Path(__file__).parent.parent.parent / 'storage' / 'app' / 'perfume_recommender_model.pkl'
        save_model(kmeans, scaler, perfumes_with_clusters, model_path)
        
        print("\n" + "=" * 60)
        print("✅ Training completed successfully!")
        print("=" * 60)
        print("\nModel ready for use at:")
        print(f"  {model_path}")
        print("\nNext step: Run setup_kmeans.py to validate the model")
        
        return 0
    
    except Exception as e:
        print(f"\n❌ Error during training: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    sys.exit(main())
