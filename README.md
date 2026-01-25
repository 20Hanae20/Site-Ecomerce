# 🌿 Site Parfum - Expérience E-commerce de Luxe

![Bannière Luxe](https://placehold.co/1200x400?text=Site+Parfum+-+Haute+Parfumerie)

> **Une fusion entre l'art de la parfumerie et l'innovation technologique.**
> Ce projet est une plateforme e-commerce complète (Full Stack) proposant une expérience utilisateur immersive, un design soigné et un système de recommandation intelligent.

## 🌟 Fonctionnalités Clés

### 🎨 Expérience Utilisateur (Front-Office)
*   **Design Premium** : Interface "Glassmorphism" sombre et dorée, animations fluides et typographie élégante.
*   **🧪 Quiz Olfactif IA** : Algorithme de recommandation qui analyse le profil sensoriel de l'utilisateur pour lui proposer sa signature olfactive idéale.
*   **Parcours Client** : Catalogue filtrable, pages produits détaillées, gestion du panier et tunnel de commande simulé.

### 🛡️ Administration (Back-Office)
*   **Dashboard Visuel** : Statistiques de ventes, graphiques de tendance et suivi de l'activité.
*   **Gestion Globale** : CRUD complet pour les produits, catégories, commandes, utilisateurs et promotions.
*   **Sécurité** : Système de rôles et permissions (Super Admin, Modérateur, Gestionnaire).

---

## 🛠️ Stack Technique

Ce projet adopte une architecture **Headless** moderne :

| Couche | Technologie | Rôle |
| :--- | :--- | :--- |
| **Backend** | **Laravel 10** (PHP) | API REST, Logique métier, Sécurité, Base de données |
| **Frontend** | **React 18** (Vite) | Interface Utilisateur (SPA), Gestion d'état, Appel API |
| **Base de données** | **MySQL** | Stockage relationnel (Utilisateurs, Commandes, Produits) |
| **Styles** | **CSS 3** | Design System personnalisé (Variables CSS, Flexbox, Grid) |

---

## 🚀 Installation & Démarrage

### Pré-requis
*   PHP 8.1+ & Composer
*   Node.js 16+ & NPM
*   MySQL

### 1. Installation du Backend (API)
```bash
cd "Site parfum"

# Installation des dépendances
composer install

# Configuration de l'environnement
cp .env.example .env
# (Configurez votre BDD dans le fichier .env)

# Génération de la clé et migration
php artisan key:generate
php artisan migrate --seed # Remplit la base avec des données de test

# Lancement du serveur
php artisan serve
```

### 2. Installation du Frontend (React)
```bash
cd frontend

# Installation des dépendances
npm install

# Lancement du serveur de développement
npm run dev
```

Accédez à l'application sur : `http://localhost:5173`

---

## 🧪 Le Quiz Olfactif : Comment ça marche ?

Le système de recommandation est une fonctionnalité phare du projet. Il ne se contente pas de filtrer, il **matche**.

1.  **Profilage** : L'utilisateur répond à 4 questions ciblées (Ambiance, Matière, Personnalité, Saison).
2.  **Scoring** : Chaque réponse alimente un vecteur de préférences (Floral, Boisé, Oriental, Frais, Épicé).
3.  **Matching** : L'algorithme compare ce vecteur avec les attributs techniques de chaque parfum en base de données.
4.  **Résultat** : Les 3 parfums ayant le score de compatibilité le plus élevé sont présentés avec un pourcentage de pertinence.

---

## 👤 Auteur

Projet réalisé par **Hanae Chaiboub** - 2026.
*Cadre :  E-commerce*
