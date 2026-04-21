const express = require("express");
const router = express.Router();
const verifierToken = require("../authentification/verifierToken");
const autorisation = require("../authentification/autorisation");
const categoryValidation = require("../validations/categoryValidation");
const {
  categoryListView,
  addCategoryForm,
  addCategoryView,
  editCategoryForm,
  updateCategoryView,
  deleteCategoryView,
} = require("../controllers/categoryController");

router.use(verifierToken);

// Accessible à tous les utilisateurs connectés
router.get("/", categoryListView);

// Réservé aux admins uniquement
router.get("/add", autorisation("admin"), addCategoryForm);
router.post("/add", autorisation("admin"), categoryValidation, addCategoryView);
router.get("/edit/:id", autorisation("admin"), editCategoryForm);
router.put("/edit/:id", autorisation("admin"), categoryValidation, updateCategoryView);
router.delete("/delete/:id", autorisation("admin"), deleteCategoryView);

module.exports = router;
