const { validationResult } = require("express-validator");
const Book = require("../models/Book");
const Author = require("../models/Author");
const Category = require("../models/Category");

const createBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, isbn, publishedYear, authorId, categoryId } = req.body;

    const book = await Book.create({
      title,
      isbn,
      publishedYear,
      authorId,
      categoryId,
    });

    res.status(201).json({
      message: "Livre créé avec succès",
      book,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création du livre",
      error: error.message,
    });
  }
};

const getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 5, title } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (title) {
      where.title = title;
    }

    const books = await Book.findAndCountAll({
      where,
      include: [Author, Category],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json(books);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des livres",
      error: error.message,
    });
  }
};

module.exports = { createBook, getBooks };