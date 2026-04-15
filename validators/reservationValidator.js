const { body } = require("express-validator");

const reservationValidator = [
  body("reservationDate")
    .notEmpty().withMessage("La date de réservation est obligatoire")
    .isDate().withMessage("La date de réservation doit être une date valide"),
  body("expiryDate")
    .notEmpty().withMessage("La date d'expiration est obligatoire")
    .isDate().withMessage("La date d'expiration doit être une date valide"),
  body("status")
    .optional()
    .isIn(["pending", "confirmed", "cancelled", "expired"])
    .withMessage("Le statut doit être pending, confirmed, cancelled ou expired"),
  body("userId")
    .isInt({ min: 1 }).withMessage("userId doit être un entier valide"),
  body("bookId")
    .isInt({ min: 1 }).withMessage("bookId doit être un entier valide"),
];

module.exports = { reservationValidator };
