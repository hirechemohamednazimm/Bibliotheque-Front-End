/**
 * @file server.js
 * @description Point d'entrée principal de l'application Bibliothèque.
 *
 * Ce fichier configure et lance le serveur Express. Il :
 * 1. Charge les variables d'environnement (.env)
 * 2. Initialise les middlewares (sécurité, session, parsing, etc.)
 * 3. Configure EJS comme moteur de templates
 * 4. Monte les routes API REST (/api/...)
 * 5. Monte les routes Web EJS (/books, /authors, etc.)
 * 6. Définit les associations entre les modèles Sequelize
 * 7. Synchronise la base de données et démarre le serveur
 */

require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const methodOverride = require("method-override");
const path = require("path");

const sequelize = require("./config/db");

// --- Modèles Sequelize (associations centralisées dans models/relation.js) ---
const { Role, User, Author, Category, Book, Loan, Review, Fine } = require("./models/relation");

// --- Routes API REST ---
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const authorRoutes = require("./routes/authorRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const bookRoutes = require("./routes/bookRoutes");
const loanRoutes = require("./routes/loanRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const fineRoutes = require("./routes/fineRoutes");

// --- Routes Web EJS ---
const webAuthRoutes = require("./routes/webAuthRoutes");
const webBookRoutes = require("./routes/webBookRoutes");
const webAuthorRoutes = require("./routes/webAuthorRoutes");
const webCategoryRoutes = require("./routes/webCategoryRoutes");
const webLoanRoutes = require("./routes/webLoanRoutes");
const webReviewRoutes = require("./routes/webReviewRoutes");
const webFineRoutes = require("./routes/webFineRoutes");
const webUserRoutes = require("./routes/webUserRoutes");

const app = express();

// ============================================================
// Middlewares globaux
// ============================================================

/** Sécurité HTTP (headers de protection, désactive CSP pour les CDN Bootstrap) */
app.use(helmet({ contentSecurityPolicy: false }));

/** Compression gzip des réponses pour améliorer les performances */
app.use(compression());

/** Parsing du corps des requêtes JSON (routes API) */
app.use(express.json());

/** Parsing du corps des formulaires HTML (routes EJS) */
app.use(express.urlencoded({ extended: true }));

/** Lecture des cookies (nécessaire pour verifierToken.js) */
app.use(cookieParser());

/** Gestion des sessions Express (utilisé par express-session) */
app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
}));

/**
 * method-override : permet aux formulaires HTML (qui ne supportent que GET/POST)
 * d'émuler les méthodes PUT et DELETE via le paramètre `_method`.
 * Exemple : <form action="/books/edit/1?_method=PUT" method="POST">
 */
app.use(methodOverride("_method"));

/** Sert les fichiers statiques depuis le dossier public/ (CSS, images uploadées) */
app.use(express.static(path.join(__dirname, "public")));

// ============================================================
// Moteur de templates EJS
// ============================================================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ============================================================
// Routes API REST — retournent du JSON
// Préfixe : /api/
// Auth : Bearer token JWT (voir middleware/authMiddleware.js)
// ============================================================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/fines", fineRoutes);

// ============================================================
// Routes Web EJS — rendent des pages HTML
// Auth : cookie JWT (voir authentification/verifierToken.js)
// ============================================================
app.use("/", webAuthRoutes);           // GET /login, POST /login, GET /logout
app.use("/books", webBookRoutes);
app.use("/authors", webAuthorRoutes);
app.use("/categories", webCategoryRoutes);
app.use("/loans", webLoanRoutes);
app.use("/reviews", webReviewRoutes);
app.use("/fines", webFineRoutes);
app.use("/users", webUserRoutes);

/** Page d'accueil — accessible sans authentification */
app.get("/", (req, res) => {
  const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  res.render("index", { title: "Bibliothèque", loggedUser });
});

// ============================================================
// Démarrage du serveur
// ============================================================

sequelize.sync()
  .then(async () => {
    console.log("Connexion MySQL réussie ✅");

    // Créer les rôles par défaut s'ils n'existent pas encore
    await Role.findOrCreate({ where: { name: "admin" } });
    await Role.findOrCreate({ where: { name: "user" } });
    console.log("Rôles OK ✅");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Serveur lancé sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erreur de connexion à la base de données ❌", err);
  });
