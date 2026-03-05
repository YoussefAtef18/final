const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

const Product = require('../models/productModel');
const Review = require('../models/reviewModel');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // Helper function to check permissions allaw only the admin and the user how create the document can delete it
    const isAuthorized = (resourceUserId) =>
      req.user.role === 'admin' || req.user.id.toString() === resourceUserId.toString();
    // Find the document to delete
    const doc = await Model.findById(req.params.id);
    // If the document doesn't exist, send an error
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    // Special handling if deleting a user document
    if (Model.modelName === 'User') {
      if (req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to perform this action', 403));
      }
      //  Delete all reviews created by the user
      await Review.deleteMany({ user: req.params.id });
      const products = await Product.find({ user: req.params.id });
      const productIds = products.map((product) => product._id);
      // Delete the products of that user
      // Step 1: Delete all products created by the user
      await Product.deleteMany({ user: req.params.id });    
      // Step 2: Delete all reviews associated with the deleted products, regardless of the reviewer
      if (productIds.length > 0) {
        await Review.deleteMany({ product: { $in: productIds } });
      }
    }
    if (Model.modelName === 'Product') {
      if (!isAuthorized(doc.user._id)) {
        return next(new AppError('You do not have permission to perform this action', 403));
      }
      // Delete all reviews associated with this product
      await Review.deleteMany({ product: req.params.id });
    }
    if (Model.modelName === 'Review') {
      if (!isAuthorized(doc.user._id)) {
        return next(new AppError('You do not have permission to perform this action', 403));
      }
    }
    // If the user is authorized, delete the document
    // await console.log(doc);
    await doc.deleteOne({ _id: req.params.id });;
    // Respond with success
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    // Find the document to update
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    // If the document doesn't exist, send an error
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    // Check if the user is the creator of the document
    if ( doc.user._id.toString() !== req.user.id ) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    // Add uploaded file URL to request body
    if (req.file) {
      req.body.image = req.file.path; // Use the Cloudinary URL
    }
    // Check if the request includes a productId
    if(req.body.product){
      const product = await Product.findById(req.body.product);
      // If the product doesn't exist, throw an error
      if(product.user._id.toString() === req.user.id.toString() ){
        return next(new AppError('You can not comment in your product',403));
      }
      if(!product){
        return next(new AppError('No product found with that ID', 404));
      }
    }
    // Check if a product with the same name already exists for the current title
    const existingProduct = await Product.findOne({
      title: req.body.title,
      category: req.body.category,
      user: req.user.id
    });
    if (existingProduct) {
      return next(new AppError('You already have a product with this title', 400));
    }
    // Create the document if the product exists (or no product is required)
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // Find the document to get
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    // If the document doesn't exist, send an error
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'succees',
      data: doc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on product (hack)
    let filter = {};
    if (req.params.productId) filter = { product: req.params.productId };
    const features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
    // Explicitly populate virtual 'reviews' field if the Model is 'Product'
    let query = features.query;
    if (Model.modelName === 'Product'){
      //i use setOptions to controle the middelware of find() in product model to make the user populate only in this case
      query = await Product.find().setOptions({ populateUser: true });
    }
    // const doc = await features.query.explain();
    const doc = await query;
    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc
      }
    });
  });

exports.getMyThings = Model => catchAsync(async (req, res, next) => {
  // find reviews with the returned IDs
  let docs = await Model.find({ user: req.user.id });
  if(Model.modelName === 'Product'){
    //i use setOptions to controle the middelware of find() in product model to ignore this.find({available:{$ne:false}}
    docs = await Model.find({ user: req.user.id }).setOptions({ bypassMiddleware: true })
  }
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });
