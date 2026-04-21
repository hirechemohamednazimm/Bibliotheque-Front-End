/**
 * @file Loan.js
 * @description Modèle Sequelize représentant un emprunt de livre.
 *
 * Un emprunt lie un utilisateur à un livre pour une période donnée.
 * Le statut passe de "borrowed" à "returned" quand le livre est rendu.
 *
 * Relations :
 * - belongsTo User (via userId)
 * - belongsTo Book (via bookId)
 * - hasMany Fine   — un emprunt peut générer des amendes si retard
 */

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Loan = sequelize.define("Loan", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  /** Date à laquelle le livre a été emprunté (format : YYYY-MM-DD) */
  loanDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  /** Date de retour réelle ou prévue (null si pas encore rendu) */
  returnDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  /**
   * Statut de l'emprunt.
   * - "borrowed" : livre actuellement emprunté
   * - "returned" : livre rendu
   */
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "borrowed",
  },
  /** Clé étrangère vers la table Users */
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  /** Clé étrangère vers la table Books */
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Loan;
