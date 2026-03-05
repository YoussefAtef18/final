const mongoose = require('mongoose');
const Product = require(`./productModel`);

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      required: [true, 'Review must have a rating.'],
      min: [1, 'Rating must be at least 1.0'],
      max: [5, 'Rating cannot exceed 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belonge to a prouduct.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belonge to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
   this.populate({
     path: 'product',
     select: 'title images'
    }).populate({
      path: 'user',
      select: 'name photo'
    });
    next();
  });
  
reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne();
    next();
  });
  
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.statics.calcAverageRatings = async function (productId) {
  // Get the total number of remaining reviews and average rating
  const stats = await this.aggregate([
    { $match: { 
        product: productId,
        user: { $ne: null }  
      } 
    },  // Match reviews for this product
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },  // Count the number of remaining reviews
        avgRating: { $avg: '$rating' },  // Calculate the average rating
      },
    },
  ]);

  // If there are remaining reviews
  if (stats.length > 0) {
    // Update the product with the new ratings based on the remaining reviews
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: Math.round(stats[0].avgRating),
    });
  } else {
    // If no reviews are left, reset ratings to 0 and a default average (e.g., 4.5)
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,  // Default rating when no reviews exist
    });
  }
};

reviewSchema.post('save', function () {
  // 'this' refers to the current review document
  this.constructor.calcAverageRatings(this.product._id);
});

reviewSchema.post('remove', function () {
  // Recalculate average ratings when a review is deleted
  this.constructor.calcAverageRatings(this.product._id);
});

reviewSchema.post('findOneAndUpdate', function (doc) {
  // 'doc' is the updated review document
  if (doc) {
    doc.constructor.calcAverageRatings(doc.product._id);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;