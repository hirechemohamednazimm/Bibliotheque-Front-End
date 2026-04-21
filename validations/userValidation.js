const { body } = require("express-validator");

const userValidation = [
  body("fullname").notEmpty().withMessage("Le nom complet est requis").isLength({ min: 3 }).withMessage("Le nom doit contenir au moins 3 caractères"),
  body("email").notEmpty().withMessage("L'email est requis").isEmail().withMessage("L'email n'est pas valide"),
  body("password").notEmpty().withMessage("Le mot de passe est requis").isLength({ min: 6 }).withMessage("Le mot de passe doit contenir au moins 6 caractères"),
  body("roleId").optional().isInt({ min: 1 }).withMessage("Rôle invalide"),
];

module.exports = userValidation;
