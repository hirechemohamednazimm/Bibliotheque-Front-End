const { validationResult } = require("express-validator");
const Category = require("../models/Category");

const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;

    const category = await Category.create({
      name,
    });

    res.status(201).json({
      message: "Catégorie créée avec succès",
      category,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création de la catégorie",
      error: error.message,
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 5, name } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (name) {
      where.name = name;
    }

    const categories = await Category.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des catégories",
      error: error.message,
    });
  }
};

module.exports = { createCategory, getCategories };