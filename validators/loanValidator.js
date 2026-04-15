const { body } = require("express-validator");

const loanValidator = [
  body("loanDate").notEmpty().withMessage("La date d'emprunt est obligatoire"),
  body("userId").isInt().withMessage("userId doit être un entier"),
  body("bookId").isInt().withMessage("bookId doit être un entier"),
];

module.exports = { loanValidator };