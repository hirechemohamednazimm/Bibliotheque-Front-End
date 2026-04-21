/**
 * @file Book.js
 * @description Modèle Sequelize représentant un livre de la bibliothèque.
 *
 * Relations :
 * - belongsTo Author   (via authorId)
 * - belongsTo Category (via categoryId)
 * - hasMany Loan
 * - hasMany Reservation
 * - hasMany Review
 */

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Book = sequelize.define("Book", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  /** Titre du livre */
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  /** Numéro ISBN unique (International Standard Book Number) */
  isbn: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  /** Année de publication (ex : 2021) */
  publishedYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  /** Clé étrangère vers la table Authors */
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  /** Clé étrangère vers la table Categories */
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  /** Chemin de l'image de couverture (upload via Multer) */
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Book;
