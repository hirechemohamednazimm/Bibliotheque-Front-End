const express = require("express");
const router = express.Router();
const verifierToken = require("../authentification/verifierToken");
const autorisation = require("../authentification/autorisation");
const loanValidation = require("../validations/loanValidation");
const {
  loanListView,
  addLoanForm,
  addLoanView,
  editLoanForm,
  updateLoanView,
  deleteLoanView,
} = require("../controllers/loanController");

router.use(verifierToken);

// Accessible à tous les utilisateurs connectés
router.get("/", loanListView);
router.get("/add", addLoanForm);
router.post("/add", loanValidation, addLoanView);

// Réservé aux admins uniquement
router.get("/edit/:id", autorisation("admin"), editLoanForm);
router.put("/edit/:id", autorisation("admin"), loanValidation, updateLoanView);
router.delete("/delete/:id", autorisation("admin"), deleteLoanView);

module.exports = router;
