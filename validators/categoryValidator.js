const { body } = require("express-validator");

const categoryValidator = [
  body("name").notEmpty().withMessage("Le nom de la catégorie est obligatoire"),
];

module.exports = { categoryValidator };