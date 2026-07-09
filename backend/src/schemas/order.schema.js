const Joi = require('joi');

const orderSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  name: Joi.string().min(2).max(80).required(),
  phone: Joi.string().min(6).max(30).required(),
  address: Joi.string().min(5).max(160).required(),
  message: Joi.string().allow('').max(600),
  license: Joi.any().optional()
});

const subscriptionSchema = Joi.object({
  email: Joi.string().email().required(),
  agreement: Joi.any().optional()
});

module.exports = {
  orderSchema,
  subscriptionSchema
};
