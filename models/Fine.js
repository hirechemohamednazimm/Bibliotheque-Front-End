const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Fine = sequelize.define("Fine", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("unpaid", "paid"),
    allowNull: false,
    defaultValue: "unpaid",
  },
  paidDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  loanId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Fine;
