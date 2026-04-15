const express = require("express");
const router = express.Router();
const {
  createReservation,
  getReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
} = require("../controllers/reservationController");
const authMiddleware = require("../middleware/authMiddleware");
const { reservationValidator } = require("../validators/reservationValidator");

router.post("/", authMiddleware, reservationValidator, createReservation);
router.get("/", authMiddleware, getReservations);
router.get("/:id", authMiddleware, getReservationById);
router.put("/:id", authMiddleware, reservationValidator, updateReservation);
router.delete("/:id", authMiddleware, deleteReservation);

module.exports = router;
