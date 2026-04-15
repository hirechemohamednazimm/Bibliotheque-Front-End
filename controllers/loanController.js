const { validationResult } = require("express-validator");
const Loan = require("../models/Loan");
const User = require("../models/User");
const Book = require("../models/Book");

const createLoan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { loanDate, returnDate, status, userId, bookId } = req.body;

    const loan = await Loan.create({
      loanDate,
      returnDate,
      status,
      userId,
      bookId,
    });

    res.status(201).json({
      message: "Emprunt créé avec succès",
      loan,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création de l'emprunt",
      error: error.message,
    });
  }
};

const getLoans = async (req, res) => {
  try {
    const { page = 1, limit = 5, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }

    const loans = await Loan.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: { exclude: ["password"] },
        },
        {
          model: Book,
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json(loans);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des emprunts",
      error: error.message,
    });
  }
};

module.exports = { createLoan, getLoans };