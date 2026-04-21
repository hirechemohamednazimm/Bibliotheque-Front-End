/**
 * @file paginate.js
 * @description Helper de pagination pour les requêtes Sequelize.
 *
 * Convertit un numéro de page et une taille de page en `limit` et `offset`
 * utilisables directement dans `findAndCountAll()`.
 *
 * Utilisation :
 * ```js
 * const paginate = require('../helpers/paginate');
 * const { limit, offset } = paginate(req.query.page, 10);
 * const result = await Book.findAndCountAll({ limit, offset });
 * ```
 */

/**
 * Calcule les paramètres de pagination pour Sequelize.
 *
 * @param {number|string} page - Numéro de page courant (commence à 1). Défaut : 1.
 * @param {number|string} size - Nombre d'éléments par page. Défaut : 10.
 * @returns {{ limit: number, offset: number }} Objet contenant `limit` et `offset`.
 *
 * @example
 * paginate(1, 10) // { limit: 10, offset: 0 }
 * paginate(2, 10) // { limit: 10, offset: 10 }
 * paginate(3, 5)  // { limit: 5,  offset: 10 }
 */
const paginate = (page, size) => {
  const limit = size ? parseInt(size) : 10;
  const offset = page ? (parseInt(page) - 1) * limit : 0;
  return { limit, offset };
};

module.exports = paginate;
