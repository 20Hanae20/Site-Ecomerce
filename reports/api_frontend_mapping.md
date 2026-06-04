Cartographie API → Frontend (résumé rapide)

But: backend base API: /api (Laravel serveur: http://127.0.0.1:8000)
ML API: http://127.0.0.1:8002/recommend

Endpoints (sélection importantes) and frontend pages that consume them:

- GET /api/perfumes
  - frontend: Home.jsx, PerfumeList.jsx
- GET /api/perfumes/{id}
  - frontend: PerfumeDetail.jsx
- GET /api/categories
  - frontend: PerfumeList.jsx
- GET /api/perfumes?q=...&per_page=... (autocomplete)
  - frontend: PerfumeList.jsx
- POST /api/login
  - frontend: Login.jsx
- POST /api/register
  - frontend: Register.jsx
- GET /api/profile, PUT /api/profile
  - frontend: Profile.jsx
- POST /api/profile/change-password
  - frontend: Profile.jsx
- POST /api/addresses, DELETE /api/addresses/{id}
  - frontend: Profile.jsx
- GET /api/cart, POST /api/cart, DELETE /api/cart/{id}
  - frontend: Cart.jsx, useCart context
- POST /api/orders (checkout), GET /api/orders/{id}
  - frontend: Checkout.jsx
- POST /api/payments/initiate, POST /api/payments/{id}/validate, POST /api/payments/{id}/fail
  - frontend: Checkout.jsx
- POST /api/recommendations
  - frontend: Recommendations.jsx, Quiz.jsx
- GET /api/admin/* (dashboard routes)
  - frontend: admin pages (src/admin/*)

Observations / Gaps

- Nombre de pages utilisaient des URLs absolues (http://127.0.0.1:8000) — j'ai remplacé plusieurs d'entre elles pour utiliser l'instance `api` centralisée (frontend/src/services/api.js) et `VITE_API_URL`.
- `api.js` maintenant utilise `import.meta.env.VITE_API_URL` si présent et gère `Authorization` via interceptor.
- Reste à standardiser d'autres fichiers si présents (ex: components, services externes). Rechercher `http://127.0.0.1:8000` pour finir.
- ML: endpoint sur 8002; RecommendationController utilise `config('services.ml_api.url')`.

Prochaines actions recommandées

- Rechercher toutes les occurrences de `http://127.0.0.1:8000` dans `frontend/src` et convertir vers `api` ou `VITE_API_URL`.
- Lancer le frontend dev server (`npm run dev`) et tester manuellement pages: Home, Catalog, Product, Cart, Checkout, Profile, Recommendations.
- Exécuter `php artisan test` et tests frontend si présents.
- Consolider l'environnement ML (re-sérialiser modèles ou aligner versions scikit-learn) pour éviter warnings à l'unpickle.

Rapide checklist de vérification

- [x] Home.jsx: uses `api` for /perfumes
- [x] PerfumeList.jsx: uses `api` for categories/perfumes/autocomplete
- [x] PerfumeDetail.jsx: uses `api` for perfume detail
- [x] Login/Register: use `api`
- [x] Profile/Addresses: use `api`
- [ ] Search remaining hardcoded endpoints across project
- [ ] Run end-to-end manual walkthrough

Si vous voulez, je peux maintenant :
- Lancer la recherche et remplacer toutes les occurrences restantes automatiquement.
- Démarrer le serveur frontend (`npm install` puis `npm run dev`) et vérifier les pages.
- Exécuter une passe d'audit RBAC et lister endpoints manquants.

