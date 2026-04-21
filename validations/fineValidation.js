const { body } = require("express-validator");

const fineValidation = [
  body("amount")
    .notEmpty().withMessage("Le montant est requis")
    .isDecimal({ decimal_digits: "0,2" }).withMessage("Montant invalide"),
  body("reason").notEmpty().withMessage("La raison est requise"),
  body("status").optional().isIn(["unpaid", "paid"]).withMessage("Statut invalide"),
  body("loanId").notEmpty().withMessage("L'emprunt est requis").isInt({ min: 1 }).withMessage("Emprunt invalide"),
  body("userId").notEmpty().withMessage("L'utilisateur est requis").isInt({ min: 1 }).withMessage("Utilisateur invalide"),
];

module.exports = fineValidation;
