const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private (Dealer only)
router.post('/', protect, authorize('Dealer'), async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Verify products and calculate total
    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      
      const price = product.price;
      totalAmount += price * item.quantity;
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: price
      });
    }

    const order = await Order.create({
      dealer: req.user._id,
      items: orderItems,
      shippingAddress,
      totalAmount
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/myorders
// @desc    Get logged in dealer's orders
// @access  Private (Dealer)
router.get('/myorders', protect, authorize('Dealer'), async (req, res) => {
  try {
    const orders = await Order.find({ dealer: req.user._id }).populate('items.product', 'name sku price images');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private (Admin, SalesManager)
router.get('/', protect, authorize('Admin', 'SalesManager'), async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('dealer', 'name email companyName phone')
      .populate('items.product', 'name sku price');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('dealer', 'name email companyName phone address')
      .populate('items.product', 'name sku price images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if Dealer is accessing their own order, or if it's Admin/SalesManager
    if (req.user.role === 'Dealer' && order.dealer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Admin, SalesManager)
router.put('/:id/status', protect, authorize('Admin', 'SalesManager'), async (req, res) => {
  try {
    const { status, priority } = req.body;
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status) order.status = status;
    if (priority) order.priority = priority;

    const updatedOrder = await order.save();
    
    // Check if status is approved/dispatched to adjust inventory -- simplified for now
    if (status === 'Approved' && order.status !== 'Approved') {
       // logic to deduct stock could go here
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
