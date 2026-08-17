import { Router } from 'express';
import { trackEvent, getStoreAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// POST /api/analytics/event
router.post('/event', trackEvent);

// GET /api/analytics/store/:storeId
router.get('/store/:storeId', protect, getStoreAnalytics);

export default router;
