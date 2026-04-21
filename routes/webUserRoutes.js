const express = require("express");
const router = express.Router();
const verifierToken = require("../authentification/verifierToken");
const autorisation = require("../authentification/autorisation");
const { body } = require("express-validator");
const {
  userListView,
  addUserForm,
  addUserView,
  editUserForm,
  updateUserView,
  deleteUserView,
} = require("../controllers/userController");

const editValidation = [
  body("fullname").notEmpty().withMessage("Le nom complet est requis"),
  body("email").isEmail().withMessage("Email invalide"),
];

const addValidation = [
  body("fullname").notEmpty().withMessage("Le nom complet est requis"),
  body("email").isEmail().withMessage("Email invalide"),
  body("password").isLength({ min: 6 }).withMessage("Mot de passe : minimum 6 caractères"),
];

router.use(verifierToken);

// Toutes les opérations sur les utilisateurs sont réservées aux admins
router.get("/", autorisation("admin"), userListView);
router.get("/add", autorisation("admin"), addUserForm);
router.post("/add", autorisation("admin"), addValidation, addUserView);
router.get("/edit/:id", autorisation("admin"), editUserForm);
router.put("/edit/:id", autorisation("admin"), editValidation, updateUserView);
router.delete("/delete/:id", autorisation("admin"), deleteUserView);

module.exports = router;
