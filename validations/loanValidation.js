const { body } = require("express-validator");

const loanValidation = [
  body("loanDate").notEmpty().withMessage("La date d'emprunt est requise").isISO8601().withMessage("Date invalide"),
  body("returnDate").optional().isISO8601().withMessage("La date de retour est invalide"),
  body("userId").optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }).withMessage("Utilisateur invalide"),
  body("bookId").notEmpty().withMessage("Le livre est requis").isInt({ min: 1 }).withMessage("Livre invalide"),
];

module.exports = loanValidation;
