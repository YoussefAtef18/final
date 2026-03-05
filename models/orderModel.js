const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  user:{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Ordetr must belonge to a user.'],
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
