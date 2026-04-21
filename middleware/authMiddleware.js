/**
 * @file authMiddleware.js
 * @description Middleware d'authentification JWT pour les routes de l'API REST.
 *
 * Ce middleware est utilisé exclusivement par les routes API (/api/...).
 * Il lit le token depuis le header HTTP `Authorization: Bearer <token>`.
 *
 * Pour les routes EJS (interface web), voir authentification/verifierToken.js
 * qui lit le token depuis un cookie HTTP-only.
 */

const jwt = require("jsonwebtoken");

/**
 * Middleware qui vérifie le token JWT dans le header Authorization.
 *
 * @param {import('express').Request} req - Requête Express.
 *   Doit contenir `req.headers.authorization` au format "Bearer <token>".
 *   Si valide, `req.user` est alimenté avec le payload décodé.
 * @param {import('express').Response} res - Réponse Express.
 * @param {import('express').NextFunction} next - Fonction suivante dans la chaîne de middleware.
 * @returns {void} Appelle next() si le token est valide, sinon renvoie 401.
 */
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

  // Vérifier la présence du header Authorization
  if (!header) {
    return res.status(401).json({ message: "Token manquant" });
  }

  // Extraire le token après "Bearer "
  const token = header.split(" ")[1];

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.CODE_SECRET || "secret123");
    req.user = decoded; // Attacher le payload au request pour les contrôleurs
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

module.exports = authMiddleware;
