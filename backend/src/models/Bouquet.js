const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Bouquet = sequelize.define('Bouquet', {
  title: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  favorite: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  photoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  alt: {
    type: DataTypes.STRING(160),
    allowNull: false
  }
}, {
  tableName: 'bouquets'
});

module.exports = Bouquet;
