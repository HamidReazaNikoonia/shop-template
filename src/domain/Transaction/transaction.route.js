const express = require('express');
// const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');

const transactionValidation = require('./transaction.validation');
const transactionController = require('./transaction.controller');

const router = express.Router();

/**
 * GET `api/reference` (ADMIN)
 * POST `api/reference`
 */
router
  .route('/')
  .post(validate(transactionValidation.getCustomerTransactions), transactionController.getCustomerTransactions);

/**
 * GET `api/reference/:reference_id`
 */
router
  .route('/verify/:transaction_id')
  .get(validate(transactionValidation.verifyTransaction), transactionController.verifyTransaction);

module.exports = router;
