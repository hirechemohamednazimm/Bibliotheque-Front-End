# Bibliothèque — Application Web

Application de gestion de bibliothèque construite avec **Node.js / Express**, **Sequelize (MySQL)** et **EJS** comme moteur de templates.

---

## Table des matières

1. [Technologies utilisées](#technologies-utilisées)
2. [Prérequis](#prérequis)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Lancer l'application](#lancer-lapplication)
6. [Structure du projet](#structure-du-projet)
7. [Authentification](#authentification)
8. [Rôles et accès](#rôles-et-accès)
9. [Vues EJS](#vues-ejs)

---

## Technologies utilisées

| Catégorie       | Technologie                        |
|-----------------|------------------------------------|
| Runtime         | Node.js                            |
| Framework web   | Express.js 5                       |
| Base de données | MySQL (via XAMPP)                  |
| ORM             | Sequelize 6                        |
| Moteur de vues  | EJS 5                              |
| Auth            | JWT + bcryptjs + cookies HTTP-only |
| Upload fichiers | Multer                             |
| Validation      | express-validator                  |
| CSS / UI        | Bootstrap 5 + Bootstrap Icons      |
| Sécurité        | Helmet                             |
| Divers          | method-override, compression, dotenv |

---

## Prérequis

- **Node.js** v18 ou supérieur
- **XAMPP** (ou tout serveur MySQL) en cours d'exécution
- **npm** v9 ou supérieur

---

## Installation

```bash
# 1. Cloner le dépôt
git clone <url-du-repo>
cd Bibliotheque-Front-End

# 2. Installer les dépendances
npm install

# 3. Créer la base de données dans phpMyAdmin
# Nom de la base : bibliotheque_db

# 4. (Optionnel) Peupler la base avec des données de test
node seeders/seed.js
```

---

## Configuration

Créer un fichier `.env` à la racine du projet :

```env
PORT=5000
SESSION_SECRET=bibliotheque_session_secret_key

DB_NAME=bibliotheque_db
DB_USER=root
DB_PASSWORD=
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306

CODE_SECRET=bibliotheque_jwt_secret_key
```

---

## Lancer l'application

```bash
# Mode développement (rechargement automatique avec nodemon)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur **http://localhost:5000**

---

## Structure du projet

```
Bibliotheque-Front-End/
│
├── server.js                    # Point d'entrée — Express, EJS, routes, DB
├── .env                         # Variables d'environnement (non versionné)
│
├── config/
│   └── db.js                    # Connexion Sequelize à MySQL
│
├── models/                      # Modèles Sequelize
│   ├── User.js
│   ├── Role.js
│   ├── Author.js
│   ├── Category.js
│   ├── Book.js
│   ├── Loan.js
│   ├── Review.js
│   └── Fine.js
│
├── controllers/                 # Logique métier
│   ├── bookController.js
│   ├── authorController.js
│   ├── categoryController.js
│   ├── loanController.js
│   ├── reviewController.js
│   ├── fineController.js
│   └── userController.js
│
├── routes/                      # Routes Web EJS
│   ├── webAuthRoutes.js
│   ├── webBookRoutes.js
│   ├── webAuthorRoutes.js
│   ├── webCategoryRoutes.js
│   ├── webLoanRoutes.js
│   ├── webReviewRoutes.js
│   ├── webFineRoutes.js
│   └── webUserRoutes.js
│
├── authentification/
│   ├── login.js                 # Handlers login/logout (cookie JWT)
│   ├── verifierToken.js         # Middleware vérification cookie
│   └── autorisation.js          # Middleware contrôle des rôles
│
├── helpers/
│   ├── fileLoader.js            # Multer — upload images vers public/images/
│   └── paginate.js              # Helper pagination (limit/offset)
│
├── validations/                 # Validations express-validator
│   ├── loginValidation.js
│   ├── bookValidation.js
│   ├── authorValidation.js
│   ├── categoryValidation.js
│   ├── loanValidation.js
│   ├── reviewValidation.js
│   ├── fineValidation.js
│   └── userValidation.js
│
├── seeders/
│   └── seed.js                  # Données de test (auteurs, livres, utilisateurs...)
│
├── views/                       # Templates EJS
│   ├── head.ejs
│   ├── header.ejs
│   ├── footer.ejs
│   ├── index.ejs
│   ├── auth/login.ejs
│   ├── books/
│   ├── authors/
│   ├── categories/
│   ├── loans/
│   ├── reviews/
│   ├── fines/
│   └── users/
│
└── public/
    ├── styles/style.css
    └── images/
```

---

## Authentification

- Connexion via `POST /login` → JWT stocké dans un cookie `httpOnly`
- Le middleware `verifierToken.js` lit le cookie à chaque requête et extrait `req.userId`
- La déconnexion (`GET /logout`) efface les cookies et redirige vers `/login`
- Toutes les pages (sauf `/login`) sont protégées

---

## Rôles et accès

| Action                           | user | admin |
|----------------------------------|:----:|:-----:|
| Voir les livres, auteurs, catégories | ✅ | ✅ |
| Emprunter un livre               | ✅   | ✅    |
| Voir ses propres emprunts        | ✅   | ✅    |
| Voir tous les emprunts           | ✗    | ✅    |
| Laisser un avis                  | ✅   | ✅    |
| Ajouter / modifier / supprimer   | ✗    | ✅    |
| Gérer les utilisateurs           | ✗    | ✅    |
| Gérer les amendes                | ✗    | ✅    |

---

## Vues EJS

### Partials

| Fichier      | Rôle                                               |
|--------------|----------------------------------------------------|
| `head.ejs`   | `<head>` avec Bootstrap 5 CDN                      |
| `header.ejs` | Navbar responsive avec liens et bouton déconnexion |
| `footer.ejs` | Pied de page                                       |

### Pattern de chaque page

```ejs
<%- include('../head') %>
<%- include('../header') %>

<main class="container my-4">
  <!-- contenu -->
</main>

<%- include('../footer') %>
```

### Suppression avec method-override

Les formulaires HTML ne supportent que GET/POST. La suppression utilise `method-override` :

```html
<form action="/books/delete/1?_method=DELETE" method="POST">
  <button type="submit">Supprimer</button>
</form>
```
