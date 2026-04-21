const { validationResult } = require("express-validator");
const { Author } = require("../models/relation");
const paginate = require("../helpers/paginate");

// --- API ---
const createAuthor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, bio } = req.body;
    const author = await Author.create({ name, bio });
    res.status(201).json({ message: "Auteur créé avec succès", author });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de l'auteur", error: error.message });
  }
};

const getAuthors = async (req, res) => {
  try {
    const { page = 1, limit = 5, name } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (name) where.name = name;
    const authors = await Author.findAndCountAll({ where, limit: parseInt(limit), offset: parseInt(offset) });
    res.json(authors);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des auteurs", error: error.message });
  }
};

// --- EJS Views ---
const authorListView = async (req, res) => {
  try {
    const { page = 1, search = "" } = req.query;
    const { limit, offset } = paginate(page, 10);
    const where = {};
    if (search) where.name = search;

    const { count, rows: authors } = await Author.findAndCountAll({ where, limit, offset });
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    res.render("authors/author-list", {
      title: "Auteurs",
      authors,
      count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      search,
      loggedUser,
    });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const addAuthorForm = (req, res) => {
  const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  res.render("authors/add-author", { title: "Ajouter un auteur", errors: [], loggedUser });
};

const addAuthorView = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    return res.render("authors/add-author", { title: "Ajouter un auteur", errors: errors.array(), loggedUser });
  }
  try {
    const { name, bio } = req.body;
    const image = req.file ? "/images/" + req.file.filename : null;
    await Author.create({ name, bio, image });
    res.redirect("/authors");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const editAuthorForm = async (req, res) => {
  try {
    const author = await Author.findByPk(req.params.id);
    if (!author) return res.redirect("/authors");
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    res.render("authors/edit-author", { title: "Modifier l'auteur", author, errors: [], loggedUser });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const updateAuthorView = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const author = await Author.findByPk(req.params.id);
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    return res.render("authors/edit-author", { title: "Modifier l'auteur", author, errors: errors.array(), loggedUser });
  }
  try {
    const author = await Author.findByPk(req.params.id);
    if (!author) return res.redirect("/authors");
    const { name, bio } = req.body;
    const image = req.file ? "/images/" + req.file.filename : author.image;
    await author.update({ name, bio, image });
    res.redirect("/authors");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const deleteAuthorView = async (req, res) => {
  try {
    const author = await Author.findByPk(req.params.id);
    if (author) await author.destroy();
    res.redirect("/authors");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

module.exports = {
  createAuthor,
  getAuthors,
  authorListView,
  addAuthorForm,
  addAuthorView,
  editAuthorForm,
  updateAuthorView,
  deleteAuthorView,
};
