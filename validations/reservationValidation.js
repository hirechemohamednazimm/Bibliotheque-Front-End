const { body } = require("express-validator");

const reservationValidation = [
  body("reservationDate").notEmpty().withMessage("La date de réservation est requise").isISO8601().withMessage("Date invalide"),
  body("expiryDate").notEmpty().withMessage("La date d'expiration est requise").isISO8601().withMessage("Date invalide"),
  body("status").optional().isIn(["pending", "confirmed", "cancelled", "expired"]).withMessage("Statut invalide"),
  body("userId").optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }).withMessage("Utilisateur invalide"),
  body("bookId").notEmpty().withMessage("Le livre est requis").isInt({ min: 1 }).withMessage("Livre invalide"),
];

module.exports = reservationValidation;
