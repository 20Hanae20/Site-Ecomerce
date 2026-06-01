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
