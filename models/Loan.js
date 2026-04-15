const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Loan = sequelize.define("Loan", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  loanDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  returnDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "borrowed",
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Loan;