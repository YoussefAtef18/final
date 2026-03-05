const mongoose = require('mongoose');
const slugify = require('slugify');
const Category = require('../models/categoryModel');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A product must have a Title'],
    trim: true,
  },
  slug: String,
  price: {
    type: Number,
    required: [true, 'A product must have a Price'],
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'A product must have a Description'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  available: {
    type: Boolean,
    default: true,
  },
  city: {
    type: String,
    required: ['A product must have a City']
  },
  quantity: {
    type: Number,
    default: 1,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Product must belonge to a user.'],
  },
  category: {
    type: String,
    ref: 'Category',
    required: [true, 'Product must have category.'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

productSchema.index({ price: 1 });
productSchema.index({ slug: 1 });

productSchema.pre(/^find/, function (next) {
  if (this.options.populateUser) {
    this.populate({
      path: 'user',
      select: 'name photo email'
    });
  }
  next();
});

// productSchema.pre(/^find/, function (next) {
  
//   this.find({ available: { $ne: false } });
//   next();
// });

productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});
// DOCUMENT MIDDELWARE : runs before .save() and .create()

productSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

productSchema.pre('save', async function(next) {
  const category = await Category.findById(this.category);
  if (!category) {
    const error = new Error('Category does not exist');
    return next(error); // Prevent saving and return error
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;