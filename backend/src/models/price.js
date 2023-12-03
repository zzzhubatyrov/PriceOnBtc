const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Подключение к базе данных

const Price = sequelize.define('price', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  updated: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rateFloat: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {timestamps: false});

module.exports = Price;
