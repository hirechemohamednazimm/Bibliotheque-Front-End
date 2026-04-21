/**
 * @file autorisation.js
 * @description Middleware de contrôle d'accès basé sur les rôles (RBAC).
 *
 * Ce middleware doit être utilisé APRÈS verifierToken.js, car il nécessite
 * que `req.userId` soit déjà défini.
 *
 * Exemple d'utilisation dans une route :
 * ```js
 * router.get('/admin', verifierToken, autorisation('admin'), adminController);
 * router.get('/data',  verifierToken, autorisation('admin', 'user'), dataController);
 * ```
 */

const User = require("../models/User");
const Role = require("../models/Role");

/**
 * Factory de middleware d'autorisation par rôle.
 *
 * @param {...string} rolesPermis - Un ou plusieurs noms de rôles autorisés (ex: 'admin', 'user').
 * @returns {import('express').RequestHandler} Middleware Express qui vérifie le rôle de l'utilisateur.
 *
 * @example
 * // Autoriser uniquement les admins
 * router.delete('/users/:id', verifierToken, autorisation('admin'), deleteUser);
 *
 * @example
 * // Autoriser admins et users
 * router.get('/books', verifierToken, autorisation('admin', 'user'), bookList);
 */
const autorisation = (...rolesPermis) => {
  return async (req, res, next) => {
    try {
      // Récupérer l'utilisateur avec son rôle depuis la base de données
      const user = await User.findByPk(req.userId, {
        include: Role,
      });

      if (!user) {
        return res.status(403).render("error", {
          message: "Accès refusé : utilisateur introuvable",
          loggedUser: null,
        });
      }

      const roleUser = user.Role ? user.Role.name : null;

      // Vérifier si le rôle de l'utilisateur fait partie des rôles autorisés
      if (!roleUser || !rolesPermis.includes(roleUser)) {
        return res.status(403).render("error", {
          message: "Accès refusé : vous n'avez pas les droits nécessaires",
          loggedUser: user,
        });
      }

      next();
    } catch (err) {
      res.status(500).render("error", {
        message: "Erreur serveur lors de la vérification des droits",
        loggedUser: null,
      });
    }
  };
};

module.exports = autorisation;
