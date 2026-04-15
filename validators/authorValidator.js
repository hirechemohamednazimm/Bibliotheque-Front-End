const { body } = require("express-validator");

const authorValidator = [
  body("name").notEmpty().withMessage("Le nom de l'auteur est obligatoire"),
];

module.exports = { authorValidator };