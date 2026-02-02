# 🎓 Support de Soutenance - Site Parfum

Ce document synthétise les points clés à aborder lors de la présentation orale du projet.

---

## 1. Introduction & Contexte
*   **Sujet** : Création d'une plateforme e-commerce pour une marque de parfumerie de luxe fictive.
*   **Problématique** : *"Comment digitaliser l'expérience sensorielle du choix d'un parfum ?"*
*   **Solution** : Une interface immersive et un système de recommandation personnalisé (Quiz Olfactif).

## 2. Architecture Technique
Mise en avant du choix d'une architecture **Headless** (Séparation Front/Back) :
*   **Backend (Laravel)** : Robuste, sécurisé, gère la logique métier (commandes, calculs, base de données).
*   **Frontend (React)** : Réactif, fluide, permet des transitions douces (SPA) indispensables pour une expérience "Luxe".

## 3. Démonstration des Fonctionnalités (Le "Wow" Effect)

### A. L'Expérience Client (Front Office)
*   **Navigation** : Montrer le design sombre/doré et les animations au survol.
*   **⭐️ Le Quiz Olfactif** (Point fort) : 
    *   Démarrer le quiz depuis la page d'accueil.
    *   Montrer la fluidité des questions sans rechargement.
    *   **Résultat** : Expliquer comment le site propose 3 parfums spécifiques avec un % de compatibilité.
*   **Achat** : Ajout au panier rapide et tunnel de commande.

### B. L'Espace Administration (Back Office)
*   **Dashboard** : Montrer les graphiques de ventes et les cartes statistiques.
*   **Gestion Avancée** :
    *   Ajout d'un parfum (avec upload d'image et prévisualisation).
    *   Gestion des commandes (Changement de statut en direct).
    *   Rôles : Expliquer la différence entre un "Administrateur" et un "Modérateur".

## 4. Focus Technique : L'Algorithme de Recommandation
*   **Challenge** : Traduire des préférences subjectives (émotions, saisons) en données techniques.
*   **Implémentation** :
    *   Chaque réponse du quiz attribue des points à des familles (Floral, Boisé...).
    *   Le serveur compare ce "Vecteur Utilisateur" avec les attributs de chaque parfum en base de données.
    *   Calcul d'un **Score de Pertinence** normalisé.

## 5. Difficultés & Solutions
*   **Design** : Gérer le Glassmorphism (effets de flou) tout en gardant le site performant -> Utilisation optimisée de CSS.
*   **State Management** : Gérer le panier persistant entre les pages -> Utilisation de React Context et Storage local.

## 6. Conclusion & Perspectives
*   **Bilan** : Une application fonctionnelle, esthétique et techniquement moderne.
*   **Améliorations futures** :
    *   Intégration d'une vraie passerelle de paiement (Stripe).
    *   IA plus poussée (Machine Learning) pour affiner les recommandations avec l'historique d'achat.

---
**💡 Conseil pour la démo** : Connectez-vous d'abord en tant que client pour faire le quiz, puis en tant qu'admin pour montrer le changement d'interface.
