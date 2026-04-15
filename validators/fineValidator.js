const { body } = require("express-validator");

const fineValidator = [
  body("amount")
    .notEmpty().withMessage("Le montant est obligatoire")
    .isDecimal({ decimal_digits: "0,2" }).withMessage("Le montant doit être un nombre décimal valide"),
  body("reason")
    .notEmpty().withMessage("La raison est obligatoire")
    .isLength({ min: 3, max: 255 }).withMessage("La raison doit contenir entre 3 et 255 caractères"),
  body("status")
    .optional()
    .isIn(["unpaid", "paid"]).withMessage("Le statut doit être unpaid ou paid"),
  body("paidDate")
    .optional()
    .isDate().withMessage("La date de paiement doit être une date valide"),
  body("loanId")
    .isInt({ min: 1 }).withMessage("loanId doit être un entier valide"),
  body("userId")
    .isInt({ min: 1 }).withMessage("userId doit être un entier valide"),
];

module.exports = { fineValidator };
