const Bouquet = require('./Bouquet');
const Feedback = require('./Feedback');
const { sequelize } = require('../config/sequelize');

module.exports = {
  sequelize,
  Bouquet,
  Feedback
};
