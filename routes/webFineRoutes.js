const express = require("express");
const router = express.Router();
const verifierToken = require("../authentification/verifierToken");
const autorisation = require("../authentification/autorisation");
const fineValidation = require("../validations/fineValidation");
const {
  fineListView,
  addFineForm,
  addFineView,
  editFineForm,
  updateFineView,
  deleteFineView,
} = require("../controllers/fineController");

router.use(verifierToken);

// Liste visible par tous (filtrée par userId pour les non-admins)
router.get("/", fineListView);
router.get("/add", autorisation("admin"), addFineForm);
router.post("/add", autorisation("admin"), fineValidation, addFineView);
router.get("/edit/:id", autorisation("admin"), editFineForm);
router.put("/edit/:id", autorisation("admin"), fineValidation, updateFineView);
router.delete("/delete/:id", autorisation("admin"), deleteFineView);

module.exports = router;
