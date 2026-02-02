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
            
            # Predict cluster for this user
            user_cluster = self.model.predict([user_vector])[0]
            
            # Get all perfume clusters and distances
            if hasattr(self.model, 'labels_') and self.perfume_data:
                # Return perfumes in the same cluster
                recommendations = self._get_same_cluster_perfumes(
                    user_cluster, 
                    n_recommendations
                )
            else:
                recommendations = self._get_nearest_perfumes(
                    user_vector, 
                    n_recommendations
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
    
    def _get_same_cluster_perfumes(self, cluster_id, n_recommendations):
        """Get perfumes in the same cluster as the user"""
        if not self.perfume_data:
            return []
        
        # Filter perfumes by cluster
        cluster_perfumes = [
            p for p in self.perfume_data 
            if p.get('cluster') == cluster_id
        ]
        
        # Sort by relevance score if available
        cluster_perfumes.sort(
            key=lambda x: x.get('score', 0), 
            reverse=True
        )
        
        return cluster_perfumes[:n_recommendations]
    
    def _get_nearest_perfumes(self, user_vector, n_recommendations):
        """Get perfumes nearest to user in feature space"""
        if not self.perfume_data:
            return []
        
        # Calculate distances to all perfumes
        perfume_vectors = np.array([
            p.get('features', []) for p in self.perfume_data
        ])
        
        distances = np.linalg.norm(
            perfume_vectors - user_vector, 
            axis=1
        )
        
        # Get indices of nearest perfumes
        nearest_indices = np.argsort(distances)[:n_recommendations]
        
        recommendations = [
            self.perfume_data[i] for i in nearest_indices
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
