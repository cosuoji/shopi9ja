import express from 'express';
import {
  createProduct,
  getMyProducts,
  getPublicProducts,
  getProductBySlug,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public Storefront Routes
router.get('/public/:storeSlug', getPublicProducts);
router.get('/:id', getProductById);
router.get('/slug/:productSlug', getProductBySlug);

// Protected Merchant Routes
router.use(protect); // Applies auth middleware to all routes below

router.post('/', createProduct);
router.get('/me/all', getMyProducts);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
