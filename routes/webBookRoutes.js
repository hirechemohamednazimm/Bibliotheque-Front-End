const express = require("express");
const router = express.Router();
const verifierToken = require("../authentification/verifierToken");
const autorisation = require("../authentification/autorisation");
const bookValidation = require("../validations/bookValidation");
const upload = require("../helpers/fileLoader");
const {
  bookListView,
  addBookForm,
  addBookView,
  editBookForm,
  updateBookView,
  deleteBookView,
} = require("../controllers/bookController");

// Toutes les routes nécessitent d'être connecté
router.use(verifierToken);

// Accessible à tous les utilisateurs connectés
router.get("/", bookListView);

// Réservé aux admins uniquement
router.get("/add", autorisation("admin"), addBookForm);
router.post("/add", autorisation("admin"), upload.single("image"), bookValidation, addBookView);
router.get("/edit/:id", autorisation("admin"), editBookForm);
router.put("/edit/:id", autorisation("admin"), upload.single("image"), bookValidation, updateBookView);
router.delete("/delete/:id", autorisation("admin"), deleteBookView);

module.exports = router;
