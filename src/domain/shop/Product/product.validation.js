const Joi = require('joi');
// const { password, objectId } = require('./custom.validation');

const createProduct = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    subtitle: Joi.string().required(),
    description: Joi.string().min(30).max(900),
    brand: Joi.string(),
    price: Joi.number().required(),
    countInStock: Joi.number(),
    images: Joi.array().items(Joi.string().hex().length(24)),
    thumbnail: Joi.string().hex().length(24),
    category: Joi.string().hex().length(24),
  }),
};

const updateProduct = {
  body: Joi.object().keys({
    title: Joi.string(),
    subtitle: Joi.string(),
    description: Joi.string().min(30).max(900),
    brand: Joi.string(),
    price: Joi.number(),
    countInStock: Joi.number(),
    images: Joi.array().items(Joi.string().hex().length(24)),
    thumbnail: Joi.string().hex().length(24),
    category: Joi.string().hex().length(24),
  }),
};

// const getUsers = {
//   query: Joi.object().keys({
//     name: Joi.string(),
//     role: Joi.string(),
//     sortBy: Joi.string(),
//     limit: Joi.number().integer(),
//     page: Joi.number().integer(),
//   }),
// };

// const getUser = {
//   params: Joi.object().keys({
//     userId: Joi.string().custom(objectId),
//   }),
// };

// const updateUser = {
//   params: Joi.object().keys({
//     userId: Joi.required().custom(objectId),
//   }),
//   body: Joi.object()
//     .keys({
//       email: Joi.string().email(),
//       password: Joi.string().custom(password),
//       name: Joi.string(),
//     })
//     .min(1),
// };

// const deleteUser = {
//   params: Joi.object().keys({
//     userId: Joi.string().custom(objectId),
//   }),
// };

module.exports = {
  createProduct,
  updateProduct,
};
