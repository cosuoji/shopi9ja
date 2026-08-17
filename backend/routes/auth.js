// routes/auth.js
import express from 'express';
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  checkStoreName
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Apply authLimiter only to sensitive authentication endpoints
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Non-sensitive read operations don't need strict auth rate limiting
router.get('/me', protect, getMe);
router.get('/check-store-name', checkStoreName);

export default router;
