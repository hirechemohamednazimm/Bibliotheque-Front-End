const { body } = require("express-validator");

const registerValidator = [
  body("fullname").notEmpty().withMessage("Le nom complet est obligatoire"),
  body("email").isEmail().withMessage("Email invalide"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
  body("roleId").isInt().withMessage("roleId doit être un entier"),
];

const loginValidator = [
  body("email").isEmail().withMessage("Email invalide"),
  body("password").notEmpty().withMessage("Le mot de passe est obligatoire"),
];

module.exports = { registerValidator, loginValidator };