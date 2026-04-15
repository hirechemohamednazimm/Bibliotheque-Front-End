const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "bibliotheque_db", // nom de ta base
  "root",            // user
  "",                // mot de passe vide par défaut sur XAMPP
  {
    host: "localhost",
    dialect: "mysql",
  }
);

module.exports = sequelize;