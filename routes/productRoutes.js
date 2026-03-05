const express = require('express');
const productController = require('./../controllers/productController');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/addProduct')
  .post(
    authController.protect,
    productController.uploadProductImages,
    productController.resizeProductImages,
    productController.setUserId,
    productController.createProduct
    );

router.route('/').get(productController.getAllProducts);
router.route('/hide/:id').patch(authController.protect, productController.hide);

router.route('/:id')
  .get(productController.getProduct)
  .patch(
    authController.protect,
    productController.uploadProductImages,
    productController.resizeProductImages,
    productController.setUserId,
    productController.updateProduct
  )
  .delete(
    authController.protect,
    productController.deleteProduct
  );

router.route('/search/:title').get(productController.search);

 router.route('/:id/reviews').post(authController.protect, reviewController.setProductUserIds, reviewController.createReview)

module.exports = router; 