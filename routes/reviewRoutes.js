const express = require("express");
const router = express.Router();
const {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");
const { reviewValidator } = require("../validators/reviewValidator");

router.post("/", authMiddleware, reviewValidator, createReview);
router.get("/", authMiddleware, getReviews);
router.get("/:id", authMiddleware, getReviewById);
router.put("/:id", authMiddleware, reviewValidator, updateReview);
router.delete("/:id", authMiddleware, deleteReview);

module.exports = router;
