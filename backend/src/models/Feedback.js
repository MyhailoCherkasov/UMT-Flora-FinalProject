const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Feedback = sequelize.define('Feedback', {
  author: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
  }
}, {
  tableName: 'feedbacks'
});

module.exports = Feedback;
