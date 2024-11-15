const mongoose = require('mongoose');

/**
 * Transaction Schema
 * @private
 */
const TransactionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Types.ObjectId,
      ref: 'Customer',
      autopopulate: true,
    },
    reference_id: {
      type: mongoose.Types.ObjectId,
      ref: 'Reference',
      autopopulate: false,
    },
    order_id: {
      type: mongoose.Types.ObjectId,
      ref: 'Order',
      autopopulate: false,
    },
    payment_reference_id: String,
    factorNumber: String,
    amount: Number,
    tax: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      default: false,
    },
    payment_details: {
      code: Number,
      message: String,
      card_hash: String,
      card_pan: String,
      fee_type: String,
      fee: Number,
      shaparak_fee: Number
    }
  },
  {
    timestamps: true,
  }
);

TransactionSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Transaction', TransactionSchema);
