const mongoose = require('mongoose');

const objectId = mongoose.Types.ObjectId;

// Enum Constants
const orderStatusEnum = ['ordered', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'];
const paymentMethodEnum = ['credit_card', 'zarinpal', 'bank_transfer', 'cash_on_delivery'];

// Create Order Schema
const orderSchema = mongoose.Schema(
  {
    customer: {
      type: objectId,
      required: true,
      ref: 'User',
      autopopulate: true,
    },
    transactionId: {
      type: objectId,
      required: false,
      ref: 'Transaction',
    },
    reference: {
      type: String,
      required: true,
    },
    products: [
      {
        _id: false,
        product: {
          type: objectId,
          ref: 'Product',
          required: true,
          autopopulate: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: orderStatusEnum,
      default: 'ordered',
    },
    paymentMethod: {
      type: String,
      enum: paymentMethodEnum,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'unpaid'],
      default: 'unpaid',
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      type: objectId,
      ref: 'Address',
    },
    billingAddress: {
      type: objectId,
      ref: 'Address',
      autopopulate: true,
    },
    deliveryFees: Number,
    taxRate: Number,
    taxes: Number,
    total: Number,
    returned: {
      type: Boolean,
      default: false,
    },
    soft_delete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create Customer Schema
const addressSchema = mongoose.Schema(
  {
    customer: {
      type: objectId,
      required: true,
      ref: 'User',
    },
    billingAddress: {
      addressLine1: {
        type: String,
        required: true,
      },
      addressLine2: String,
      city: {
        type: String,
        required: false,
      },
      state: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: false,
        default: 'IRAN',
      },
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

orderSchema.plugin(require('mongoose-autopopulate'));

orderSchema.pre(['find', 'findOne'], function(next) {
  this.select('-soft_delete');
  this.where({ soft_delete: false });
  next();
});

// Export the Order model
const Order = mongoose.model('Order', orderSchema);
const Address = mongoose.model('Address', addressSchema);

module.exports = {
  Order,
  Address,
};
