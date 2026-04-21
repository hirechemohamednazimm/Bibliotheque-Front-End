const express = require("express");
const router = express.Router();
const verifierToken = require("../authentification/verifierToken");
const autorisation = require("../authentification/autorisation");
const reviewValidation = require("../validations/reviewValidation");
const {
  reviewListView,
  addReviewForm,
  addReviewView,
  editReviewForm,
  updateReviewView,
  deleteReviewView,
} = require("../controllers/reviewController");

router.use(verifierToken);

// Accessible à tous les utilisateurs connectés
router.get("/", reviewListView);
router.get("/add", addReviewForm);
router.post("/add", reviewValidation, addReviewView);

// Réservé aux admins uniquement
router.get("/edit/:id", autorisation("admin"), editReviewForm);
router.put("/edit/:id", autorisation("admin"), reviewValidation, updateReviewView);
router.delete("/delete/:id", autorisation("admin"), deleteReviewView);

module.exports = router;
