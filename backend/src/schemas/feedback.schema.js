const Joi = require('joi');

const feedbackCreateSchema = Joi.object({
  author: Joi.string().min(2).max(80).required(),
  text: Joi.string().min(5).max(700).required(),
  rating: Joi.number().integer().min(1).max(5).default(5)
});

module.exports = {
  feedbackCreateSchema
};
