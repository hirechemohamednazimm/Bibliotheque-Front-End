/**
 * @file User.js
 * @description Modèle Sequelize représentant un utilisateur de la bibliothèque.
 *
 * Relations :
 * - belongsTo Role (via roleId) — chaque utilisateur a un rôle
 * - hasMany Loan    — un utilisateur peut emprunter plusieurs livres
 * - hasMany Reservation
 * - hasMany Review
 * - hasMany Fine
 *
 * Le champ `password` est toujours stocké haché (bcryptjs).
 * Il doit être exclu des réponses avec : `attributes: { exclude: ['password'] }`
 */

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  /** Nom complet de l'utilisateur (ex : "Jean Dupont") */
  fullname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  /** Email unique utilisé pour la connexion */
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  /** Mot de passe haché avec bcryptjs (ne jamais stocker en clair) */
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  /** Clé étrangère vers la table Roles */
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = User;
