const express = require("express");
const router = express.Router();
const {
  createFine,
  getFines,
  getFineById,
  updateFine,
  deleteFine,
} = require("../controllers/fineController");
const authMiddleware = require("../middleware/authMiddleware");
const { fineValidator } = require("../validators/fineValidator");

router.post("/", authMiddleware, fineValidator, createFine);
router.get("/", authMiddleware, getFines);
router.get("/:id", authMiddleware, getFineById);
router.put("/:id", authMiddleware, fineValidator, updateFine);
router.delete("/:id", authMiddleware, deleteFine);

module.exports = router;
