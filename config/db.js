/**
 * @file db.js
 * @description Configuration et instance Sequelize pour la connexion à MySQL.
 *
 * Les paramètres de connexion sont définis ici directement.
 * En production, utilisez des variables d'environnement (process.env.DB_NAME, etc.)
 * comme c'est fait dans le fichier .env.
 */

const { Sequelize } = require("sequelize");

/**
 * Instance Sequelize connectée à la base de données MySQL `bibliotheque_db`.
 * Utilisée dans tous les modèles pour définir les tables.
 *
 * @type {Sequelize}
 */
const sequelize = new Sequelize(
  process.env.DB_NAME || "bibliotheque_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false, // Mettre à true pour voir les requêtes SQL dans la console
  }
);

module.exports = sequelize;
