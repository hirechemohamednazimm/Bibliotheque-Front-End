/**
 * @file bookController.js
 * @description Contrôleur pour la gestion des livres.
 *
 * Contient deux types de méthodes :
 * - **API** : retournent du JSON, utilisées par les routes /api/books
 * - **EJS (Vue)** : rendent des templates HTML, utilisées par les routes /books
 *
 * Chaque livre est lié à un auteur (Author) et une catégorie (Category).
 */

const { validationResult } = require("express-validator");
const { Book, Author, Category, Loan } = require("../models/relation");
const paginate = require("../helpers/paginate");

// ============================================================
// API — Retournent du JSON
// ============================================================

/**
 * [API] Crée un nouveau livre.
 *
 * @route POST /api/books
 * @access Authentifié (Bearer token)
 * @param {import('express').Request} req - Body : { title, isbn, publishedYear, authorId, categoryId }
 * @param {import('express').Response} res - 201 avec le livre créé, ou 400/500 en cas d'erreur.
 */
const createBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, isbn, publishedYear, authorId, categoryId } = req.body;
    const book = await Book.create({ title, isbn, publishedYear, authorId, categoryId });
    res.status(201).json({ message: "Livre créé avec succès", book });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du livre", error: error.message });
  }
};

/**
 * [API] Récupère la liste des livres avec pagination et filtre optionnel par titre.
 *
 * @route GET /api/books?page=1&limit=5&title=Harry
 * @param {import('express').Request} req - Query : { page, limit, title }
 * @param {import('express').Response} res - { count, rows } au format JSON.
 */
const getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 5, title } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (title) where.title = title;
    const books = await Book.findAndCountAll({ where, include: [Author, Category], limit: parseInt(limit), offset: parseInt(offset) });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des livres", error: error.message });
  }
};

// ============================================================
// EJS (Vue) — Rendent des templates HTML
// ============================================================

/**
 * [EJS] Affiche la liste paginée des livres avec barre de recherche.
 *
 * @route GET /books?page=1&search=Harry
 * @param {import('express').Request} req - Query : { page, search }
 * @param {import('express').Response} res - Rend `books/book-list.ejs`
 */
const bookListView = async (req, res) => {
  try {
    const { Op } = require("sequelize");
    const { page = 1, search = "", authorId = "", categoryId = "" } = req.query;
    const { limit, offset } = paginate(page, 10);
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;

    // Récupérer les IDs des livres actuellement empruntés (status = "borrowed")
    const activeLoanBookIds = (await Loan.findAll({
      where: { status: "borrowed" },
      attributes: ["bookId"],
    })).map(l => l.bookId);

    const where = {};
    if (search) where.title = { [Op.like]: `%${search}%` };
    if (authorId) where.authorId = authorId;
    if (categoryId) where.categoryId = categoryId;

    // Les users ne voient que les livres disponibles
    if (!loggedUser || loggedUser.role !== "admin") {
      if (activeLoanBookIds.length > 0) {
        where.id = { [Op.notIn]: activeLoanBookIds };
      }
    }

    const [{ count, rows: books }, authors, categories] = await Promise.all([
      Book.findAndCountAll({ where, include: [Author, Category], limit, offset }),
      Author.findAll({ order: [["name", "ASC"]] }),
      Category.findAll({ order: [["name", "ASC"]] }),
    ]);

    // Pour l'admin : annoter chaque livre avec son statut de disponibilité
    const booksWithAvailability = books.map(b => ({
      ...b.toJSON(),
      isBorrowed: activeLoanBookIds.includes(b.id),
    }));

    res.render("books/book-list", {
      title: "Livres",
      books: booksWithAvailability,
      count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      search,
      authorId,
      categoryId,
      authors,
      categories,
      loggedUser,
    });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

/**
 * [EJS] Affiche le formulaire d'ajout d'un livre.
 * Charge les listes d'auteurs et de catégories pour les menus déroulants.
 *
 * @route GET /books/add
 * @param {import('express').Request} req
 * @param {import('express').Response} res - Rend `books/add-book.ejs`
 */
const addBookForm = async (req, res) => {
  try {
    const authors = await Author.findAll();
    const categories = await Category.findAll();
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    res.render("books/add-book", { title: "Ajouter un livre", authors, categories, errors: [], loggedUser });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

/**
 * [EJS] Traite la soumission du formulaire d'ajout.
 * En cas d'erreur de validation, ré-affiche le formulaire avec les messages d'erreur.
 *
 * @route POST /books/add
 * @param {import('express').Request} req - Body : { title, isbn, publishedYear, authorId, categoryId }
 * @param {import('express').Response} res - Redirige vers /books si succès.
 */
const addBookView = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const authors = await Author.findAll();
    const categories = await Category.findAll();
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    return res.render("books/add-book", { title: "Ajouter un livre", authors, categories, errors: errors.array(), loggedUser });
  }
  try {
    const { title, isbn, publishedYear, authorId, categoryId } = req.body;
    const image = req.file ? "/images/" + req.file.filename : null;
    await Book.create({ title, isbn, publishedYear, authorId, categoryId, image });
    res.redirect("/books");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

/**
 * [EJS] Affiche le formulaire d'édition d'un livre existant.
 *
 * @route GET /books/edit/:id
 * @param {import('express').Request} req - Params : { id }
 * @param {import('express').Response} res - Rend `books/edit-book.ejs` avec les données du livre.
 */
const editBookForm = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, { include: [Author, Category] });
    if (!book) return res.redirect("/books");
    const authors = await Author.findAll();
    const categories = await Category.findAll();
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    res.render("books/edit-book", { title: "Modifier le livre", book, authors, categories, errors: [], loggedUser });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

/**
 * [EJS] Traite la soumission du formulaire d'édition.
 * Utilise method-override (PUT via formulaire HTML POST + ?_method=PUT).
 *
 * @route PUT /books/edit/:id
 * @param {import('express').Request} req - Params : { id }, Body : champs modifiés
 * @param {import('express').Response} res - Redirige vers /books si succès.
 */
const updateBookView = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const book = await Book.findByPk(req.params.id);
    const authors = await Author.findAll();
    const categories = await Category.findAll();
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    return res.render("books/edit-book", { title: "Modifier le livre", book, authors, categories, errors: errors.array(), loggedUser });
  }
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.redirect("/books");
    const { title, isbn, publishedYear, authorId, categoryId } = req.body;
    const image = req.file ? "/images/" + req.file.filename : book.image;
    await book.update({ title, isbn, publishedYear, authorId, categoryId, image });
    res.redirect("/books");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

/**
 * [EJS] Supprime un livre.
 * Utilise method-override (DELETE via formulaire HTML POST + ?_method=DELETE).
 *
 * @route DELETE /books/delete/:id
 * @param {import('express').Request} req - Params : { id }
 * @param {import('express').Response} res - Redirige vers /books.
 */
const deleteBookView = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) await book.destroy();
    res.redirect("/books");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

module.exports = {
  createBook,
  getBooks,
  bookListView,
  addBookForm,
  addBookView,
  editBookForm,
  updateBookView,
  deleteBookView,
};
