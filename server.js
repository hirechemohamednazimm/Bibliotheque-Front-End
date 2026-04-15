const express = require("express");
const sequelize = require("./config/db");

const Role = require("./models/Role");
const User = require("./models/User");
const Author = require("./models/Author");
const Category = require("./models/Category");
const Book = require("./models/Book");
const Loan = require("./models/Loan");
const Reservation = require("./models/Reservation");
const Review = require("./models/Review");
const Fine = require("./models/Fine");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const authorRoutes = require("./routes/authorRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const bookRoutes = require("./routes/bookRoutes");
const loanRoutes = require("./routes/loanRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const fineRoutes = require("./routes/fineRoutes");

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/fines", fineRoutes);

app.get("/", (req, res) => {
  res.send("Serveur fonctionne !");
});

// Relations existantes
Role.hasMany(User, { foreignKey: "roleId" });
User.belongsTo(Role, { foreignKey: "roleId" });

Author.hasMany(Book, { foreignKey: "authorId" });
Book.belongsTo(Author, { foreignKey: "authorId" });

Category.hasMany(Book, { foreignKey: "categoryId" });
Book.belongsTo(Category, { foreignKey: "categoryId" });

User.hasMany(Loan, { foreignKey: "userId" });
Loan.belongsTo(User, { foreignKey: "userId" });

Book.hasMany(Loan, { foreignKey: "bookId" });
Loan.belongsTo(Book, { foreignKey: "bookId" });

// Nouvelles relations
User.hasMany(Reservation, { foreignKey: "userId" });
Reservation.belongsTo(User, { foreignKey: "userId" });

Book.hasMany(Reservation, { foreignKey: "bookId" });
Reservation.belongsTo(Book, { foreignKey: "bookId" });

User.hasMany(Review, { foreignKey: "userId" });
Review.belongsTo(User, { foreignKey: "userId" });

Book.hasMany(Review, { foreignKey: "bookId" });
Review.belongsTo(Book, { foreignKey: "bookId" });

User.hasMany(Fine, { foreignKey: "userId" });
Fine.belongsTo(User, { foreignKey: "userId" });

Loan.hasMany(Fine, { foreignKey: "loanId" });
Fine.belongsTo(Loan, { foreignKey: "loanId" });

sequelize.sync()
  .then(async () => {
    console.log("Connexion MySQL réussie ✅");

    await Role.findOrCreate({ where: { name: "admin" } });
    await Role.findOrCreate({ where: { name: "user" } });

    console.log("Rôles OK ✅");

    app.listen(5000, () => {
      console.log("Serveur lancé sur http://localhost:5000");
    });
  })
  .catch((err) => {
    console.error("Erreur ❌", err);
  });
