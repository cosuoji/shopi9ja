import express from 'express';
import {
  createOrder,
  getMyOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route for customers clicking checkout
router.post('/public', createOrder);

// Protected routes for merchants
router.get('/me', protect, getMyOrders);
router.put('/:id/status', protect, updateOrderStatus);

export default router;
