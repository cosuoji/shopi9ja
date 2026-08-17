import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Size", "Color", "Material"
  options: [{ type: String, required: true }], // e.g. ["S", "M", "L", "XL"]
});

const productSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, required: true, trim: true, default: 'GENERAL' },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stockQuantity: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    images: [{ type: String }], // Array of Cloudinary image URLs
    variants: [variantSchema],
  },
  { timestamps: true }
);

// Index for dynamic category lookups per store
productSchema.index({ storeId: 1, category: 1 });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
