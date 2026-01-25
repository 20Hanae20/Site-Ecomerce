# Documentation : Gestion du Catalogue de Parfums

Cette section explique comment ajouter et gérer les parfums dans l'application **Site Parfum**.

---

## ⬅️ Backend (Laravel API)

### 1. Modèle & Base de Données
- **Modèle** : `app/Models/Perfume.php`.
- **Table** : `perfumes` (gérée via la migration `create_perfumes_table`).
- **Champs** :
    - `name` : Nom du parfum.
    - `description` : Histoire et détails de la fragrance.
    - `notes` : Notes de tête, cœur et fond (Top, Middle, Base).
    - `price` : Prix en euros.
    - `image_url` : (Optionnel) Lien vers une image.

### 2. Contrôleur (`app/Http/Controllers/Api/PerfumeController.php`)
- **CRUD Complet** :
    - `index()` : Récupère tous les parfums (Public).
    - `store()` : Ajoute un nouveau parfum (Sécurisé).
    - `update()` : Modifie un parfum existant (Sécurisé).
    - `destroy()` : Supprime un parfum (Sécurisé).

### 3. Sécurisation des Routes (`routes/api.php`)
Les actions de modification (POST, PUT, DELETE) sont protégées par le middleware `auth:sanctum`. Seul un utilisateur connecté peut enrichir ou modifier le catalogue.

---

## ➡️ Frontend (React UI)

### 1. Catalogue (`frontend/src/pages/PerfumeList.jsx`)
- Affiche tous les parfums sous forme de grille de cartes élégantes.
- Récupère les données via un appel `GET /api/perfumes`.
- accessible via le lien **"Catalogue"** dans la barre de navigation.

### 2. Ajout de Parfum (`frontend/src/pages/AddPerfume.jsx`)
- Formulaire dédié à l'administrateur.
- Lien **"Ajouter"** visible uniquement lorsque l'utilisateur est connecté.
- Envoie les données en `POST /api/perfumes` avec le jeton d'authentification inclus automatiquement.

---

## 🔄 Flux d'Ajout d'un Parfum
1. L'admin se connecte via la page **Login**.
2. Il clique sur **"Ajouter"** dans la navbar.
3. Il remplit le formulaire (Nom, Prix, Notes, Description).
4. Au clic sur "Ajouter le Parfum", la requête est envoyée.
5. Laravel valide les données et crée l'entrée en base.
6. Le nouveau parfum apparaît immédiatement dans le **Catalogue**.

---

## 💡 Notes Techniques
- **CORS** : La configuration dans `config/cors.php` autorise les requêtes de gestion du catalogue.
- **Validation** : Le backend vérifie que le prix est numérique et que les champs obligatoires sont bien remplis.
