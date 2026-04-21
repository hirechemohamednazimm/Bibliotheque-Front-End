const { validationResult } = require("express-validator");
const Reservation = require("../models/Reservation");
const User = require("../models/User");
const Book = require("../models/Book");
const paginate = require("../helpers/paginate");

// --- API ---
const createReservation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { reservationDate, expiryDate, status, userId, bookId } = req.body;
    const reservation = await Reservation.create({ reservationDate, expiryDate, status, userId, bookId });
    res.status(201).json({ message: "Réservation créée avec succès", reservation });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de la réservation", error: error.message });
  }
};

const getReservations = async (req, res) => {
  try {
    const { page = 1, limit = 5, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;
    const reservations = await Reservation.findAndCountAll({
      where,
      include: [{ model: User, attributes: { exclude: ["password"] } }, { model: Book }],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des réservations", error: error.message });
  }
};

const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id, {
      include: [{ model: User, attributes: { exclude: ["password"] } }, { model: Book }],
    });
    if (!reservation) return res.status(404).json({ message: "Réservation introuvable" });
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de la réservation", error: error.message });
  }
};

const updateReservation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Réservation introuvable" });
    await reservation.update(req.body);
    res.json({ message: "Réservation mise à jour avec succès", reservation });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de la réservation", error: error.message });
  }
};

const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Réservation introuvable" });
    await reservation.destroy();
    res.json({ message: "Réservation supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de la réservation", error: error.message });
  }
};

// --- EJS Views ---
const reservationListView = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const { limit, offset } = paginate(page, 10);
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    const where = {};
    if (loggedUser && loggedUser.role !== "admin") {
      where.userId = loggedUser.id;
    }

    const { count, rows: reservations } = await Reservation.findAndCountAll({
      where,
      include: [{ model: User, attributes: { exclude: ["password"] } }, { model: Book }],
      limit,
      offset,
    });
    res.render("reservations/reservation-list", {
      title: "Mes réservations",
      reservations,
      count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      loggedUser,
    });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const addReservationForm = async (req, res) => {
  try {
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const books = await Book.findAll();

    let users = null;
    if (loggedUser && loggedUser.role === "admin") {
      users = await User.findAll({ attributes: { exclude: ["password"] } });
    }

    const today = new Date().toISOString().split("T")[0];
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    res.render("reservations/add-reservation", {
      title: "Ajouter une réservation",
      users,
      books,
      errors: [],
      loggedUser,
      today,
      expiryDate,
    });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const addReservationView = async (req, res) => {
  const errors = validationResult(req);
  const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;

  if (!errors.isEmpty()) {
    const books = await Book.findAll();
    let users = null;
    if (loggedUser && loggedUser.role === "admin") {
      users = await User.findAll({ attributes: { exclude: ["password"] } });
    }
    const today = new Date().toISOString().split("T")[0];
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    return res.render("reservations/add-reservation", {
      title: "Ajouter une réservation",
      users,
      books,
      errors: errors.array(),
      loggedUser,
      today,
      expiryDate,
    });
  }
  try {
    const { reservationDate, expiryDate, bookId } = req.body;
    const userId =
      loggedUser && loggedUser.role === "admin" && req.body.userId
        ? req.body.userId
        : req.userId;
    await Reservation.create({ reservationDate, expiryDate: expiryDate || null, status: "pending", userId, bookId });
    res.redirect("/reservations");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const editReservationForm = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id, { include: [User, Book] });
    if (!reservation) return res.redirect("/reservations");
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    const books = await Book.findAll();
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    res.render("reservations/edit-reservation", { title: "Modifier la réservation", reservation, users, books, errors: [], loggedUser });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const updateReservationView = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const reservation = await Reservation.findByPk(req.params.id);
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    const books = await Book.findAll();
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    return res.render("reservations/edit-reservation", { title: "Modifier la réservation", reservation, users, books, errors: errors.array(), loggedUser });
  }
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) return res.redirect("/reservations");
    await reservation.update(req.body);
    res.redirect("/reservations");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const deleteReservationView = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (reservation) await reservation.destroy();
    res.redirect("/reservations");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

module.exports = {
  createReservation,
  getReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
  reservationListView,
  addReservationForm,
  addReservationView,
  editReservationForm,
  updateReservationView,
  deleteReservationView,
};
