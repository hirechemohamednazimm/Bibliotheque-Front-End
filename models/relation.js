const User = require("./User");
const Role = require("./Role");
const Author = require("./Author");
const Category = require("./Category");
const Book = require("./Book");
const Loan = require("./Loan");
const Review = require("./Review");
const Fine = require("./Fine");

// Relations entre entites

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

User.hasMany(Review, { foreignKey: "userId" });
Review.belongsTo(User, { foreignKey: "userId" });
Book.hasMany(Review, { foreignKey: "bookId" });
Review.belongsTo(Book, { foreignKey: "bookId" });

User.hasMany(Fine, { foreignKey: "userId" });
Fine.belongsTo(User, { foreignKey: "userId" });
Loan.hasMany(Fine, { foreignKey: "loanId" });
Fine.belongsTo(Loan, { foreignKey: "loanId" });

module.exports = { User, Role, Author, Category, Book, Loan, Review, Fine };
