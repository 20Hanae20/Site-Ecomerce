#!/usr/bin/env python3
"""
K-Means Perfume Recommender Service
Loads the pre-trained K-Means model and provides recommendations
"""

import pickle
import sys
import json
import numpy as np
from pathlib import Path

class KMeansRecommender:
    def __init__(self, model_path):
        """Initialize the recommender with a pre-trained K-Means model"""
        self.model_path = model_path
        self.model = None
        self.scaler = None
        self.perfume_data = None
        # Cache tenant-specific models: {tenant_id: {'model':..., 'scaler':..., 'perfumes':...}}
        self.tenant_models = {}
        self.load_model()
    
    def load_model(self):
        """Load the pickled K-Means model"""
        try:
            with open(self.model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            # Handle both formats: direct model or dict with model + metadata
            if isinstance(model_data, dict):
                self.model = model_data.get('model')
                self.scaler = model_data.get('scaler')
                self.perfume_data = model_data.get('perfumes')
            else:
                self.model = model_data
            
            if self.model is None:
                raise ValueError("Could not load K-Means model from pickle file")
                
        except FileNotFoundError:
            raise FileNotFoundError(f"Model file not found: {self.model_path}")
        except Exception as e:
            raise Exception(f"Error loading model: {str(e)}")
    
    def get_recommendations(self, user_data, n_recommendations=3):
        """
        Get perfume recommendations for a user
        
        Args:
            user_data: dict with user olfactory profile or purchase history
            n_recommendations: number of recommendations to return
        
        Returns:
            list of recommended perfume IDs with scores
        """
        try:
            # Convert user data to feature vector
            user_vector = self._prepare_user_vector(user_data)
            
            # If a tenant-specific model was attached to user_data, use it
            tenant_id = user_data.get('tenant_id') if isinstance(user_data, dict) else None
            model_context = None
            if tenant_id is not None:
                model_context = self._get_tenant_model(tenant_id)

            model_to_use = model_context.get('model') if model_context else self.model
            perfume_data = model_context.get('perfumes') if model_context and model_context.get('perfumes') is not None else self.perfume_data

            # Predict cluster for this user using selected model
            user_cluster = model_to_use.predict([user_vector])[0]
            
            # Get all perfume clusters and distances
            if hasattr(model_to_use, 'labels_') and perfume_data:
                # Return perfumes in the same cluster
                recommendations = self._get_same_cluster_perfumes(
                    user_cluster, 
                    n_recommendations,
                    perfumes=perfume_data
                )
            else:
                recommendations = self._get_nearest_perfumes(
                    user_vector, 
                    n_recommendations,
                    perfumes=perfume_data
                )
            
            return {
                'user_cluster': int(user_cluster),
                'recommendations': recommendations
            }
        
        except Exception as e:
            return {
                'error': str(e),
                'recommendations': []
            }
    
    def _prepare_user_vector(self, user_data):
        """Convert user data to numerical feature vector"""
        # Expected user_data format with olfactory profiles
        features = [
            user_data.get('floral', 0),
            user_data.get('woody', 0),
            user_data.get('oriental', 0),
            user_data.get('fresh', 0),
            user_data.get('spicy', 0),
            user_data.get('fruity', 0),
            user_data.get('aromatic', 0),
        ]
        
        user_vector = np.array(features).reshape(1, -1)
        
        # Apply scaling if available
        if self.scaler:
            user_vector = self.scaler.transform(user_vector)
        
        return user_vector[0]

    def _get_tenant_model(self, tenant_id: int):
        """Load or return cached tenant-specific model and data.

        Expects tenant models to be stored under storage/app/tenants/{tenant_id}/kmeans_model.pkl
        and a perfumes.json with tenant perfume data. Falls back to global model.
        """
        if tenant_id in self.tenant_models:
            return self.tenant_models[tenant_id]

        tenant_dir = Path(__file__).parent.parent.parent / 'storage' / 'app' / 'tenants' / str(tenant_id)
        model_path = tenant_dir / 'kmeans_model.pkl'
        perfumes_path = tenant_dir / 'perfumes.json'

        if model_path.exists():
            try:
                with open(model_path, 'rb') as f:
                    model_data = pickle.load(f)

                model = model_data.get('model') if isinstance(model_data, dict) else model_data
                scaler = model_data.get('scaler') if isinstance(model_data, dict) else None
                perfumes = None
                if perfumes_path.exists():
                    import json as _json
                    with open(perfumes_path, 'r', encoding='utf-8') as pf:
                        perfumes = _json.load(pf)

                ctx = {
                    'model': model,
                    'scaler': scaler,
                    'perfumes': perfumes
                }
                self.tenant_models[tenant_id] = ctx
                return ctx
            except Exception:
                pass

        return None
    
    def _get_same_cluster_perfumes(self, cluster_id, n_recommendations, perfumes=None):
        """Get perfumes in the same cluster as the user"""
        perfumes = perfumes if perfumes is not None else self.perfume_data
        if not perfumes:
            return []
        
        # Filter perfumes by cluster
        cluster_perfumes = [
            p for p in perfumes 
            if p.get('cluster') == cluster_id
        ]
        
        # Sort by relevance score if available
        cluster_perfumes.sort(
            key=lambda x: x.get('score', 0), 
            reverse=True
        )
        
        return cluster_perfumes[:n_recommendations]
    
    def _get_nearest_perfumes(self, user_vector, n_recommendations, perfumes=None):
        """Get perfumes nearest to user in feature space"""
        perfumes = perfumes if perfumes is not None else self.perfume_data
        if not perfumes:
            return []
        
        # Calculate distances to all perfumes
        perfume_vectors = np.array([
            p.get('features', []) for p in perfumes
        ])
        
        distances = np.linalg.norm(
            perfume_vectors - user_vector, 
            axis=1
        )
        
        # Get indices of nearest perfumes
        nearest_indices = np.argsort(distances)[:n_recommendations]
        
        recommendations = [
            perfumes[i] for i in nearest_indices
        ]
        
        return recommendations


def main():
    """CLI interface for the recommender"""
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Missing user data argument'}))
        sys.exit(1)
    
    try:
        # Get model path
        model_path = Path(__file__).parent.parent.parent / 'storage' / 'app' / 'perfume_recommender_model.pkl'
        
        # Parse user data
        user_data = json.loads(sys.argv[1])
        
        # Initialize recommender
        recommender = KMeansRecommender(str(model_path))
        
        # Get recommendations
        result = recommender.get_recommendations(user_data)
        
        print(json.dumps(result))
    
    except json.JSONDecodeError:
        print(json.dumps({'error': 'Invalid JSON in user data'}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)


if __name__ == '__main__':
    main()
