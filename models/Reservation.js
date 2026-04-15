const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Reservation = sequelize.define("Reservation", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  reservationDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  expiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "confirmed", "cancelled", "expired"),
    allowNull: false,
    defaultValue: "pending",
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

module.exports = Reservation;
