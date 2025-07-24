import express from 'express';
import Order from '../models/orderModel.js';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isAdmin } from '../utils.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/paymentModel.js';
import { error, log } from 'console';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';

const orderRouter = express.Router();

orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id
    });

    const order = await newOrder.save();
    res.status(201).send({ message: 'New Order Created', order });
  })
);

orderRouter.get(
  '/summary',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' }
        }
      }
    ]);
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 }
        }
      }
    ]);
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    res.send({ users, orders, dailyOrders, productCategories });
  })
);

orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.get(
  '/payment/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Payment.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.post('/:id/pay', async (req, res) => {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

  const options = {
    amount: req.body.amount * 100,
    currency: req.body.currency,
    id: req.body.id,
    receipt: 'receipt#1',
    payment_capture: 1
  };

  try {
    await razorpay.orders.create(options, (error, payOrder) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Something wrong'
        });
      }
      return res.status(200).json(payOrder);
    });

    // res.json({
    //   order_id: order.id,
    //   currency: order.currency,
    //   id: order.id,
    //   amount: order.amount,
    //   isPaid: true,
    //   paidAt: Date.now()
    // });
    // const updatePayment = await order.save();
    // res.send({ message: 'Order is Paid', order: updatePayment });
  } catch (error) {
    res.status(500).send('Internal server error');
  }
});

orderRouter.post('/:id/payCapture', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  console.log(req.body);

  const body = razorpay_order_id + '|' + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  console.log(`Razorpay Signature, ${razorpay_signature}`);
  console.log(`Expected Signature, ${expectedSignature}`);

  const isValid = expectedSignature === razorpay_signature;
  console.log(isValid);

  if (isValid) {
    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isPaid: true,
      paidAt: Date.now()
    });

    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id
      },
      {
        $set: {
          isPaid: true,
          paidAt: Date.now(),
          razorpay_order_id,
          razorpay_payment_id
        }
      }
    );

    // res.redirect(
    //   `http://localhost:3000/paymentdetails?reference=${razorpay_payment_id}`
    // );

    return res.status(200).json({
      order,
      success: true,
      razorpay_order_id: razorpay_order_id,
      razorpay_payment_id: razorpay_payment_id,
      razorpay_signature: razorpay_signature,
      isPaid: true,
      paidAt: Date.now()
    });
  } else {
    res.status(400).json({
      success: false
    });
  }

  // const secret = process.env.RAZORPAY_KEY_SECRET;
  // const body_data = razorpay_order_id + '|' + razorpay_payment_id;

  // const expect = crypto
  //   .createHmac('sha256', secret || '')
  //   .update(body_data)
  //   .digest('hex');

  // const isValid = expect === razorpay_signature;

  // if (isValid) {
  //   return res.status(200).json({
  //     success: true,
  //     message: 'Payment Verified'
  //   });
  // } else {
  //   return res.status(400).json({
  //     success: false,
  //     message: 'Payment not done'
  //   });
  // }
});

export default orderRouter;
