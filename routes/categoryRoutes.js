const express = require("express");
const router = express.Router();
const { createCategory, getCategories } = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");
const { categoryValidator } = require("../validators/categoryValidator");

router.post("/", authMiddleware, categoryValidator, createCategory);
router.get("/", authMiddleware, getCategories);

module.exports = router;