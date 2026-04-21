const { body } = require("express-validator");

const reviewValidation = [
  body("rating")
    .notEmpty().withMessage("La note est requise")
    .isInt({ min: 1, max: 5 }).withMessage("La note doit être entre 1 et 5"),
  body("comment").optional().isLength({ min: 5 }).withMessage("Le commentaire doit contenir au moins 5 caractères"),
  body("userId").optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }).withMessage("Utilisateur invalide"),
  body("bookId").notEmpty().withMessage("Le livre est requis").isInt({ min: 1 }).withMessage("Livre invalide"),
];

module.exports = reviewValidation;
