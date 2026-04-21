const express = require("express");
const router = express.Router();
const verifierToken = require("../authentification/verifierToken");
const autorisation = require("../authentification/autorisation");
const reservationValidation = require("../validations/reservationValidation");
const {
  reservationListView,
  addReservationForm,
  addReservationView,
  editReservationForm,
  updateReservationView,
  deleteReservationView,
} = require("../controllers/reservationController");

router.use(verifierToken);

// Accessible à tous les utilisateurs connectés
router.get("/", reservationListView);
router.get("/add", addReservationForm);
router.post("/add", reservationValidation, addReservationView);

// Réservé aux admins uniquement
router.get("/edit/:id", autorisation("admin"), editReservationForm);
router.put("/edit/:id", autorisation("admin"), reservationValidation, updateReservationView);
router.delete("/delete/:id", autorisation("admin"), deleteReservationView);

module.exports = router;
