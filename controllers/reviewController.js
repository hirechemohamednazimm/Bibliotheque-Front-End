const { validationResult } = require("express-validator");
const { Review, User, Book } = require("../models/relation");
const paginate = require("../helpers/paginate");

// --- API ---
const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { rating, comment, userId, bookId } = req.body;
    const review = await Review.create({ rating, comment, userId, bookId });
    res.status(201).json({ message: "Avis créé avec succès", review });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de l'avis", error: error.message });
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
      include: [{ model: User, attributes: { exclude: ["password"] } }, { model: Book }],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des avis", error: error.message });
  }
};

const getReviewById = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [{ model: User, attributes: { exclude: ["password"] } }, { model: Book }],
    });
    if (!review) return res.status(404).json({ message: "Avis introuvable" });
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de l'avis", error: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: "Avis introuvable" });
    await review.update(req.body);
    res.json({ message: "Avis mis à jour avec succès", review });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'avis", error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: "Avis introuvable" });
    await review.destroy();
    res.json({ message: "Avis supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de l'avis", error: error.message });
  }
};

// --- EJS Views ---
const reviewListView = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const { limit, offset } = paginate(page, 10);
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    const { count, rows: reviews } = await Review.findAndCountAll({
      include: [{ model: User, attributes: { exclude: ["password"] } }, { model: Book }],
      limit,
      offset,
    });
    res.render("reviews/review-list", {
      title: "Avis",
      reviews,
      count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      loggedUser,
    });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const addReviewForm = async (req, res) => {
  try {
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const books = await Book.findAll();

    let users = null;
    if (loggedUser && loggedUser.role === "admin") {
      users = await User.findAll({ attributes: { exclude: ["password"] } });
    }

    res.render("reviews/add-review", { title: "Ajouter un avis", users, books, errors: [], loggedUser });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const addReviewView = async (req, res) => {
  const errors = validationResult(req);
  const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;

  if (!errors.isEmpty()) {
    const books = await Book.findAll();
    let users = null;
    if (loggedUser && loggedUser.role === "admin") {
      users = await User.findAll({ attributes: { exclude: ["password"] } });
    }
    return res.render("reviews/add-review", { title: "Ajouter un avis", users, books, errors: errors.array(), loggedUser });
  }
  try {
    const { rating, comment, bookId } = req.body;
    const userId =
      loggedUser && loggedUser.role === "admin" && req.body.userId
        ? req.body.userId
        : req.userId;
    await Review.create({ rating, comment, userId, bookId });
    res.redirect("/reviews");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const editReviewForm = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, { include: [User, Book] });
    if (!review) return res.redirect("/reviews");
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    const books = await Book.findAll();
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    res.render("reviews/edit-review", { title: "Modifier l'avis", review, users, books, errors: [], loggedUser });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const updateReviewView = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const review = await Review.findByPk(req.params.id);
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    const books = await Book.findAll();
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    return res.render("reviews/edit-review", { title: "Modifier l'avis", review, users, books, errors: errors.array(), loggedUser });
  }
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.redirect("/reviews");
    await review.update(req.body);
    res.redirect("/reviews");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const deleteReviewView = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (review) await review.destroy();
    res.redirect("/reviews");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  reviewListView,
  addReviewForm,
  addReviewView,
  editReviewForm,
  updateReviewView,
  deleteReviewView,
};
