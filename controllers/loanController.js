const { validationResult } = require("express-validator");
const { Loan, User, Book, Author, Category } = require("../models/relation");
const paginate = require("../helpers/paginate");

// --- API ---
const createLoan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { loanDate, returnDate, status, userId, bookId } = req.body;
    const loan = await Loan.create({ loanDate, returnDate, status, userId, bookId });
    res.status(201).json({ message: "Emprunt créé avec succès", loan });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de l'emprunt", error: error.message });
  }
};

const getLoans = async (req, res) => {
  try {
    const { page = 1, limit = 5, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;
    const loans = await Loan.findAndCountAll({
      where,
      include: [{ model: User, attributes: { exclude: ["password"] } }, { model: Book }],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des emprunts", error: error.message });
  }
};

// --- EJS Views ---
const loanListView = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const { limit, offset } = paginate(page, 10);
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    // Un user ne voit que ses propres emprunts, un admin voit tout
    const where = {};
    if (loggedUser && loggedUser.role !== "admin") {
      where.userId = loggedUser.id;
    }

    const { count, rows: loans } = await Loan.findAndCountAll({
      where,
      include: [{ model: User, attributes: { exclude: ["password"] } }, { model: Book }],
      limit,
      offset,
    });

    res.render("loans/loan-list", {
      title: "Mes emprunts",
      loans,
      count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      loggedUser,
    });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const addLoanForm = async (req, res) => {
  try {
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    const books = await Book.findAll({ include: [Author, Category] });

    // Admin peut choisir n'importe quel utilisateur, user emprunte pour lui-même
    let users = null;
    if (loggedUser && loggedUser.role === "admin") {
      users = await User.findAll({ attributes: { exclude: ["password"] } });
    }

    const today = new Date().toISOString().split("T")[0];
    const returnDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    res.render("loans/add-loan", {
      title: "Emprunter un livre",
      users,
      books,
      errors: [],
      loggedUser,
      today,
      returnDate,
    });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const addLoanView = async (req, res) => {
  const errors = validationResult(req);
  const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;

  if (!errors.isEmpty()) {
    const books = await Book.findAll({ include: [Author, Category] });
    let users = null;
    if (loggedUser && loggedUser.role === "admin") {
      users = await User.findAll({ attributes: { exclude: ["password"] } });
    }
    const today = new Date().toISOString().split("T")[0];
    const returnDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    return res.render("loans/add-loan", {
      title: "Emprunter un livre",
      users,
      books,
      errors: errors.array(),
      loggedUser,
      today,
      returnDate,
    });
  }

  try {
    const { loanDate, returnDate, bookId } = req.body;
    // User emprunte toujours pour lui-même, admin peut choisir
    const userId =
      loggedUser && loggedUser.role === "admin" && req.body.userId
        ? req.body.userId
        : req.userId;

    await Loan.create({ loanDate, returnDate: returnDate || null, status: "borrowed", userId, bookId });
    res.redirect("/loans");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const editLoanForm = async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id, { include: [User, Book] });
    if (!loan) return res.redirect("/loans");
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    const books = await Book.findAll();
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    res.render("loans/edit-loan", { title: "Modifier l'emprunt", loan, users, books, errors: [], loggedUser });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const updateLoanView = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const loan = await Loan.findByPk(req.params.id);
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    const books = await Book.findAll();
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    return res.render("loans/edit-loan", { title: "Modifier l'emprunt", loan, users, books, errors: errors.array(), loggedUser });
  }
  try {
    const loan = await Loan.findByPk(req.params.id);
    if (!loan) return res.redirect("/loans");
    await loan.update(req.body);
    res.redirect("/loans");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const deleteLoanView = async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id);
    if (loan) await loan.destroy();
    res.redirect("/loans");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

module.exports = {
  createLoan,
  getLoans,
  loanListView,
  addLoanForm,
  addLoanView,
  editLoanForm,
  updateLoanView,
  deleteLoanView,
};
