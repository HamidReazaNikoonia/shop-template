const httpStatus = require('http-status');
const catchAsync = require('../../../utils/catchAsync');
const orderService = require('./order.service');
const ApiError = require('../../../utils/ApiError');

/**
 * Asynchronous controller function to retrieve all orders for Admin.
 * Wrapped with `catchAsync` to handle any potential errors in asynchronous calls.
 *
 * @param {Object} req - Express request object containing:
 *   @property {Object} user - The authenticated user information.
 *   @property {Object} query - Query parameters for filtering or pagination (optional).
 *
 * @param {Object} res - Express response object used to send responses back to the client.
 *
 * @throws {ApiError} - Throws a 404 error if the user does not exist in the request object.
 *
 * @returns {void} - Sends a response with the retrieved orders data.
 */
const getAllOrders = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Exist');
  }

  const result = await orderService.getAllOrders({ query: req.query });
  res.status(httpStatus.OK).send(result);
});

/**
 * Asynchronous controller function to retrieve all User orders for the authenticated user.
 * Wrapped with `catchAsync` to handle any potential errors in asynchronous calls.
 *
 * @param {Object} req - Express request object containing:
 *   @property {Object} user - The authenticated user information.
 *   @property {Object} query - Query parameters for filtering or pagination (optional).
 *
 * @param {Object} res - Express response object used to send responses back to the client.
 *
 * @throws {ApiError} - Throws a 404 error if the user does not exist in the request object.
 *
 * @returns {void} - Sends a response with the retrieved orders data.
 */
const getAllUserOrders = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Exist');
  }

  const result = await orderService.getAllUsersOrders({ query: req.query, user: req.user });
  res.status(httpStatus.OK).send(result);
});


/**
 * Asynchronous controller function to retrieve a specific order for Admni by its unique ID.
 * Wrapped with `catchAsync` to handle any potential errors in asynchronous calls.
 *
 * @param {Object} req - Express request object containing:
 *   @property {Object} params - Request parameters, expected to contain `orderId`.
 *
 * @param {Object} res - Express response object used to send responses back to the client.
 *
 * @returns {void} - Sends a response with the retrieved order data.
 */
const getOrderById = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const order = await orderService.getOrderById({ orderId });
  res.status(httpStatus.OK).send(order);
});

/**
 * Asynchronous controller function to retrieve a specific Authenticated user order by its unique ID.
 * Wrapped with `catchAsync` to handle any potential errors in asynchronous calls.
 *
 * @param {Object} req - Express request object containing:
 *   @property {Object} params - Request parameters, expected to contain `orderId`.
 *
 * @param {Object} res - Express response object used to send responses back to the client.
 *
 * @returns {void} - Sends a response with the retrieved order data.
 */
const getUserOrderById = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Exist');
  }
  const { orderId } = req.params;
  const order = await orderService.getUserOrderById({ orderId, user: req.user });
  res.status(httpStatus.OK).send(order);
});


/**
 * Asynchronous controller function to create a new order for the authenticated user.
 * Wrapped with `catchAsync` to handle any potential errors in asynchronous calls.
 *
 * @param {Object} req - Express request object containing:
 *   @property {Object} user - The authenticated user information.
 *   @property {Object} body - Request body data, expected to contain the order details.
 *
 * @param {Object} res - Express response object used to send responses back to the client.
 *
 * @throws {ApiError} - Throws a 404 error if the user does not exist in the request object.
 *
 * @returns {void} - Sends a response with the newly created order data.
 */
const createOrder = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Exist');
  }

  const newOrder = await orderService.createOrder({ orderData: req.body, user: req.user });
  res.status(httpStatus.CREATED).send(newOrder);
});


/**
 * *** Admin ***
 * Asynchronous controller function to update an existing order by its unique ID.
 * Wrapped with `catchAsync` to handle any potential errors in asynchronous calls.
 *
 * @param {Object} req - Express request object containing:
 *   @property {Object} params - Request parameters, expected to contain `orderId`.
 *   @property {Object} body - Request body data, expected to contain the updated order details.
 *
 * @param {Object} res - Express response object used to send responses back to the client.
 *
 * @returns {void} - Sends a response with the updated order data.
 */
const updateOrder = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const updatedOrder = await orderService.updateOrder({ orderId, orderData: req.body });
  res.status(httpStatus.OK).send(updatedOrder);
});

/**
 * *** Admin ***
 * Asynchronous controller function to delete an existing order by its unique ID.
 * Wrapped with `catchAsync` to handle any potential errors in asynchronous calls.
 *
 * @param {Object} req - Express request object containing:
 *   @property {Object} params - Request parameters, expected to contain `orderId`.
 *
 * @param {Object} res - Express response object used to send responses back to the client.
 *
 * @returns {void} - void
 */
const deleteOrder = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  await orderService.deleteOrder({ orderId });
  res.status(httpStatus.NO_CONTENT).send();
});


/**
 * *** Authenticated User ***
 * Asynchronous controller function to checkout order by its unique ID.
 * Wrapped with `catchAsync` to handle any potential errors in asynchronous calls.
 *
 * @param {Object} req - Express request object containing:
 *   @property {Object} params - Request parameters, expected to contain `orderId`.
 *   @property {Object} body - Request body data, expected to contain the updated order details.
 *
 * @param {Object} res - Express response object used to send responses back to the client.
 *
 * @returns {void} - Sends a response with the updated order data.
 */
const checkoutOrder = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const { addressId } = req.body;
  const updatedOrder = await orderService.checkoutOrder({ orderId, addressId });
  res.status(httpStatus.OK).send(updatedOrder);
});

const createAddressByUser = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Exist');
  }

  const newAddress = await orderService.createNewAddressByMerchant({ customerId: req.user?.id, newAddress: req.body});
  res.status(httpStatus.OK).send(newAddress);
})


module.exports = {
  getAllOrders,
  getOrderById,
  getUserOrderById,
  getAllUserOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  createAddressByUser,
  checkoutOrder
};
