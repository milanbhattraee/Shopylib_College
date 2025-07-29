import express from 'express';
import {
  getDashboardOverview,
  getSalesAnalytics,
  getProductAnalytics,
  getCustomerAnalytics,
  getCouponAnalytics,
  getInventoryAnalytics,
  getOrderAnalytics,
  getReviewAnalytics
} from '../controllers/analytics.controller.js';

const router = express.Router();

// 📊 Dashboard Overview
router.get('/dashboard/overview', getDashboardOverview);

// 💰 Sales Analytics
router.get('/sales', getSalesAnalytics);

// 📦 Product Analytics
router.get('/products', getProductAnalytics);

// 👤 Customer Analytics
router.get('/customers', getCustomerAnalytics);

// 🎟️ Coupon Analytics
router.get('/coupons', getCouponAnalytics);

// 🧮 Inventory Analytics
router.get('/inventory', getInventoryAnalytics);

// 🧾 Order Analytics
router.get('/orders', getOrderAnalytics);

// 🌟 Review Analytics
router.get('/reviews', getReviewAnalytics);

export default router;
