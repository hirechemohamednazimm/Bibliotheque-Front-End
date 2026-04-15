const { body } = require("express-validator");

const bookValidator = [
  body("title").notEmpty().withMessage("Le titre est obligatoire"),
  body("isbn").notEmpty().withMessage("Le ISBN est obligatoire"),
  body("authorId").isInt().withMessage("authorId doit être un entier"),
  body("categoryId").isInt().withMessage("categoryId doit être un entier"),
];

module.exports = { bookValidator };