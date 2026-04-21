const express = require("express");
const router = express.Router();
const { loginForm, loginPost, logout } = require("../authentification/login");
const loginValidation = require("../validations/loginValidation");

router.get("/login", loginForm);
router.post("/login", loginValidation, loginPost);
router.get("/logout", logout);

module.exports = router;
