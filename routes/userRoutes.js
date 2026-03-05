const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const productController = require('./../controllers/productController');
const reviewController = require('./../controllers/reviewController');

const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/logout', authController.logout);

router.post('/forgetPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//user
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMyPassword', authController.updatePassword);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

router.get('/my-products',productController.getMyProducts);
router.get('/my-reviews',reviewController.getMyReviews);

router.get('/cart', userController.getCart);
router.post('/cart-add', userController.postCart);
router.delete('/cart', userController.clearCart);
router.delete('/cart-delete/:id', userController.deleteItemFromCart);
// router.post('/cart-clear', userController.clearCart);

router.post('/contact-us', authController.contactUs);

//admin
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
  
module.exports = router;
