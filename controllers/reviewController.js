const { validationResult } = require("express-validator");
const Review = require("../models/Review");
const User = require("../models/User");
const Book = require("../models/Book");

const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment, userId, bookId } = req.body;

    const review = await Review.create({ rating, comment, userId, bookId });

    res.status(201).json({
      message: "Avis créé avec succès",
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création de l'avis",
      error: error.message,
    });
  }
};

const getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 5, bookId, rating } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (bookId) where.bookId = bookId;
    if (rating) where.rating = rating;

    const reviews = await Review.findAndCountAll({
      where,
      include: [
        { model: User, attributes: { exclude: ["password"] } },
        { model: Book },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des avis",
      error: error.message,
    });
  }
};

const getReviewById = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [
        { model: User, attributes: { exclude: ["password"] } },
        { model: Book },
      ],
    });

    if (!review) {
      return res.status(404).json({ message: "Avis introuvable" });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération de l'avis",
      error: error.message,
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Avis introuvable" });
    }

    await review.update(req.body);

    res.json({
      message: "Avis mis à jour avec succès",
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour de l'avis",
      error: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Avis introuvable" });
    }

    await review.destroy();

    res.json({ message: "Avis supprimé avec succès" });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de l'avis",
      error: error.message,
    });
  }
};

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
};
