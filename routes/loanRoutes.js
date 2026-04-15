const express = require("express");
const router = express.Router();
const { createLoan, getLoans } = require("../controllers/loanController");
const authMiddleware = require("../middleware/authMiddleware");
const { loanValidator } = require("../validators/loanValidator");

router.post("/", authMiddleware, loanValidator, createLoan);
router.get("/", authMiddleware, getLoans);

module.exports = router;