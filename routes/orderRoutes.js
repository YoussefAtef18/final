const express = require('express');
const orderController = require('./../controllers/orderController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, authController.restrictTo('admin'), orderController.getAllOrders)
  .post(
    authController.protect,
    orderController.setUserId,
    orderController.createOrder,
);

router.post('/onDelivery', authController.protect, orderController.orderOnDelivery, orderController.createOrder);

router.get('/checkout', authController.protect, orderController.getCheckoutSession);
router.get('/checkout/success', authController.protect, orderController.setUserId, orderController.createOrder);

router.route('/myOrders').get(authController.protect, orderController.getMyOrders);

router
  .route('/:id')
  .get(authController.protect, orderController.getOrder)
  .delete(authController.protect, orderController.deleteOrder);
  
module.exports = router;