const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/analytics/dashboard
// @desc    Get general analytics dashboard stats
// @access  Private (Admin, SalesManager)
router.get('/dashboard', protect, authorize('Admin', 'SalesManager'), async (req, res) => {
  try {
    // Basic stats
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalDealers = await User.countDocuments({ role: 'Dealer' });
    
    // Revenue calc (Sum of delivered/dispatched/approved orders amount)
    const validOrders = await Order.find({ status: { $in: ['Approved', 'Dispatched', 'Delivered'] } });
    const totalRevenue = validOrders.reduce((acc, order) => acc + order.totalAmount, 0);

    // Recent orders
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('dealer', 'name companyName');

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      totalOrders,
      totalProducts,
      totalDealers,
      totalRevenue,
      recentOrders,
      ordersByStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
