import Store from '../models/Store.js';
import Product from '../models/Product.js';

// @desc    Get currently logged in merchant's store
// @route   GET /api/stores/me
// @access  Private
export const getMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.user.id });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    return res.json({ success: true, store });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Get public store by slug (For Storefront Buyers)
// @route   GET /api/stores/public/:slug
// @access  Public
export const getPublicStore = async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug });
    const products = await Product.find({ storeId: store._id });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    return res.json({ success: true, store, products });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Update store settings (Name, WhatsApp number, Logo, Banner)
// @route   PUT /api/stores/me
// @access  Private
export const updateStore = async (req, res) => {
  try {
    const { name, whatsappNumber, logoUrl, bannerUrl, currency, bio } = req.body;

    const store = await Store.findOne({ ownerId: req.user.id });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    if (name) store.name = name;
    if (whatsappNumber) store.whatsappNumber = whatsappNumber.replace(/[^0-9]/g, '');
    if (logoUrl !== undefined) store.logoUrl = logoUrl;
    if (bannerUrl !== undefined) store.bannerUrl = bannerUrl;
    if (currency) store.currency = currency;
    if (bio !== undefined) store.bio = bio;

    await store.save();

    return res.json({ success: true, store });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Get all unique categories for a store
// @route   GET /api/stores/me/categories
// @access  Private
export const getStoreCategories = async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.user.id });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Get distinct categories created across all products in this store
    const categories = await Product.distinct('category', { storeId: store._id });

    return res.json({ success: true, categories });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
