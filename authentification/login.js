/**
 * @file login.js
 * @description Handlers de connexion et déconnexion pour l'interface web EJS.
 *
 * Ces fonctions gèrent le flux d'authentification côté web :
 * 1. Afficher le formulaire de connexion (GET /login)
 * 2. Traiter le formulaire et créer un cookie JWT (POST /login)
 * 3. Effacer le cookie et rediriger (GET /logout)
 *
 * Pour l'API REST, voir controllers/authController.js.
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { User, Role } = require("../models/relation");
require("dotenv").config();

/**
 * Affiche le formulaire de connexion.
 * Si l'utilisateur est déjà connecté (cookie présent), redirige vers /books.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const loginForm = (req, res) => {
  if (req.cookies.token) {
    return res.redirect("/books");
  }
  res.render("auth/login", { title: "Connexion", errors: [] });
};

/**
 * Traite la soumission du formulaire de connexion.
 *
 * Étapes :
 * 1. Valider les champs (email, mot de passe)
 * 2. Chercher l'utilisateur par email
 * 3. Comparer le mot de passe avec bcrypt
 * 4. Générer un JWT et le stocker dans deux cookies :
 *    - `token` : JWT HTTP-only (lu par verifierToken.js)
 *    - `user` : données publiques (nom, rôle) pour l'affichage dans les vues
 * 5. Rediriger vers /books
 *
 * @param {import('express').Request} req - Doit contenir `req.body.email` et `req.body.password`.
 * @param {import('express').Response} res
 */
const loginPost = async (req, res) => {
  // Vérifier les erreurs de validation du formulaire
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("auth/login", {
      title: "Connexion",
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email }, include: Role });

    if (!user) {
      return res.render("auth/login", {
        title: "Connexion",
        errors: [{ msg: "Email ou mot de passe incorrect" }],
      });
    }

    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      return res.render("auth/login", {
        title: "Connexion",
        errors: [{ msg: "Email ou mot de passe incorrect" }],
      });
    }

    // Créer le token JWT avec les informations essentielles
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.Role ? user.Role.name : "user" },
      process.env.CODE_SECRET,
      { expiresIn: "1d" }
    );

    // Cookie HTTP-only : inaccessible depuis JavaScript côté client (sécurité XSS)
    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    // Cookie public : utilisé dans les vues EJS pour afficher le nom de l'utilisateur
    res.cookie("user", JSON.stringify({ id: user.id, fullname: user.fullname, role: user.Role ? user.Role.name : "user" }), {
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.redirect("/books");
  } catch (err) {
    res.render("auth/login", {
      title: "Connexion",
      errors: [{ msg: "Erreur serveur, veuillez réessayer" }],
    });
  }
};

/**
 * Déconnecte l'utilisateur en supprimant les cookies de session.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const logout = (req, res) => {
  res.clearCookie("token");
  res.clearCookie("user");
  res.redirect("/login");
};

module.exports = { loginForm, loginPost, logout };
