const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('./../models/orderModel');
const Product = require('./../models/productModel');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const Email1 = require('./../utils/email');

exports.setUserId = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  let products;
  let total = 0;
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      products = user.cart.items;
      total = 0;
      products.forEach(p => {
        total += p.quantity * p.productId.price;
      });
      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: req.protocol + '://' + req.get('host') + '/api/orders/checkout/success', // => http://localhost:3000
        cancel_url: req.protocol + '://' + req.get('host') + '/products',
        phone_number_collection:{enabled:true},
        shipping_address_collection: {
          allowed_countries: ['EG'],
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {
                amount: 0,
                currency: 'egp',
              },
              display_name: 'Free shipping',
              // Delivers between 5-7 business days
              delivery_estimate: {
                minimum: {
                  unit: 'business_day',
                  value: 5,
                },
                maximum: {
                  unit: 'business_day',
                  value: 7,
                },
              }
            }
          }
        ],
        customer_email: req.user.email,
        line_items: products.map(p => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.price* 100,
            currency: 'egp',
            quantity: p.quantity
          };
        }),
        mode: 'payment',
      });
    }).then(session => {
        res.status(201).json({
          status: 'success',
          products: products,
          totalSum: total,
          session: session
        });
      }).catch(err => console.log(err));
});


exports.orderOnDelivery = catchAsync(async (req, res, next) => {
  await req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const  products =  user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const userEmail = products.map(e => {
        return user= e.product.user
      })
      const city = req.body.city;
      const address = req.body.address;
      const floorNum = req.body.floorNum;
      const flatNum = req.body.flatNum;
      const phone = req.body.phone;
      new Email1(user, city, address, phone, floorNum, flatNum, products).order();
      const order = Order.create({
        user: req.user,
        products: products
      })
    .then(result => {
        return req.user.clearCart();
      })
      res.status(200).json({
        status: 'success',
        userEmail,
        city,
        address,
        floorNum,
        flatNum,
        phone,
        products
      });
    })
});

exports.createOrder = catchAsync(async (req, res, next) => {
  await req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const  products =  user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      if(!products){
       return next(new AppError('There is No Products in Cart', 400)
      )}
      const order = Order.create({
        user: req.user,
        products: products
      })      
    }).then(result => {
        return req.user.clearCart();
    }).then(() => {
        res.status(200).redirect('/myOrders');
    }).catch(err => console.log(err));
});

exports.getMyOrders= catchAsync(async (req, res, next) => {
  //1) find all orders for Curent user
  const orders = await Order.find({ user: req.user.id });
  //2) find products with the returned IDs
  const productIds = orders.map(el => el.products.map(el2 => el2.id));

  const products = await productIds.map(el => Product.find({ _id: el }))
  
  res.status(200).json({
    status: 'success',
    data: {  
      products
    }
  });
});

exports.getAllOrders = factory.getAll(Order);
exports.getOrder = factory.getOne(Order);
exports.deleteOrder = factory.deleteOne(Order);
