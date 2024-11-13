const Joi = require('joi');

const addProductToCartValidation = Joi.object({
  cartItem: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().hex().length(24).required(),
        quantity: Joi.number().integer().min(1).default(1),
      })
    )
    .min(1),
});

const removeProductFromCart = Joi.object({
  productId: Joi.string().hex().length(24).required(),
});

module.exports = { addProductToCartValidation, removeProductFromCart };
