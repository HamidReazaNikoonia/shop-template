class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.total = 0;
  }

  filter() {
    let queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'keyword', 'category', 'price_from', 'price_to'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Handle categories
    if (this.queryString.category) {
      const categories = this.queryString.category.split(',');
      queryObj.category = { $in: categories };
    }

    // Advanced filtering (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  search() {
    if (this.queryString.keyword) {
      const keyword = this.queryString.keyword;
      this.query = this.query.find({
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { subtitle: { $regex: keyword, $options: 'i' } },
        ],
      });
    }
    return this;
  }

  priceRange() {
    const priceFilters = {};
    if (this.queryString.price_from) {
      priceFilters.$gte = Number(this.queryString.price_from);
    }
    if (this.queryString.price_to) {
      priceFilters.$lte = Number(this.queryString.price_to);
    }

    if (Object.keys(priceFilters).length > 0) {
      this.query = this.query.find({ price: priceFilters });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(`-${sortBy}`);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 20;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  async count() {
    this.total = await this.query.model.countDocuments(this.query.getQuery());
    return this;
  }
}

module.exports = APIFeatures;
