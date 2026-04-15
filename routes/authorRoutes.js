const express = require("express");
const router = express.Router();
const { createAuthor, getAuthors } = require("../controllers/authorController");
const authMiddleware = require("../middleware/authMiddleware");
const { authorValidator } = require("../validators/authorValidator");

router.post("/", authMiddleware, authorValidator, createAuthor);
router.get("/", authMiddleware, getAuthors);

module.exports = router;