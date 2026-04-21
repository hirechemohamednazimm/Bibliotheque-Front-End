const express = require("express");
const router = express.Router();
const verifierToken = require("../authentification/verifierToken");
const autorisation = require("../authentification/autorisation");
const authorValidation = require("../validations/authorValidation");
const upload = require("../helpers/fileLoader");
const {
  authorListView,
  addAuthorForm,
  addAuthorView,
  editAuthorForm,
  updateAuthorView,
  deleteAuthorView,
} = require("../controllers/authorController");

router.use(verifierToken);

// Accessible à tous les utilisateurs connectés
router.get("/", authorListView);

// Réservé aux admins uniquement
router.get("/add", autorisation("admin"), addAuthorForm);
router.post("/add", autorisation("admin"), upload.single("image"), authorValidation, addAuthorView);
router.get("/edit/:id", autorisation("admin"), editAuthorForm);
router.put("/edit/:id", autorisation("admin"), upload.single("image"), authorValidation, updateAuthorView);
router.delete("/delete/:id", autorisation("admin"), deleteAuthorView);

module.exports = router;
