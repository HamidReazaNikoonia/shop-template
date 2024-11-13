const httpStatus = require('http-status');
const catchAsync = require('../../../utils/catchAsync');
const cartService = require('./cart.service');
const { getProductById } = require('./../Product/product.service');
const ApiError = require('../../../utils/ApiError');

const addProductToCart = catchAsync(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!req.user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Exist');
  }

  const product = await getProductById({ productId });

  const result = await cartService.addProductToCart({ product, quantity, userId: req.user.id });
  res.status(httpStatus.OK).send(result);
});

const getLoggedUserCart = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Exist');
  }

  let cartItems = await cartService.getLoggedUserCart({ userId: req.user.id });

  res.status(httpStatus.OK).send(cartItems);
});

const removeProductFromCart = catchAsync(async (req, res) => {
  const { productId: cartItemId } = req.params;

  if (!req.user || !cartItemId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Exist');
  }

  const result = await cartService.removeProductFromCart({ cartItemId, userId: req.user.id });
  res.status(httpStatus.OK).send(result);
});

const updateProductQuantity = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!req.user || !productId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Exist');
  }

  const result = await cartService.updateProductQuantity({ productId, userId: req.user.id, quantity });
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  addProductToCart,
  getLoggedUserCart,
  removeProductFromCart,
  updateProductQuantity,
};
