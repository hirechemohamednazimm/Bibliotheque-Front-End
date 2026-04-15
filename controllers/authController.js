const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Role = require("../models/Role");

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, roleId } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: "Cet email existe déjà",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullname,
      email,
      password: hashedPassword,
      roleId,
    });

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création de l'utilisateur",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: Role,
    });

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur non trouvé",
      });
    }

    const passwordOk = await bcrypt.compare(password, user.password);

    if (!passwordOk) {
      return res.status(401).json({
        message: "Mot de passe incorrect",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.Role.name,
      },
      "secret123",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Connexion réussie",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors du login",
      error: error.message,
    });
  }
};

module.exports = { register, login };