const { validationResult } = require("express-validator");
const { Category } = require("../models/relation");
const paginate = require("../helpers/paginate");

// --- API ---
const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name } = req.body;
    const category = await Category.create({ name });
    res.status(201).json({ message: "Catégorie créée avec succès", category });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de la catégorie", error: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 5, name } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (name) where.name = name;
    const categories = await Category.findAndCountAll({ where, limit: parseInt(limit), offset: parseInt(offset) });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des catégories", error: error.message });
  }
};

// --- EJS Views ---
const categoryListView = async (req, res) => {
  try {
    const { page = 1, search = "" } = req.query;
    const { limit, offset } = paginate(page, 10);
    const where = {};
    if (search) where.name = search;

    const { count, rows: categories } = await Category.findAndCountAll({ where, limit, offset });
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    res.render("categories/category-list", {
      title: "Catégories",
      categories,
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

const addCategoryForm = (req, res) => {
  const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  res.render("categories/add-category", { title: "Ajouter une catégorie", errors: [], loggedUser });
};

const addCategoryView = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    return res.render("categories/add-category", { title: "Ajouter une catégorie", errors: errors.array(), loggedUser });
  }
  try {
    await Category.create({ name: req.body.name });
    res.redirect("/categories");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const editCategoryForm = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.redirect("/categories");
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    res.render("categories/edit-category", { title: "Modifier la catégorie", category, errors: [], loggedUser });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const updateCategoryView = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const category = await Category.findByPk(req.params.id);
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    return res.render("categories/edit-category", { title: "Modifier la catégorie", category, errors: errors.array(), loggedUser });
  }
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.redirect("/categories");
    await category.update(req.body);
    res.redirect("/categories");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const deleteCategoryView = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (category) await category.destroy();
    res.redirect("/categories");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

module.exports = {
  createCategory,
  getCategories,
  categoryListView,
  addCategoryForm,
  addCategoryView,
  editCategoryForm,
  updateCategoryView,
  deleteCategoryView,
};
