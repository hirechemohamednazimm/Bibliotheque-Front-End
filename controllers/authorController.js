const { validationResult } = require("express-validator");
const Author = require("../models/Author");

const createAuthor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, bio } = req.body;

    const author = await Author.create({
      name,
      bio,
    });

    res.status(201).json({
      message: "Auteur créé avec succès",
      author,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création de l'auteur",
      error: error.message,
    });
  }
};

const getAuthors = async (req, res) => {
  try {
    const { page = 1, limit = 5, name } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (name) {
      where.name = name;
    }

    const authors = await Author.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json(authors);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des auteurs",
      error: error.message,
    });
  }
};

module.exports = { createAuthor, getAuthors };