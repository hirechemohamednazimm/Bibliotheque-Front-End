const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Author = sequelize.define("Author", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  /** Photo de l'auteur (upload via Multer) */
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Author;
