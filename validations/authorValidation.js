const { body } = require("express-validator");

const authorValidation = [
  body("name").notEmpty().withMessage("Le nom de l'auteur est requis").isLength({ min: 2 }).withMessage("Le nom doit contenir au moins 2 caractères"),
  body("bio").optional().isLength({ min: 10 }).withMessage("La biographie doit contenir au moins 10 caractères"),
];

module.exports = authorValidation;
