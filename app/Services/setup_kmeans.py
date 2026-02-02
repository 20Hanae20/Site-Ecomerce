#!/usr/bin/env python3
"""
Setup script for K-Means Recommender Service
Installs dependencies and validates the model
"""

import subprocess
import sys
from pathlib import Path

def check_python_version():
    """Ensure Python 3.7+"""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7+ required")
        sys.exit(1)
    print(f"✅ Python version: {sys.version.split()[0]}")

def install_dependencies():
    """Install required Python packages"""
    print("\n📦 Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
        subprocess.check_call([sys.executable, "-m", "pip", "install", "scikit-learn", "numpy"])
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        sys.exit(1)

def validate_model():
    """Check if model file exists and is readable"""
    print("\n🔍 Validating model file...")
    
    model_path = Path(__file__).parent.parent.parent / 'storage' / 'app' / 'perfume_recommender_model.pkl'
    
    if not model_path.exists():
        print(f"❌ Model file not found: {model_path}")
        return False
    
    try:
        import pickle
        with open(model_path, 'rb') as f:
            data = pickle.load(f)
        print(f"✅ Model file valid: {model_path}")
        
        if isinstance(data, dict):
            print(f"   - Contains: {list(data.keys())}")
        
        return True
    except Exception as e:
        print(f"❌ Error reading model file: {e}")
        return False

def test_recommender():
    """Test the recommender with sample data"""
    print("\n🧪 Testing recommender service...")
    
    try:
        from kmeans_recommender import KMeansRecommender
        
        model_path = Path(__file__).parent.parent.parent / 'storage' / 'app' / 'perfume_recommender_model.pkl'
        recommender = KMeansRecommender(str(model_path))
        
        # Test with sample profile
        test_profile = {
            'floral': 5,
            'woody': 3,
            'oriental': 4,
            'fresh': 2,
            'spicy': 1,
            'fruity': 0,
            'aromatic': 2
        }
        
        result = recommender.get_recommendations(test_profile)
        print("✅ Recommender test successful")
        print(f"   - User cluster: {result.get('user_cluster')}")
        print(f"   - Recommendations: {len(result.get('recommendations', []))} items")
        
        return True
    
    except Exception as e:
        print(f"⚠️  Recommender test failed: {e}")
        return False

def main():
    """Run all setup steps"""
    print("=" * 50)
    print("K-Means Recommender Setup")
    print("=" * 50)
    
    check_python_version()
    install_dependencies()
    
    model_valid = validate_model()
    if not model_valid:
        print("\n⚠️  Setup incomplete - model file is missing")
        sys.exit(1)
    
    test_recommender()
    
    print("\n" + "=" * 50)
    print("✅ Setup completed successfully!")
    print("=" * 50)
    print("\nYou can now use the recommender service from Laravel:")
    print("  POST /api/recommendations")
    print("\nFor more details, see: KMEANS_INTEGRATION.md")

if __name__ == '__main__':
    main()
