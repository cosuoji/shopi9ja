import express from 'express';
import multer from 'multer';

import { protect } from '../middleware/auth.js';
import { uploadStoreAsset } from '../controllers/uploadController.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post(
  '/store-asset',
  protect,
  upload.single('image'),
  uploadStoreAsset
);

export default router;
