const { Schema, model } = require('mongoose');

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.ObjectId,
      ref: 'User',
    },
    cartItem: [
      {
        productId: { type: Schema.ObjectId, ref: 'Product', autopopulate: false },
        quantity: {
          type: Number,
          default: 1,
        },
        price: Number,
        totalProductDiscount: Number,
      },
    ],
    totalPrice: Number,
    totalPriceAfterDiscount: Number,
    discount: Number,
  },
  {
    timestamps: true,
  }
);

cartSchema.plugin(require('mongoose-autopopulate'));

const cartModel = model('cart', cartSchema);

module.exports = cartModel;
