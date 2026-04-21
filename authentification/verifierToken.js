/**
 * @file verifierToken.js
 * @description Middleware de vérification du token JWT pour les routes EJS (interface web).
 *
 * Contrairement au middleware API (authMiddleware.js) qui lit le token dans le header HTTP,
 * ce middleware le lit depuis un cookie HTTP-only nommé `token`.
 * Ce cookie est créé lors de la connexion via POST /login.
 *
 * En cas de token absent ou invalide, l'utilisateur est redirigé vers /login.
 */

const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Middleware qui protège les routes EJS.
 *
 * Si le cookie `token` est valide, il attache l'id et le rôle de l'utilisateur
 * à l'objet `req` et passe au middleware suivant.
 *
 * @param {import('express').Request} req - Requête Express.
 *   Doit contenir `req.cookies.token` (géré par cookie-parser).
 *   Si valide : `req.userId` et `req.userRole` sont alimentés.
 * @param {import('express').Response} res - Réponse Express.
 * @param {import('express').NextFunction} next - Fonction suivante.
 * @returns {void} Redirige vers /login si le token est absent ou invalide.
 */
const verifierToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.CODE_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    // Token expiré ou falsifié — nettoyer le cookie et rediriger
    res.clearCookie("token");
    return res.redirect("/login");
  }
};

module.exports = verifierToken;
