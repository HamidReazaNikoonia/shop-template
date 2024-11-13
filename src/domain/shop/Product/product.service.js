const mongoose = require('mongoose');
const httpStatus = require('http-status');

// Models
const { Product, Category } = require('./product.model');

// utils
const ApiError = require('../../../utils/ApiError');

// const pick = require('../../utils/pick');
// const ApiError = require('../../utils/ApiError');
// const catchAsync = require('../../utils/catchAsync');
const APIFeatures = require('../../../utils/APIFeatures');

// const getUsers = catchAsync(async (req, res) => {
//     const filter = pick(req.query, ['name', 'role']);
//     const options = pick(req.query, ['sortBy', 'limit', 'page']);
//     const result = await userService.queryUsers(filter, options);
//     res.send(result);
//   });

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
// const queryProduct = async (filter, options) => {
//     const products = await Product.paginate(filter, options);
//     return users;
//   };

const getAllProduct = async ({ query }) => {
  const features = new APIFeatures(Product.find({status: "publish"}), Product, query).filter().sort().limitFields().paginate();
  const products = await features.query;

  const total = await features.count().total;
  return { data: { total, count: products.length, products } };
};

const getAllProductForAdmin = async ({ query }) => {
  const features = new APIFeatures(Product.find(), Product, query).filter().sort().limitFields().paginate();
  const products = await features.query;

  // const total = await features.count().total;
  return { data: { count: products.length, products } };
};

const getProductBySlug = async ({ productId, user }) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Product ID');
  }

  const product = await Product.findById({ _id: productId });

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product Not Found');
  }

  return { data: product };
};

const getProductById = async ({ productId }) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Product ID');
  }

  const product = await Product.findById({ _id: productId });

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product Not Found');
  }

  return product;
};

/**
 ******************************
 * ** Create Product Service **
 ******************************
 * @param {Product}
 * @returns saved product in database
 */
const createProduct = async ({ product }) => {
  const { title, subtitle, description, price, countInStock, ...rest } = product;
  const productBody = {
    title,
    subtitle,
    description,
    price,
    countInStock,
    ...(product.brand && { brand: product.brand }),
    ...(product.tag && { tag: product.tag }),
    ...(product.publish_on_social && { publish_on_social: product.publish_on_social }),
    ...(product.tag && { tag: product.tag }),
    ...(product.tag && { tag: product.tag }),

    ...(product.publish_on_website && { publish_on_website: product.publish_on_website }),
    ...(product.product_details && { product_details: product.product_details }),
  };
  // if product is a giftcard, we should disallow discounts
  if (rest.is_giftcard) {
    rest.discountable = false;
  }

  if (rest.category && mongoose.Types.ObjectId.isValid(rest.category)) {
    const selectedCategory = await Category.findById(rest.category);

    if (!selectedCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Selected Category Not Found!');
    }
  }

  // Implement Image
  if (rest.thumbnail) {
    productBody.thumbnail = rest.thumbnail;
  }

  if (Array.isArray(rest.images) && rest.images.length) {
    const validImagesArray = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < rest.images.length; i++) {
      if (mongoose.Types.ObjectId.isValid(rest.images[i])) {
        validImagesArray.push(rest.images[i]);
      }
    }
    productBody.images = validImagesArray;
  }
  // count In Stock
  if (rest.countInStock === 0) {
    productBody.is_available = false;
  }

  // Generate Qr-code

  // discount
  if (rest.discountable) {
    if (rest.discountable.status) {
      const currentPrice = Number(productBody.price);
      const discountPercentage = Number(rest.discountable.percent);
      const FinalAmount = currentPrice * ((100 - discountPercentage) / 100);
      productBody.price = FinalAmount;
    }
  }

  // JOBS

  // ** Should Publich In The Site
  // if (rest.publish_on_website) {

  // }

  const newProductModel = await Product.create(productBody);

  if (!newProductModel) {
    throw new ApiError(httpStatus.EXPECTATION_FAILED, 'Product Could Not Save In DB');
  }

  return { data: newProductModel };
};

const deleteProduct = async ({ productId }) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Product ID');
  }

  const product = await Product.findOneAndRemove({ _id: productId });

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product Not Found');
  }
};

const updateProduct = async ({ productId, productData }) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Product ID');
  }

  const { title, subtitle, description, price, countInStock, ...rest } = productData;
  const productBody = {
    ...(productData.countInStock && { countInStock: productData.countInStock }),
    ...(productData.price && { price: productData.price }),
    ...(productData.description && { description: productData.description }),
    ...(productData.subtitle && { subtitle: productData.subtitle }),
    ...(productData.title && { title: productData.title }),
    ...(productData.brand && { brand: productData.brand }),
    ...(productData.tag && { tag: productData.tag }),
    ...(productData.publish_on_social && { publish_on_social: productData.publish_on_social }),
    ...(productData.publish_on_website && { publish_on_website: productData.publish_on_website }),
    ...(productData.product_details && { product_details: productData.product_details }),
  };

  if (rest.is_giftcard) {
    rest.discountable = false;
  }

  if (rest.category && mongoose.Types.ObjectId.isValid(rest.category)) {
    const selectedCategory = await Category.findById(rest.category);

    if (!selectedCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Selected Category Not Found!');
    }
  }

  if (rest.thumbnail && mongoose.Types.ObjectId.isValid(rest.thumbnail)) {
    productBody.thumbnail = rest.thumbnail;
  }

  if (Array.isArray(rest.images) && rest.images.length) {
    const validImagesArray = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < rest.images.length; i++) {
      if (mongoose.Types.ObjectId.isValid(rest.images[i])) {
        validImagesArray.push(rest.images[i]);
      }
    }
    productBody.images = validImagesArray;
  }

  if (rest.countInStock === 0) {
    productBody.is_available = false;
  }

  if (rest.discountable && rest.discountable.status) {
    const currentPrice = Number(productBody.price);
    const discountPercentage = Number(rest.discountable.percent);
    const FinalAmount = currentPrice * ((100 - discountPercentage) / 100);
    productBody.price = FinalAmount;
  }

  const updatedProduct = await Product.findOneAndUpdate({ _id: productId }, productBody, { new: true });

  if (!updatedProduct) {
    throw new ApiError(httpStatus.EXPECTATION_FAILED, 'Product Could Not Be Updated');
  }

  return { data: updatedProduct };
};

module.exports = {
  getAllProduct,
  getAllProductForAdmin,
  getProductBySlug,
  createProduct,
  deleteProduct,
  updateProduct,
  getProductById
};
