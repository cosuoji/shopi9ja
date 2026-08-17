import Store from '../models/Store.js';
import cloudinary from '../config/cloudinary.js';


// POST /api/upload/store-asset
export const uploadStoreAsset = async (req, res) => {
  try {
    const { assetType } = req.body;

    // Validate file and asset type
    if (
      !req.file ||
      !['logo', 'banner'].includes(assetType)
    ) {
      return res.status(400).json({
        error:
          'Valid file and assetType ("logo" or "banner") required',
      });
    }

    // Find the store belonging to the logged-in user
    const store = await Store.findOne({
      ownerId: req.user.id,
    });

    if (!store) {
      return res.status(404).json({
        error: 'Store not found',
      });
    }

    // Convert buffer to data URI
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: `atelier/stores/${store.slug}`,
      public_id: assetType,
      overwrite: true,
      invalidate: true,
      // Automatically crop to optimal framing using Cloudinary AI object detection
      transformation: [
        assetType === 'logo'
          ? { width: 500, height: 500, crop: 'fill', gravity: 'auto' }
          : { width: 1500, height: 500, crop: 'fill', gravity: 'auto' },
        { fetch_format: 'auto', quality: 'auto' }
      ]
    });

    return res.json({
      url: result.secure_url,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
