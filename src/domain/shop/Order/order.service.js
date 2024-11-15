/* eslint-disable no-restricted-syntax */
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omit } = require('lodash');

// Models
const { Order } = require('./order.model');
const { Product } = require('../Product/product.model');
const { Address } = require('./order.model');
const cartModel = require('./../Cart/cart.model');

// Utils
const ApiError = require('../../../utils/ApiError');
const APIFeatures = require('../../../utils/APIFeatures');

const OrderId = require('../../../utils/orderId');

// helper

const calculateTotalPrice = (products) => {
  let totalPrice = 0;
  for (const item of products) {
    totalPrice += item.price * item.quantity;
  }

  return totalPrice;
};

const validateProducts = async (products) => {
  const validProducts = [];

  for (const item of products) {
    const { product: productId, quantity } = item;

    // Check if the product ID is valid
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid Product ID: ${productId}`);
    }

    // Find the product in the database
    // eslint-disable-next-line no-await-in-loop
    const product = await Product.findById(productId);

    if (!product) {
      throw new ApiError(httpStatus.NOT_FOUND, `Product not found: ${productId}`);
    }

    // Check if the product is available
    if (!product.is_available) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Product is not available: ${productId}`);
    }

    // Check if there is enough quantity in stock
    if (product.countInStock < quantity) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Insufficient stock for product: ${productId}`);
    }

    // Add the valid product to the array
    validProducts.push({ product: productId, quantity, price: product.price });
  }

  return validProducts;
};

const getAllOrders = async ({ query }) => {
  console.log(query);
  console.log('-------query------------');

  const features = new APIFeatures(Order.find(), Order, query).filter().sort().limitFields().paginate();
  const orders = await features.query;
  const { total } = await features.count();
  console.log('---total mother fucker -----');
  console.log(total);
  return { data: orders, total };
};

const getAllUsersOrders = async ({ user, query }) => {
  console.log(query);
  console.log('-------query------------');

  const features = new APIFeatures(Order.find({ customer: user.id }), Order, query).filter().sort().limitFields().paginate();
  const orders = await features.query;
  const { total } = await features.count();
  console.log('---total mother fucker -----');
  console.log(total);
  return { data: orders, total: total };
};

const getOrderById = async ({ orderId }) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Order ID');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order Not Found');
  }

  return { data: order };
};

const getUserOrderById = async ({ orderId, user }) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Order ID');
  }

  const order = await Order.find({ _id: orderId, customer: user.id });
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order Not Found');
  }

  return { data: order };
};

/**
 * Generate Order
 */

const createOrder = async ({ orderData, user }) => {
  if (!Array.isArray(orderData.products)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product not Exist in the Order');
  }

  if (orderData.products.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product not Exist in the Order');
  }

  let customer = user.id;
  let address = null;

  const body = {
    customer,
    paymentMethod: orderData.paymentMethod,
    // ...(orderData.billingAddress && { billingAddress: orderData.billingAddress }),
  };

  // Generate Address
  // If address Exist in the body from user but it not saved in DB
  // we generate new Address in DB and then assign to the Order
  if (orderData.billingAddress && !mongoose.Types.ObjectId.isValid(orderData.billingAddress)) {
    address = await Address.create({
      customer,
      billingAddress: orderData.billingAddress,
    });

    if (!address) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Address Could Not Save in DB');
    }

    body.billingAddress = orderData.billingAddress;
    address = orderData.billingAddress;
    // If Address from body exist in DB and orderData.billingAddress == Address._id
  } else if (orderData.billingAddress && mongoose.Types.ObjectId.isValid(orderData.billingAddress)) {
    body.billingAddress = orderData.billingAddress;
    address = orderData.billingAddress;
  }

  // Generate Ref
  const orderIdGenerator = OrderId();
  const randomRef = Math.floor(Math.random() * 1000);
  const refrenceId = `${orderIdGenerator.generate()}-${randomRef}`;

  body.reference = refrenceId;

  // Implement Products
  const validProducts = await validateProducts(orderData.products);

  if (!Array.isArray(validProducts)) {
    throw new ApiError(httpStatus.BAD_GATEWAY, 'System Could Not Retrive Product');
  }

  body.products = validProducts;

  // Calculate Total Price
  const tprice = calculateTotalPrice(validProducts);
  const TAX_CONSTANT = 100;

  body.total = tprice;
  body.totalAmount = tprice + TAX_CONSTANT;

  const newOrder = await Order.create(body);
  if (!newOrder) {
    throw new ApiError(httpStatus.EXPECTATION_FAILED, 'Order Could Not Save In DB');
  }

  // POST Order Task
  // 1- reduce products count and query to DB

  return { data: newOrder };
};

const createOrderByUser = async ({ cartId, user, shippingAddress }) => {
  if (!mongoose.Types.ObjectId.isValid(cartId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Cart ID');
  }

  if (!mongoose.Types.ObjectId.isValid(shippingAddress)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid shippingAddress ID');
  }
  // Get Cart By Id
  const cart = await cartModel.findById(cartId);

  // validate Cart
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart Not Exist In Database');
  }

  // if cart empty
  if (!cart.cartItem || cart.cartItem.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart Have Not Any Product');
  }


  // check shiping Address
  const isSelectedAddressValid = await Address.findById(shippingAddress);

  if (!isSelectedAddressValid) {
    throw new ApiError(httpStatus.NOT_MODIFIED, 'Address Not Exist In DB');
  }


  // Generate Ref
  const orderIdGenerator = OrderId();
  const randomRef = Math.floor(Math.random() * 1000);
  const refrenceId = `${orderIdGenerator.generate()}-${randomRef}`;

  // map over cart.cartItem
  const productsItems = cart.cartItem.map((item) => {
    return {
      product: item.productId,
      quantity: item.quantity,
      price: item.price,
    };
  });

  // Implement Products
  const validProducts = await validateProducts(productsItems);

  if (!Array.isArray(validProducts)) {
    throw new ApiError(httpStatus.BAD_GATEWAY, 'System Could Not Retrive Product');
  }

  // Calculate Total Price
  const tprice = calculateTotalPrice(validProducts);
  const TAX_CONSTANT = 100;

  const newOrder = await Order.create({
    customer: user.id,
    products: validProducts,
    shippingAddress: shippingAddress,
    paymentMethod: 'zarinpal',
    reference: refrenceId,
    total: tprice,
    totalAmount: tprice + TAX_CONSTANT,
  });

  if (!newOrder) {
    throw new ApiError(httpStatus.EXPECTATION_FAILED, 'Order Could Not Save In DB');
  }

  // Delete Cart
  await cartModel.findByIdAndDelete(cart._id);

  return newOrder;
};

const updateOrder = async ({ orderId, orderData }) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Order ID');
  }

  const data = {
    ...(orderData.status && { status: orderData.status }),
    ...(orderData.paymentStatus && { paymentStatus: orderData.paymentStatus }),
    ...(orderData.deliveryFees && { deliveryFees: orderData.deliveryFees }),
  };

  // data from admin will be empty
  if (Object.keys(data).length === 0) {
    throw new ApiError(httpStatus.EXPECTATION_FAILED, 'There Is no Data For Update Order');
  }

  const updatedOrder = await Order.findByIdAndUpdate(orderId, orderData, { new: true });
  if (!updatedOrder) {
    throw new ApiError(httpStatus.EXPECTATION_FAILED, 'Order Could Not Be Updated');
  }

  return { data: updatedOrder };
};

const deleteOrder = async ({ orderId }) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Order ID');
  }

  const order = await Order.findByIdAndUpdate(orderId, { soft_delete: true });
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order Not Found');
  }

  return true;
};

// const createAddressByUser = async ({ customerId, newAddress, merchantId }) => {
//   if (!mongoose.Types.ObjectId.isValid(customerId)) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Customer ID');
//   }

//   // const customer = await User.findOne({ id: customerId, merchantId });

//   // if (!customer) {
//   //   throw new ApiError(httpStatus.NOT_FOUND, 'Customer Could Not Fount');
//   // }

//   const customerNewAddress = await Address.create(newAddress);

//   if (!customerNewAddress) {
//     throw new ApiError(httpStatus.NOT_MODIFIED, 'Address Could Not Be Save In DB');
//   }

//   // push new Address

//   return { data: customerNewAddress };
// };

const checkoutOrder = async ({ orderId }) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Order ID');
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer Could Not Fount');
  }

  // Validate order
  // order.soft_delete === false
  // order should have billingAddress

  // call checkAndUpdateOrderProductPrices
  // call decrementProductCount

  const customerNewAddress = await Address.create(newAddress);

  if (!customerNewAddress) {
    throw new ApiError(httpStatus.NOT_MODIFIED, 'Address Could Not Be Save In DB');
  }

  // push new Address

  return { data: customerNewAddress };
};
// STATIC METHODS

// Function to find a product by ID and decrement the count by 1
async function decrementProductCount(productId) {
  try {
    // Ensure the product ID is valid
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error('Invalid product ID');
    }

    // Find the product by ID and decrement the count
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, count: { $gt: 0 } }, // Ensure count is greater than 0 to avoid negative values
      { $inc: { count: -1 } },
      { new: true, useFindAndModify: false } // Return the updated document
    );

    if (!updatedProduct) {
      throw new Error('Product not found or count is already 0');
    }

    // eslint-disable-next-line no-console
    console.log('Updated Product:', updatedProduct);
    return updatedProduct;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating product count:', error.message);
    throw error;
  }
}

// Service function to check and update product prices in an order
async function checkAndUpdateOrderProductPrices(orderId) {
  try {
    // Find the order by ID, excluding soft-deleted orders
    const order = await Order.findOne({ _id: orderId, soft_delete: false }).populate('products.product');

    if (!order) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Order not found or has been soft deleted');
    }

    let totalAmount = 0; // Initialize new total amount
    const priceUpdates = [];

    for (const item of order.products) {
      const product = await Product.findById(item.product._id); // Fetch latest product data
      if (!product) {
        console.warn(`Product with ID ${item.product._id} not found`);
        continue;
      }

      // Check if product price has changed
      if (product.price !== item.price) {
        priceUpdates.push({
          productId: product._id,
          oldPrice: item.price,
          newPrice: product.price,
        });

        // Update the item price in the order
        item.price = product.price;
      }

      // Calculate the total amount using the updated price (if changed)
      totalAmount += item.price * item.quantity;
    }

    // Only update the order if there were price changes
    if (priceUpdates.length > 0) {
      order.totalAmount = totalAmount; // Update the order's total amount
      await order.save(); // Save the updated order
    }

    return {
      orderId: order._id,
      totalAmount: order.totalAmount,
      priceUpdates,
      message: priceUpdates.length
        ? 'Order prices updated based on the latest product prices'
        : 'No price changes were found; order remains the same',
    };
  } catch (error) {
    console.error(`Error updating order product prices: ${error?.message}`);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error updating order product prices');
  }
}

module.exports = {
  getAllOrders,
  getAllUsersOrders,
  getOrderById,
  getUserOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  checkoutOrder,
  createOrderByUser,
};
