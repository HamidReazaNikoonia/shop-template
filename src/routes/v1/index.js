const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');

const referenceRoute = require('../../domain/Reference/reference.route');
const transactionRoute = require('../../domain/Transaction/transaction.route');
const consultRoute = require('../../domain/Consult/consult.route');

const {
  adminRouter: productAdminRoute,
  publicRouter: productPublicRoute,
} = require('../../domain/shop/Product/product.route');

const cartRouter = require('../../domain/shop/Cart/cart.route');

const {orderRoute, orderRouteForAdmin} = require("../../domain/shop/Order/order.route");

// Admin Routes
const timeSlotRoute = require('../../domain/TimeSlot/time_slot.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/consult',
    route: consultRoute,
  },
  {
    path: '/reference',
    route: referenceRoute,
  },
  {
    path: '/transaction',
    route: transactionRoute,
  },
  {
    path: '/product',
    route: productPublicRoute,
  },
  {
    path: '/order',
    route: orderRoute,
  },
  {
    path: '/cart',
    route: cartRouter
  },
  {
    path: '/admin/order',
    route: orderRouteForAdmin,
  },
  {
    path: '/admin/product',
    route: productAdminRoute,
  },
  {
    path: '/admin/time-slot',
    route: timeSlotRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
