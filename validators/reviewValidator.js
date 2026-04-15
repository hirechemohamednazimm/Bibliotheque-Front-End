const { body } = require("express-validator");

const reviewValidator = [
  body("rating")
    .notEmpty().withMessage("La note est obligatoire")
    .isInt({ min: 1, max: 5 }).withMessage("La note doit être un entier entre 1 et 5"),
  body("comment")
    .optional()
    .isLength({ max: 1000 }).withMessage("Le commentaire ne peut pas dépasser 1000 caractères"),
  body("userId")
    .isInt({ min: 1 }).withMessage("userId doit être un entier valide"),
  body("bookId")
    .isInt({ min: 1 }).withMessage("bookId doit être un entier valide"),
];

module.exports = { reviewValidator };
