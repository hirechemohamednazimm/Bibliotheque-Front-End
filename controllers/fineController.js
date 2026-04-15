const { validationResult } = require("express-validator");
const Fine = require("../models/Fine");
const User = require("../models/User");
const Loan = require("../models/Loan");

const createFine = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, reason, status, paidDate, loanId, userId } = req.body;

    const fine = await Fine.create({ amount, reason, status, paidDate, loanId, userId });

    res.status(201).json({
      message: "Amende créée avec succès",
      fine,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création de l'amende",
      error: error.message,
    });
  }
};

const getFines = async (req, res) => {
  try {
    const { page = 1, limit = 5, status, userId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const fines = await Fine.findAndCountAll({
      where,
      include: [
        { model: User, attributes: { exclude: ["password"] } },
        { model: Loan },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json(fines);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des amendes",
      error: error.message,
    });
  }
};

const getFineById = async (req, res) => {
  try {
    const fine = await Fine.findByPk(req.params.id, {
      include: [
        { model: User, attributes: { exclude: ["password"] } },
        { model: Loan },
      ],
    });

    if (!fine) {
      return res.status(404).json({ message: "Amende introuvable" });
    }

    res.json(fine);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération de l'amende",
      error: error.message,
    });
  }
};

const updateFine = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const fine = await Fine.findByPk(req.params.id);

    if (!fine) {
      return res.status(404).json({ message: "Amende introuvable" });
    }

    await fine.update(req.body);

    res.json({
      message: "Amende mise à jour avec succès",
      fine,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour de l'amende",
      error: error.message,
    });
  }
};

const deleteFine = async (req, res) => {
  try {
    const fine = await Fine.findByPk(req.params.id);

    if (!fine) {
      return res.status(404).json({ message: "Amende introuvable" });
    }

    await fine.destroy();

    res.json({ message: "Amende supprimée avec succès" });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de l'amende",
      error: error.message,
    });
  }
};

module.exports = {
  createFine,
  getFines,
  getFineById,
  updateFine,
  deleteFine,
};
