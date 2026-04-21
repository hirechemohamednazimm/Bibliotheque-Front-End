const { body } = require("express-validator");

const bookValidation = [
  body("title").notEmpty().withMessage("Le titre est requis"),
  body("isbn").notEmpty().withMessage("L'ISBN est requis"),
  body("publishedYear")
    .notEmpty().withMessage("L'année de publication est requise")
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage("L'année doit être valide"),
  body("authorId").notEmpty().withMessage("L'auteur est requis").isInt({ min: 1 }).withMessage("Auteur invalide"),
  body("categoryId").notEmpty().withMessage("La catégorie est requise").isInt({ min: 1 }).withMessage("Catégorie invalide"),
];

module.exports = bookValidation;
