const { body } = require("express-validator");

const categoryValidation = [
  body("name").notEmpty().withMessage("Le nom de la catégorie est requis").isLength({ min: 2 }).withMessage("Le nom doit contenir au moins 2 caractères"),
];

module.exports = categoryValidation;
