import express from 'express';
import {
  getMyStore,
  getPublicStore,
  updateStore,
  getStoreCategories,
} from '../controllers/storeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/public/:slug', getPublicStore);

// Protected routes (Merchants)
router.get('/me', protect, getMyStore);
router.put('/me', protect, updateStore);
router.get('/me/categories', protect, getStoreCategories);

export default router;
