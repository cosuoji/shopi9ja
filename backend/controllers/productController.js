import Product from '../models/Product.js';
import Store from '../models/Store.js';
import slugify from 'slugify';


// Helper to extract Mongo ID from hybrid slug
const extractId = (slug) => {
  const parts = slug.split('--');
  return parts[parts.length - 1];
};

const generateUniqueSlug = async (title, storeId) => {
  const baseSlug = slugify(title, {
    lower: true,
    strict: true,
  });

  let slug = baseSlug;
  let count = 1;

  while (await Product.exists({ storeId: storeId, slug })) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
};


// @desc    Create a new product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      compareAtPrice,
      stockQuantity,
      images,
      variants,
    } = req.body;

    // Validate required fields
    if (!title || price === undefined) {
      return res.status(400).json({
        error: 'Title and Price are required',
      });
    }

    // Find the store belonging to the logged-in user
    const store = await Store.findOne({
      ownerId: req.user.id,
    });

    if (!store) {
      return res.status(404).json({
        error: 'Store not found for this user',
      });
    }

    // Sanitize category
    const formattedCategory = (category || 'GENERAL')
      .trim()
      .toUpperCase();

    // Generate a unique slug within this store

    const slug = await generateUniqueSlug(
      title,
      store._id
    );

    const product = await Product.create({
      storeId: store._id,
      title,
      description,
      category: formattedCategory,
      price,
      slug,
      compareAtPrice,
      stockQuantity: stockQuantity || 0,
      images: Array.isArray(images) ? images : [],
      variants: Array.isArray(variants) ? variants : [],
    });

    return res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error creating product:', error);

    return res.status(500).json({
      error: error.message,
    });
  }
};

// @desc    Get all products for current merchant (Dashboard)
// @route   GET /api/products/me
// @access  Private
export const getMyProducts = async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.user.id });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const { category, search } = req.query;
    let query = { storeId: store._id };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return res.json({ success: true, count: products.length, products });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Get public products for storefront buyers
// @route   GET /api/products/public/:storeSlug
// @access  Public
export const getPublicProducts = async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.storeSlug });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const { category } = req.query;
    let query = { storeId: store._id, isAvailable: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return res.json({ success: true, count: products.length, products });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ success: true, product, store });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.user.id });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Ensure the product belongs to the merchant's store
    if (product.storeId.toString() !== store._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.user.id });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Ownership check
    if (product.storeId.toString() !== store._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    await product.deleteOne();

    return res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


// @desc    Get dynamic categories used by a store
// @route   GET /api/products/categories/:storeSlug
// @access  Public
export const getStoreCategories = async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.storeSlug });
    if (!store) return res.status(404).json({ error: 'Store not found' });

    const categories = await Product.distinct('category', { storeId: store._id });
    return res.json({ success: true, categories });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const { productSlug } = req.params;

    const productId = extractId(productSlug);

    // Validate extracted Mongo ObjectId
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid product identifier',
      });
    }

    const product = await Product.findById(productId)
      .populate('storeId', 'name slug');
    const store = await Store.findById(product.storeId);
    if (!product) {
      return res.status(404).json({
        error: 'Piece not found',
      });
    }

    return res.json({
      product,
      store,
    });
  } catch (error) {
    console.error(
      'Error fetching product by hybrid slug:',
      error
    );

    return res.status(500).json({
      error: 'Server error',
    });
  }
};
