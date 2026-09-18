const ApiError = require('./apiError');

class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filter() {
    const queryStringObj = { ...this.queryString };
    const excludesFields = ['page', 'sort', 'limit', 'fields', 'keyword'];
    excludesFields.forEach((field) => delete queryStringObj[field]);
    for (const [field, value] of Object.entries(queryStringObj)) {
      if (field.startsWith('$') || field.includes('.')) {
        throw new ApiError('Invalid filter', 400);
      }
      if (value !== null && typeof value === 'object') {
        if (Array.isArray(value) || !Object.entries(value).length ||
          Object.entries(value).some(([operator, operand]) =>
            !['gte', 'gt', 'lte', 'lt'].includes(operator) ||
            (operand !== null && typeof operand === 'object'))) {
          throw new ApiError('Invalid filter', 400);
        }
      }
    }
    const filter = Object.fromEntries(Object.entries(queryStringObj).map(([field, value]) => [
      field,
      value !== null && typeof value === 'object'
        ? Object.fromEntries(Object.entries(value).map(([operator, operand]) => [`$${operator}`, operand]))
        : value,
    ]));

    this.mongooseQuery = this.mongooseQuery.find(filter);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select('-__v');
    }
    return this;
  }

  search(modelName) {
    if (this.queryString.keyword) {
      let query = {};
      if (modelName === 'Products') {
        query.$or = [
          { title: { $regex: this.queryString.keyword, $options: 'i' } },
          { description: { $regex: this.queryString.keyword, $options: 'i' } },
        ];
      } else {
        query = { name: { $regex: this.queryString.keyword, $options: 'i' } };
      }

      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }

  paginate(countDocuments) {
    const validInteger = (value) => {
      const number = Number(value);
      return Number.isSafeInteger(number) && number >= 1 ? number : null;
    };
    const page = validInteger(this.queryString.page) || 1;
    const limit = Math.min(validInteger(this.queryString.limit) || 13, 100);
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    // Pagination result
    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countDocuments / limit);

    // next page
    if (endIndex < countDocuments) {
      pagination.next = page + 1;
    }
    if (skip > 0) {
      pagination.prev = page - 1;
    }
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    this.paginationResult = pagination;
    return this;
  }
}

module.exports = ApiFeatures;
