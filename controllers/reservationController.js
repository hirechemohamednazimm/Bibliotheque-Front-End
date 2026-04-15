const { validationResult } = require("express-validator");
const Reservation = require("../models/Reservation");
const User = require("../models/User");
const Book = require("../models/Book");

const createReservation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reservationDate, expiryDate, status, userId, bookId } = req.body;

    const reservation = await Reservation.create({
      reservationDate,
      expiryDate,
      status,
      userId,
      bookId,
    });

    res.status(201).json({
      message: "Réservation créée avec succès",
      reservation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création de la réservation",
      error: error.message,
    });
  }
};

const getReservations = async (req, res) => {
  try {
    const { page = 1, limit = 5, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }

    const reservations = await Reservation.findAndCountAll({
      where,
      include: [
        { model: User, attributes: { exclude: ["password"] } },
        { model: Book },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json(reservations);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des réservations",
      error: error.message,
    });
  }
};

const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id, {
      include: [
        { model: User, attributes: { exclude: ["password"] } },
        { model: Book },
      ],
    });

    if (!reservation) {
      return res.status(404).json({ message: "Réservation introuvable" });
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération de la réservation",
      error: error.message,
    });
  }
};

const updateReservation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reservation = await Reservation.findByPk(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "Réservation introuvable" });
    }

    await reservation.update(req.body);

    res.json({
      message: "Réservation mise à jour avec succès",
      reservation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la réservation",
      error: error.message,
    });
  }
};

const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "Réservation introuvable" });
    }

    await reservation.destroy();

    res.json({ message: "Réservation supprimée avec succès" });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de la réservation",
      error: error.message,
    });
  }
};

module.exports = {
  createReservation,
  getReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
};
