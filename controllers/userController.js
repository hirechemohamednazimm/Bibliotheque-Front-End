const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { User, Role } = require("../models/relation");
const paginate = require("../helpers/paginate");

// --- EJS Views ---
const userListView = async (req, res) => {
  try {
    const { page = 1, search = "" } = req.query;
    const { limit, offset } = paginate(page, 10);
    const where = {};
    if (search) where.fullname = search;

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      include: Role,
      limit,
      offset,
    });
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    res.render("users/user-list", {
      title: "Utilisateurs",
      users,
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

const addUserForm = async (req, res) => {
  try {
    const roles = await Role.findAll();
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    res.render("users/add-user", { title: "Ajouter un utilisateur", roles, errors: [], loggedUser });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const addUserView = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const roles = await Role.findAll();
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    return res.render("users/add-user", { title: "Ajouter un utilisateur", roles, errors: errors.array(), loggedUser });
  }
  try {
    const { fullname, email, password, roleId } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const roles = await Role.findAll();
      const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
      return res.render("users/add-user", {
        title: "Ajouter un utilisateur",
        roles,
        errors: [{ msg: "Cet email existe déjà" }],
        loggedUser,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ fullname, email, password: hashedPassword, roleId });
    res.redirect("/users");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const editUserForm = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
      include: Role,
    });
    if (!user) return res.redirect("/users");
    const roles = await Role.findAll();
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    res.render("users/edit-user", { title: "Modifier l'utilisateur", user, roles, errors: [], loggedUser });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const updateUserView = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ["password"] } });
    const roles = await Role.findAll();
    const loggedUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    return res.render("users/edit-user", { title: "Modifier l'utilisateur", user, roles, errors: errors.array(), loggedUser });
  }
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.redirect("/users");
    const { fullname, email, roleId } = req.body;
    await user.update({ fullname, email, roleId });
    res.redirect("/users");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

const deleteUserView = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) await user.destroy();
    res.redirect("/users");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
};

module.exports = {
  userListView,
  addUserForm,
  addUserView,
  editUserForm,
  updateUserView,
  deleteUserView,
};
