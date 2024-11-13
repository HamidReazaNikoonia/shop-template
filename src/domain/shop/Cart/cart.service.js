/* eslint-disable no-restricted-syntax */
const mongoose = require('mongoose');
const httpStatus = require('http-status');

// utils
const ApiError = require('../../../utils/ApiError');

// Model
const cartModel = require('./cart.model');
const {Product: ProductModel} = require('./../Product/product.model');

function calcTotalPrice(cart) {
  let totalPrice = 0;
  cart.cartItem.forEach((element) => {
    totalPrice += element.quantity * element.price;
  });

  cart.totalPrice = totalPrice;
}

const addProductToCart = async ({ product, quantity, userId }) => {
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Product ID');
  }

  let isCartExist = await cartModel.findOne({
    userId: userId,
  });

  // If user have not Cart in the DB
  // we will create new Cart for the User
  if (!isCartExist) {
    let newCart = new cartModel({
      userId,
      cartItem: [{ productId: product._id, quantity, price: product.price * quantity }],
      totalPrice: product.price * quantity,
    });
    await newCart.save();

    return newCart;
  }

  // else, if cart existed
  // we will update Cart and add new item
  // then calculate new total price

  // check, if new item exist in Cart or not
  let item = isCartExist.cartItem.find((element) => {
    return element.productId == product._id?.toString();
  });

  console.log('kir');
  console.log(item);

  if (item) {
    item.quantity += quantity || 1;
  } else {
    isCartExist.cartItem.push({ productId: product._id, quantity, price: product.price * quantity });
  }
  calcTotalPrice(isCartExist);

  await isCartExist.save();

  return isCartExist;
};

const getLoggedUserCart = async ({ userId }) => {
  const cartItems = await cartModel.findOne({ userId }).populate('cartItem.productId');
  return cartItems;
};


const removeProductFromCart = async ({cartItemId, userId}) => {
  let result = await cartModel.findOneAndUpdate(
    { userId, },
    { $pull: { cartItem: { _id: cartItemId } } },
    { new: true }
  );

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Item was not found");
  }


  calcTotalPrice(result);

  return result;
}


const updateProductQuantity = async ({productId, userId, quantity}) => {
  const product = await ProductModel.findById(productId);


  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product was not found");
  }

  let isCartExist = await cartModel.findOne({ userId });

  let item = isCartExist.cartItem.find((elm) => elm.productId == productId);
  if (item) {
    item.quantity = quantity;
  }
  calcTotalPrice(isCartExist);


  await isCartExist.save();

  return isCartExist;
}

module.exports = { addProductToCart, getLoggedUserCart, removeProductFromCart, updateProductQuantity };
