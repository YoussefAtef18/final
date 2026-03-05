const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Review = require('../models/reviewModel');
const Product = require('./../models/productModel');
const Category = require('../models/categoryModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  //get all catygories and get all products put not for the current user and only available 
  const categories = await Category.find().sort('name');
  const products = await Product.find({ available: { $ne: false }}).sort({createdAt: -1}).limit(7);

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://127.0.0.1:51070"
      )
    .render('overview', {
      title: 'Home',
      categories,
      products
    });
});

exports.getLoginForm = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://127.0.0.1:51070"
    )
    .render('register', {
      title: 'Log in'
    });
};

exports.getSignupForm = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://127.0.0.1:51070 ws://127.0.0.1:51070"
    )
    .render('register', {
      title: 'Sign up'
    });
};

exports.getForgetPassForm = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://127.0.0.1:51070"
    )
    .render('forgetpassword', {
      title: 'forget your password'
    });
};

exports.getResetPassForm = (req, res) => {
  //get the new token from params
  const token = req.params.token;

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://127.0.0.1:51070"
    )
    .render('resetpassword', {
      title: 'reset your password',
      token
    });
};

exports.getAccount = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://127.0.0.1:51070"
    )
    .render('account', {
      title: 'your account'
    });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  //get data for the current user
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res
    .status(200)
    .render('account', {
      title: 'your account',
      user: updatedUser
    });
});

exports.addProduct = (req, res) => {
  const categories = Category.find(); // Adjust 'Category' model based on your schema
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://127.0.0.1:51070"
    )
    .render('addProduct', {
      title: 'add new product',
      categories
    });
};

exports.addCategory = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://127.0.0.1:51070"
    )
    .render('addCategory', {
      title: 'add new category'
    });
};

exports.getAllProducts= catchAsync(async (req, res, next) => {
  // Get the selected category from the query string or default to 'all'
  const selectedCategory = req.query.category || 'all';
  // Build the filter object based on the selected category
  let filter = {};
  if (selectedCategory !== 'all') {
    filter.category = selectedCategory.toUpperCase(); // Ensure category is uppercase
  }
  // Find products based on the filter
  const products = await Product.find({ available: { $ne: false }, ...filter });
  // Render the products page with the filtered products and the selected category
  res.status(200).render('products', {
    title: 'Products',
    products,
    selectedCategory
  });
});

exports.categoryProducts = catchAsync(async (req, res, next) => {
  //find all products in one category
  const products = await Product.find({category: req.params.categoryId, available: { $ne: false }});
  const category = req.params;

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://127.0.0.1:51070"
    ).render('categoryProducts', {
      title: `${category.categoryId}`,
      products
    });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  //et the data from the chosen product
  const product = await Product.findById( req.params.id ).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  // if prodiuct not found
  if (!product) {
    return next(new AppError('there is no product with that ID', 404));
  }
  
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://127.0.0.1:51070"
    )
    .render('product', {
      title: `${product.title}`,
      product
    });
});
  
exports.editProduct = catchAsync(async (req, res, next) => {
  //et the data from the chosen product
  const product = await Product.findById( req.params.id );
  console.log(product);
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://127.0.0.1:51070"
    )
    .render('editProduct', {
      title: `Edit ${product.title}`,
      product
    });
});

exports.search = catchAsync(async (req, res, next) => {
  const products = await Product.find({ title: { $regex: `.*${req.params.title}.*`, $options: 'i' }})
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://127.0.0.1:51070"
    )  
    .render('products', {
      title: `search for ${req.params.title}`,
      products
    });
});

exports.getMyProducts= catchAsync(async (req, res, next) => {
  //find all products for current user
  const products = await Product.find({ user: req.user.id });
  
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://127.0.0.1:51070"
    )  
    .render('myProducts', {
      title: 'My products',
      products
    });
});

exports.getMyReviews = catchAsync(async (req, res, next) => {
  //find all reviews for current user
  const reviews = await Review.find({ user: req.user.id });
  
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://127.0.0.1:51070"
    )
    .render('myReviews', {
      title: 'My reviews',
      reviews
    });
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
  //find all orders for Curent user
  const orders = await Order.find({ user: req.user.id });
  // const products = orders.map(el => el.products);
    // console.log(p)

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://127.0.0.1:51070"
    )
    .render('myOrders', {
      title: 'My orders',
      orders
    });
});

exports.getCart = ( req, res) => {
  //get all products from current user cart
  req.user.populate('cart.items.productId').execPopulate()
    .then(user => {
      const products = user.cart.items;
      let total = 0;
      products.forEach(p => {
        total += p.quantity * p.productId.price;
      })
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://127.0.0.1:51070"
    )
    .render('cart', {
      title: 'cart',
      products,
      total,
      user
    });
  })
  .catch(err => console.log(err));
}

exports.getAllAdminProducts= catchAsync(async (req, res, next) => {
  //find all products for admin
  const products = await Product.find();
  
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://127.0.0.1:51070"
    ).render('allAdminProducts', {
      title: 'All products',
      products
    });
});

exports.getAllAdminUsers= catchAsync(async (req, res, next) => {
  //find all users for admin
  const users = await User.find();
  
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://127.0.0.1:51070"
    )
    .render('allAdminUsers', {
      title: 'All users',
      users,
    });
});

exports.getAllAdminOrders= catchAsync(async (req, res, next) => {
  //find all orders for admin
  const orders = await Order.find();
  
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://127.0.0.1:51070"
    )
    .render('allAdminOrders', {
      title: 'All orders',
      orders
    });
});

exports.getContact = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://127.0.0.1:51070"
    )  
    .render('contact', {
      title: 'Contact Us',
    });
};