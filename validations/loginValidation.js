const { body } = require("express-validator");

const loginValidation = [
  body("email").notEmpty().withMessage("L'email est requis").isEmail().withMessage("L'email n'est pas valide"),
  body("password").notEmpty().withMessage("Le mot de passe est requis").isLength({ min: 6 }).withMessage("Le mot de passe doit contenir au moins 6 caractères"),
];

module.exports = loginValidation;
