# ⚜️ Maison de Parfum — Climatrack

**Maison de Parfum** est une plateforme e-commerce de luxe dédiée à la haute parfumerie. Alliant une esthétique visuelle raffinée (Glassmorphism, Dark Mode) et une intelligence artificielle de pointe, le site offre une expérience utilisateur immersive et personnalisée.

---

## ✨ Points Forts du Projet

*   **💎 Design Premium** : Interface moderne, fluide et luxueuse conçue pour une expérience utilisateur haut de gamme.
*   **📊 Tableau de Bord Admin** : Gestion complète des utilisateurs, produits, catégories, stocks, commandes et logs système.
*   **🧠 IA de Recommandation** : Un moteur d'apprentissage automatique (FastAPI) qui analyse les préférences olfactives des clients en temps réel.
*   **🛒 Expérience Shopping** : Catalogue dynamique, filtres avancés, système de panier ultra-réactif et checkout sécurisé.
*   **🛠️ Architecture Tridimensionnelle** : Séparation claire entre le Frontend (React), le Backend (Laravel API) et le Service ML (FastAPI).

---

## 🚀 Installation & Configuration

### 1. Prérequis
* **PHP** >= 8.2 & **Composer**
* **Node.js** & **NPM**
* **Python** >= 3.9
* **MySQL**

### 2. Backend (Laravel API + SaaS)
```bash
# Depuis la racine du projet
composer install
cp .env.example .env
php artisan key:generate

# Configurez DB + Stripe dans .env
# STRIPE_KEY, STRIPE_SECRET, STRIPE_WEBHOOK_SECRET
# STRIPE_PRICE_STARTER, STRIPE_PRICE_PROFESSIONAL

php artisan migrate --seed
php artisan serve
```

### 3. Frontend
```bash
# Build assets Laravel (public/build)
npm install
npm run build

# Build SPA React admin/client (frontend/dist)
cd frontend
npm install
npm run dev
# ou npm run build
```

### 4. Machine Learning API (FastAPI)
```bash
cd ml-api
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### 5. Tenancy & validation rapide
```bash
# Créer un tenant demo/domain
php artisan tenant create --name="Maison Demo" --domain="demo.localhost" --plan=starter

# Vérifications backend
php artisan test
```

---

## 🏗️ Architecture Technique

| Composant | Technologie | Rôle |
| :--- | :--- | :--- |
| **Frontend** | React / Vite / CSS3 | Interface utilisateur, animations premium, gestion des états. |
| **Backend** | Laravel 11 (API) | Logique métier, sécurité, base de données, proxy vers l'IA. |
| **AI Service** | FastAPI / Scikit-learn | Moteur de recommandation, traitement des données olfactives. |
| **Database** | MySQL | Stockage des produits, commandes et historiques clients. |

---

## 🔧 Fonctionnement de l'IA

Le système s'appuie sur une boucle de rétroaction dynamique :
1.  **Explorations** : L'IA suit les parfums consultés.
2.  **Acquisitions** : Les achats renforcent le profil utilisateur (Poids 2.0).
3.  **Révélations** : Le modèle K-Means / Scoring analyse les familles olfactives (Floral, Boisé, etc.) pour suggérer les produits les plus affinitaires du catalogue.

---

## 📝 Licence
Ce projet est réalisé dans le cadre du développement **Climatrack**. Tous droits réservés.
