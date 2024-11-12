const express = require('express');

const auth = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const {
  getAllOrders,
  getOrderById,
  createOrder,
  createOrderByUser,
  updateOrder,
  deleteOrder,
  getAllUserOrders,
  getUserOrderById,
  checkoutOrder
} = require('./order.controller');
const { createOrder: createOrderValidation } = require('./order.validation');

const orderRouteForAdmin = express.Router();
const orderRoute = express.Router();

/** **************************  Admin Route  ***************************************** */
orderRouteForAdmin
  .route('/')
  .get(auth(), getAllOrders) // Retrieve all orders of customers
  .post(auth(), validate(createOrderValidation), createOrder); // Create a new order By Admin

orderRouteForAdmin
  .route('/:orderId')
  .get(auth(), getOrderById) // Retrieve a specific order by ID
  .put(auth(), updateOrder) // Update a specific order by ID
  .delete(auth(), deleteOrder); // Delete a specific order by ID

/** ********************************************************************************** */

/** **************************  Authenticate User Route  ***************************************** */

orderRoute.route('/').get(auth(), getAllUserOrders).post(auth(), createOrder);

orderRoute.route('/:orderId').get(auth(), getUserOrderById); // Retrieve a specific order by ID


orderRoute.route('/:orderId/checkout').post(auth(), checkoutOrder)

module.exports = { orderRouteForAdmin, orderRoute };
