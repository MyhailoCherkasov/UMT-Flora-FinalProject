const Joi = require('joi');

const categories = ['romantic', 'classic', 'bright', 'basket'];

const bouquetCreateSchema = Joi.object({
  title: Joi.string().min(2).max(120).required(),
  description: Joi.string().min(10).max(1200).required(),
  price: Joi.number().integer().min(1).max(1000).required(),
  category: Joi.string().valid(...categories).required(),
  favorite: Joi.boolean().default(false),
  photoUrl: Joi.string().allow('', null).optional(),
  image: Joi.string().allow('', null).optional(),
  alt: Joi.string().min(2).max(160).required()
});

const bouquetUpdateSchema = Joi.object({
  title: Joi.string().min(2).max(120),
  description: Joi.string().min(10).max(1200),
  price: Joi.number().integer().min(1).max(1000),
  category: Joi.string().valid(...categories),
  favorite: Joi.boolean(),
  photoUrl: Joi.string().allow('', null),
  image: Joi.string().allow('', null),
  alt: Joi.string().min(2).max(160)
}).min(1);

const favoriteSchema = Joi.object({
  favorite: Joi.boolean().required()
});

module.exports = {
  bouquetCreateSchema,
  bouquetUpdateSchema,
  favoriteSchema,
  categories
};
