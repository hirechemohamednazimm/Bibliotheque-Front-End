const { validationResult } = require("express-validator");
const { Fine, User, Loan } = require("../models/relation");
const paginate = require("../helpers/paginate");

// --- API ---
const createFine = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { amount, reason, status, paidDate, loanId, userId } = req.body;
    const fine = await Fine.create({ amount, reason, status, paidDate, loanId, userId });
    res.status(201).json({ message: "Amende créée avec succès", fine });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de l'amende", error: error.message });
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
      include: [{ model: User, attributes: { exclude: ["password"] } }, { model: Loan }],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.json(fines);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des amendes", error: error.message });
  }
};

const getFineById = async (req, res) => {
  try {
    const fine = await Fine.findByPk(req.params.id, {
      include: [{ model: User, attributes: { exclude: ["password"] } }, { model: Loan }],
    });
    if (!fine) return res.status(404).json({ message: "Amende introuvable" });
    res.json(fine);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de l'amende", error: error.message });
  }
};

const updateFine = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const fine = await Fine.findByPk(req.params.id);
    if (!fine) return res.status(404).json({ message: "Amende introuvable" });
    await fine.update(req.body);
    res.json({ message: "Amende mise à jour avec succès", fine });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'amende", error: error.message });
  }
};

const deleteFine = async (req, res) => {
  try {
    const fine = await Fine.findByPk(req.params.id);
    if (!fine) return res.status(404).json({ message: "Amende introuvable" });
    await fine.destroy();
    res.json({ message: "Amende supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de l'amende", error: error.message });
  }
};

// --- EJS Views ---
const fineListView = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const { limit, offset } = paginate(page, 10);
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    const where = {};
    if (loggedUser && loggedUser.role !== "admin") {
      where.userId = loggedUser.id;
    }

    const { count, rows: fines } = await Fine.findAndCountAll({
      where,
      include: [{ model: User, attributes: { exclude: ["password"] } }, { model: Loan }],
      limit,
      offset,
    });
    res.render("fines/fine-list", {
      title: "Mes amendes",
      fines,
      count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      loggedUser,
    });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const addFineForm = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    const loans = await Loan.findAll();
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    res.render("fines/add-fine", { title: "Ajouter une amende", users, loans, errors: [], loggedUser });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const addFineView = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    const loans = await Loan.findAll();
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    return res.render("fines/add-fine", { title: "Ajouter une amende", users, loans, errors: errors.array(), loggedUser });
  }
  try {
    const { amount, reason, status, paidDate, loanId, userId } = req.body;
    await Fine.create({ amount, reason, status: status || "unpaid", paidDate: paidDate || null, loanId, userId });
    res.redirect("/fines");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const editFineForm = async (req, res) => {
  try {
    const fine = await Fine.findByPk(req.params.id, { include: [User, Loan] });
    if (!fine) return res.redirect("/fines");
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    const loans = await Loan.findAll();
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    res.render("fines/edit-fine", { title: "Modifier l'amende", fine, users, loans, errors: [], loggedUser });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const updateFineView = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const fine = await Fine.findByPk(req.params.id);
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    const loans = await Loan.findAll();
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    return res.render("fines/edit-fine", { title: "Modifier l'amende", fine, users, loans, errors: errors.array(), loggedUser });
  }
  try {
    const fine = await Fine.findByPk(req.params.id);
    if (!fine) return res.redirect("/fines");
    await fine.update(req.body);
    res.redirect("/fines");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const deleteFineView = async (req, res) => {
  try {
    const fine = await Fine.findByPk(req.params.id);
    if (fine) await fine.destroy();
    res.redirect("/fines");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

module.exports = {
  createFine,
  getFines,
  getFineById,
  updateFine,
  deleteFine,
  fineListView,
  addFineForm,
  addFineView,
  editFineForm,
  updateFineView,
  deleteFineView,
};
