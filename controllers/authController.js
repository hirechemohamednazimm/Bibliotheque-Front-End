/**
 * @file authController.js
 * @description Contrôleur d'authentification pour l'API REST.
 *
 * Gère l'inscription et la connexion via JSON.
 * Pour la connexion côté interface web (EJS), voir authentification/login.js.
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Role = require("../models/Role");

/**
 * [API] Inscrit un nouvel utilisateur.
 *
 * @route POST /api/auth/register
 * @param {import('express').Request} req - Body : { fullname, email, password, roleId }
 * @param {import('express').Response} res - 201 avec l'utilisateur créé, 400 si email déjà utilisé.
 */
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, roleId } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email existe déjà" });
    }

    // Hacher le mot de passe avant stockage (10 rounds de salage)
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ fullname, email, password: hashedPassword, roleId });

    res.status(201).json({ message: "Utilisateur créé avec succès", user });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de l'utilisateur", error: error.message });
  }
};

/**
 * [API] Connecte un utilisateur et retourne un JWT.
 *
 * Le token JWT retourné doit être envoyé dans le header des requêtes protégées :
 * `Authorization: Bearer <token>`
 *
 * @route POST /api/auth/login
 * @param {import('express').Request} req - Body : { email, password }
 * @param {import('express').Response} res - 200 avec le token, 401 si credentials invalides.
 */
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Charger l'utilisateur avec son rôle pour l'inclure dans le token
    const user = await User.findOne({ where: { email }, include: Role });

    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) return res.status(401).json({ message: "Mot de passe incorrect" });

    // Créer le JWT avec les informations essentielles (expire en 1 jour)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.Role.name },
      process.env.CODE_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    res.json({ message: "Connexion réussie", token });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du login", error: error.message });
  }
};

module.exports = { register, login };
