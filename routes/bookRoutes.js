const express = require("express");
const router = express.Router();
const { createBook, getBooks } = require("../controllers/bookController");
const authMiddleware = require("../middleware/authMiddleware");
const { bookValidator } = require("../validators/bookValidator");

router.post("/", authMiddleware, bookValidator, createBook);
router.get("/", authMiddleware, getBooks);

module.exports = router;