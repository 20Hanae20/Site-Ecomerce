import joblib
import os
import pandas as pd
import numpy as np

# Base model path
BASE_DIR = os.path.dirname(__file__)
MODEL_FOLDER = BASE_DIR

# File names for all known serialized ML assets
MODEL_FILES = {
    'global': 'model.pkl',
    'kmeans_segmentation': 'kmeans_segmentation_model.pkl',
    'perfume_nn': 'perfume_model.pkl',
    'perfume_embeddings': 'perfume_embeddings.pkl',
    'svd_optimized': 'svd_optimized_model.pkl',
    'tfidf_vectorizer': 'tfidf_vectorizer.pkl',
}

# Cache for tenant-specific models
TENANT_MODELS = {}


def _load_pickle(path):
    try:
        return joblib.load(path)
    except Exception as exc:
        print(f"Failed to load pickle at {path}: {exc}")
        return None


def load_models():
    """Load all available ML assets from the model directory."""
    models = {}
    for name, filename in MODEL_FILES.items():
        path = os.path.join(MODEL_FOLDER, filename)
        if os.path.exists(path):
            models[name] = _load_pickle(path)
            if models[name] is not None:
                print(f"Loaded ML asset: {filename} as '{name}'")
        else:
            print(f"ML asset not found: {filename}")
    return models


MODELS = load_models()


def available_models():
    return [name for name, value in MODELS.items() if value is not None]


def load_model():
    """Return the primary global model, or the first available fallback."""
    if 'global' in MODELS and MODELS['global'] is not None:
        return MODELS['global']
    for value in MODELS.values():
        if value is not None:
            return value
    return None


def _load_tenant_model(tenant_id):
    """Try to load a tenant-specific model from storage/app/tenants/{tenant_id}/model.pkl."""
    if tenant_id in TENANT_MODELS:
        return TENANT_MODELS[tenant_id]

    tenant_dir = os.path.join(os.path.dirname(BASE_DIR), 'storage', 'app', 'tenants', str(tenant_id))
    tenant_model_path = os.path.join(tenant_dir, 'model.pkl')
    tenant_perfumes_path = os.path.join(tenant_dir, 'perfumes.json')

    if os.path.exists(tenant_model_path):
        try:
            model_data = joblib.load(tenant_model_path)
            model = model_data.get('model') if isinstance(model_data, dict) else model_data
            perfumes = None
            if os.path.exists(tenant_perfumes_path):
                import json as _json
                with open(tenant_perfumes_path, 'r', encoding='utf-8') as pf:
                    perfumes = _json.load(pf)

            ctx = {
                'model': model,
                'perfumes': perfumes
            }
            TENANT_MODELS[tenant_id] = ctx
            return ctx
        except Exception as e:
            print(f"Failed to load tenant model for {tenant_id}: {e}")
            return None

    return None


def _rank_with_simple_scoring(available_perfumes, data, tenant_id=None):
    if tenant_id is not None:
        available_perfumes = [p for p in available_perfumes if p.get('tenant_id') == tenant_id]
    if not available_perfumes:
        return []

    families = ['floral', 'boisé', 'oriental', 'frais', 'épicé', 'fruité', 'aromatique']
    scores = []
    for p in available_perfumes:
        p_family = p.get('olfactory_family', '').lower()
        base_score = float(p.get('rating', 4.0)) * 10
        boost = 0
        for i, weight in enumerate(data):
            if i < len(families) and weight > 0 and families[i] in p_family:
                boost += weight * 5
        scores.append({
            'id': p['id'],
            'final_score': base_score + boost,
        })
    scores.sort(key=lambda x: x['final_score'], reverse=True)
    return [s['id'] for s in scores]


def _rank_with_perfume_nn(available_perfumes, data, top_n=5):
    perfume_model = MODELS.get('perfume_nn')
    embeddings = MODELS.get('perfume_embeddings')
    if perfume_model is None or embeddings is None or not hasattr(perfume_model, 'kneighbors'):
        return None

    if len(available_perfumes) != embeddings.shape[0]:
        print('Perfume embeddings length mismatch, fallback to simple scoring')
        return None

    try:
        query_vector = np.array(data).reshape(1, -1)
        distances, indices = perfume_model.kneighbors(query_vector, n_neighbors=min(top_n, len(available_perfumes)))
        return [available_perfumes[int(i)]['id'] for i in indices[0] if int(i) < len(available_perfumes)]
    except Exception as e:
        print(f'Perfume NN ranking failed: {e}')
        return None


def _rank_with_text_similarity(available_perfumes, query, top_n=5):
    vectorizer = MODELS.get('tfidf_vectorizer')
    embeddings = MODELS.get('perfume_embeddings')
    if vectorizer is None or embeddings is None:
        return None

    try:
        query_vec = vectorizer.transform([query]).toarray()
        if query_vec.shape[1] != embeddings.shape[1]:
            print('Text similarity vector dimension mismatch')
            return None

        normalized_query = query_vec / np.linalg.norm(query_vec, axis=1, keepdims=True)
        normalized_embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)
        similarities = normalized_embeddings.dot(normalized_query.T).flatten()
        top_indices = np.argsort(-similarities)[:top_n]
        return [available_perfumes[int(i)]['id'] for i in top_indices if int(i) < len(available_perfumes)]
    except Exception as e:
        print(f'Text similarity ranking failed: {e}')
        return None


def predict(model, data, available_perfumes=None, tenant_id=None, model_name=None, query=None, top_n=5):
    """Make a recommendation using any available loaded model."""
    try:
        tenant_ctx = None
        if tenant_id is not None:
            tenant_ctx = _load_tenant_model(tenant_id)
            if tenant_ctx and tenant_ctx.get('perfumes') is not None:
                available_perfumes = tenant_ctx.get('perfumes')

        if available_perfumes is not None and isinstance(available_perfumes, list):
            if tenant_id is not None:
                available_perfumes = [p for p in available_perfumes if p.get('tenant_id') == tenant_id]

            if not available_perfumes:
                return []

            if query:
                text_result = _rank_with_text_similarity(available_perfumes, query, top_n)
                if text_result:
                    return text_result

            if model_name == 'perfume_nn':
                nn_result = _rank_with_perfume_nn(available_perfumes, data, top_n)
                if nn_result:
                    return nn_result

            if isinstance(data, list):
                simple_result = _rank_with_simple_scoring(available_perfumes, data, tenant_id)
                if simple_result:
                    return simple_result[:top_n]

        model_to_use = None
        if model_name and model_name in MODELS and MODELS[model_name] is not None:
            model_to_use = MODELS[model_name]
        elif tenant_ctx is not None:
            model_to_use = tenant_ctx.get('model')
        else:
            model_to_use = model

        if isinstance(data, list) and model_to_use is not None and hasattr(model_to_use, 'predict'):
            input_features = np.array(data).reshape(1, -1)
            result = model_to_use.predict(input_features)
            return result.tolist() if hasattr(result, 'tolist') else [result]

        if query and 'tfidf_vectorizer' in MODELS and MODELS['tfidf_vectorizer'] is not None:
            text_result = _rank_with_text_similarity(available_perfumes or [], query, top_n)
            if text_result:
                return text_result

        return [1, 2, 3]
    except Exception as e:
        print(f"Prediction error: {e}")
        if available_perfumes:
            return [p['id'] for p in available_perfumes[:top_n]]
        return [1, 2, 3]


class RecommendationService:
    def __init__(self):
        self.models = MODELS

    def predict_cluster(self, user_features):
        """Segmentation client avec K-Means"""
        global_model_ctx = self.models.get('global')
        scaler = None
        kmeans = None
        if isinstance(global_model_ctx, dict):
            scaler = global_model_ctx.get('scaler')
            kmeans = global_model_ctx.get('model')
        
        if kmeans is None:
            kmeans = self.models.get('kmeans_segmentation')
            
        if kmeans is None:
            raise ValueError("K-Means model not loaded")

        features_arr = np.array(user_features).reshape(1, -1)
        if scaler is not None:
            features_arr = scaler.transform(features_arr)
        
        cluster_id = kmeans.predict(features_arr)[0]
        return int(cluster_id)

    def recommend_by_content(self, user_features=None, query=None, available_perfumes=None, tenant_id=None, top_n=5):
        """Content-Based Filtering (NearestNeighbors / Embeddings + TF-IDF)"""
        if available_perfumes is None:
            global_model_ctx = self.models.get('global')
            if isinstance(global_model_ctx, dict):
                available_perfumes = global_model_ctx.get('perfumes')
        
        if available_perfumes is None:
            available_perfumes = []
            
        if tenant_id is not None:
            available_perfumes = [p for p in available_perfumes if p.get('tenant_id') == tenant_id]

        if not available_perfumes:
            return []

        if query:
            text_result = _rank_with_text_similarity(available_perfumes, query, top_n)
            if text_result:
                return text_result

        if user_features:
            nn_result = _rank_with_perfume_nn(available_perfumes, user_features, top_n)
            if nn_result:
                return nn_result

            simple_result = _rank_with_simple_scoring(available_perfumes, user_features, tenant_id)
            if simple_result:
                return simple_result[:top_n]
                
        return [p['id'] for p in available_perfumes[:top_n]]

    def recommend_by_svd(self, user_id, available_perfumes=None, tenant_id=None, top_n=5):
        """Collaborative Filtering using SVD"""
        svd = self.models.get('svd_optimized')
        if svd is None:
            return self.recommend_by_content(available_perfumes=available_perfumes, tenant_id=tenant_id, top_n=top_n)

        if available_perfumes is None:
            global_model_ctx = self.models.get('global')
            if isinstance(global_model_ctx, dict):
                available_perfumes = global_model_ctx.get('perfumes')
        
        if available_perfumes is None:
            available_perfumes = []

        if tenant_id is not None:
            available_perfumes = [p for p in available_perfumes if p.get('tenant_id') == tenant_id]

        if not available_perfumes:
            return []

        trained_users = list(svd.trainset._raw2inner_id_users.keys()) if hasattr(svd, 'trainset') else []
        trained_items = list(svd.trainset._raw2inner_id_items.keys()) if hasattr(svd, 'trainset') else []
        
        svd_user_id = str(user_id)
        if trained_users and svd_user_id not in trained_users:
            try:
                user_idx = int(user_id) % len(trained_users)
                svd_user_id = trained_users[user_idx]
            except ValueError:
                user_idx = hash(user_id) % len(trained_users)
                svd_user_id = trained_users[user_idx]

        scored_perfumes = []
        for p in available_perfumes:
            pid = p.get('id')
            svd_item_id = f"P{pid}"
            if trained_items and svd_item_id not in trained_items:
                try:
                    item_idx = int(pid) % len(trained_items)
                    svd_item_id = trained_items[item_idx]
                except ValueError:
                    item_idx = hash(pid) % len(trained_items)
                    svd_item_id = trained_items[item_idx]

            prediction = svd.predict(svd_user_id, svd_item_id)
            scored_perfumes.append((pid, prediction.est))

        scored_perfumes.sort(key=lambda x: x[1], reverse=True)
        return [item[0] for item in scored_perfumes[:top_n]]

    def recommend_hybrid(self, user_id, user_features=None, query=None, available_perfumes=None, tenant_id=None, top_n=5):
        """Hybrid Recommendation: Fusion of Content-Based (0.5) + SVD (0.5)"""
        if available_perfumes is None:
            global_model_ctx = self.models.get('global')
            if isinstance(global_model_ctx, dict):
                available_perfumes = global_model_ctx.get('perfumes')
        
        if available_perfumes is None:
            available_perfumes = []

        if tenant_id is not None:
            available_perfumes = [p for p in available_perfumes if p.get('tenant_id') == tenant_id]

        if not available_perfumes:
            return []

        content_scores = {}
        vectorizer = self.models.get('tfidf_vectorizer')
        embeddings = self.models.get('perfume_embeddings')
        perfume_model = self.models.get('perfume_nn')

        if query and vectorizer is not None and embeddings is not None:
            try:
                query_vec = vectorizer.transform([query]).toarray()
                normalized_query = query_vec / np.linalg.norm(query_vec, axis=1, keepdims=True)
                normalized_embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)
                sims = normalized_embeddings.dot(normalized_query.T).flatten()
                for idx, sim in enumerate(sims):
                    if idx < len(available_perfumes):
                        pid = available_perfumes[idx]['id']
                        content_scores[pid] = float(sim)
            except Exception as e:
                print(f"Content query scoring fail: {e}")

        if not content_scores and user_features and perfume_model is not None and embeddings is not None:
            try:
                query_vector = np.array(user_features).reshape(1, -1)
                distances, indices = perfume_model.kneighbors(query_vector, n_neighbors=len(available_perfumes))
                for idx, dist in zip(indices[0], distances[0]):
                    if idx < len(available_perfumes):
                        pid = available_perfumes[idx]['id']
                        sim = 1.0 / (1.0 + float(dist))
                        content_scores[pid] = sim
            except Exception as e:
                print(f"Content features scoring fail: {e}")

        for p in available_perfumes:
            pid = p['id']
            if pid not in content_scores:
                content_scores[pid] = float(p.get('rating', 4.0)) / 5.0

        svd = self.models.get('svd_optimized')
        svd_scores = {}
        if svd is not None:
            trained_users = list(svd.trainset._raw2inner_id_users.keys()) if hasattr(svd, 'trainset') else []
            trained_items = list(svd.trainset._raw2inner_id_items.keys()) if hasattr(svd, 'trainset') else []
            
            svd_user_id = str(user_id)
            if trained_users and svd_user_id not in trained_users:
                user_idx = int(user_id) % len(trained_users) if str(user_id).isdigit() else hash(user_id) % len(trained_users)
                svd_user_id = trained_users[user_idx]

            for p in available_perfumes:
                pid = p['id']
                svd_item_id = f"P{pid}"
                if trained_items and svd_item_id not in trained_items:
                    item_idx = int(pid) % len(trained_items) if str(pid).isdigit() else hash(pid) % len(trained_items)
                    svd_item_id = trained_items[item_idx]

                prediction = svd.predict(svd_user_id, svd_item_id)
                svd_scores[pid] = (prediction.est - 1.0) / 4.0
        else:
            for p in available_perfumes:
                svd_scores[p['id']] = 0.5

        hybrid_scores = []
        for p in available_perfumes:
            pid = p['id']
            c_score = content_scores.get(pid, 0.5)
            s_score = svd_scores.get(pid, 0.5)
            h_score = 0.5 * c_score + 0.5 * s_score
            hybrid_scores.append((pid, h_score))

        hybrid_scores.sort(key=lambda x: x[1], reverse=True)
        return [item[0] for item in hybrid_scores[:top_n]]


RECOMMENDATION_SERVICE = RecommendationService()

