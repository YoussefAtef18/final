const express = require('express');
const viewsController = require('../controllers/viewsController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewsController.getOverview);

router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', viewsController.getSignupForm);
router.get('/forgetpassword', viewsController.getForgetPassForm);
router.get('/resetpassword/:token', viewsController.getResetPassForm);

//products
router.get('/products', authController.isLoggedIn, viewsController.getAllProducts);
router.get('/products/:id', authController.isLoggedIn, viewsController.getProduct);
router.get('/products/category/:categoryId', authController.isLoggedIn, viewsController.categoryProducts);
router.get('/products/search/:title', authController.isLoggedIn, viewsController.search)
router.get('/addProduct', authController.protect, viewsController.addProduct);
router.get('/addCategory', authController.protect, viewsController.addCategory);
router.get('/editProduct/:id', authController.protect, viewsController.editProduct);
router.get('/cart', authController.protect, viewsController.getCart);

//login
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/myReviews', authController.protect, viewsController.getMyReviews);
router.get('/myProducts', authController.protect, viewsController.getMyProducts);
router.get('/myOrders', authController.protect, viewsController.getMyOrders);


// router
//   .route('/addProduct')
//   .post(
//     authController.protect,
//     productController.setUserId,
//     productController.uploadProductImages,
//     productController.resizeProductImages,
//     productController.createProduct
//     );

// router
//   .route('/addCategory')
//   .post(
//     authController.protect,
//     categoryController.uploadCategoryPhoto,
//     categoryController.createCategory
//   );

router.post('/products/:id/reviews', authController.protect, )

//admin
router.get('/allProducts', authController.protect, viewsController.getAllAdminProducts);
router.get('/allUsers', authController.protect, viewsController.getAllAdminUsers);
router.get('/allOrders', authController.protect, viewsController.getAllAdminOrders);

router.post('/submit-user-data', authController.protect, viewsController.updateUserData);
  
router.get('/contact', authController.protect, viewsController.getContact);
  
module.exports = router;
  