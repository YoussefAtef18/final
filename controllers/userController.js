const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const Product = require('../models/productModel');
const Review = require('../models/reviewModel');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});


exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
  .resize(500, 500)
  .toFormat('jpeg')
  .jpeg({ quality: 90 })
  .toFile(`public/images/users/${req.file.filename}`);
  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
    }
  );
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
  }
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  const products = await Product.find({ user: req.user.id });
  const productIds = products.map((product) => product._id);
  // Step 1: Delete all products created by the user
  await Product.deleteMany({ user: req.user.id });    
  // Step 2: Delete all reviews associated with the deleted products, regardless of the reviewer
  if (productIds.length > 0) {
    await Review.deleteMany({ product: { $in: productIds } });
  }
  await Review.deleteMany({ user: req.user.id });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

exports.postCart = catchAsync(async (req, res, next) => {
  const prodId = req.body.productId;
  const userId = req.user.id;
  const product = await Product.findById(prodId);
  if (userId.toString() !== product.user.toString()){
    await User.addToCart(userId, product, {new: true, runValidators: false});
  }else return next(new AppError('you can not buy your product',403))
  res.status(200).json({
    status: 'success',
    data: product,
  })
  if(!prodId){
    return next(new AppError('product must be deleted', 403))
  }
});

exports.getCart =(req, res, next) => {
  req.user.populate('cart.items.productId').execPopulate()
  .then(user => {
    const products = user.cart.items;
    res.status(200).json({
      status: 'success',
      data: products,
    })
  })
  .catch(err => console.log(err));
};

exports.deleteItemFromCart = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  if(!productId){
    return next(new AppError('product not exsist in the cart'));
  }
    await req.user
    .removeFromCart(productId, {runValidators: false})
    res.status(204).json({
    status: 'success',
    })
});

exports.clearCart = catchAsync(async (req, res, next) => {
  await req.user.clearCart();
  res.status(204).json({
    status: 'success',
    })
});

exports.uploadUserPhoto = upload.single('photo');
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
