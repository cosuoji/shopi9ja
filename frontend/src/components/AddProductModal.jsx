import { useState } from 'react';
import api from '../api/client';

const SUGGESTED_CATEGORIES = [
  'READY-TO-WEAR',
  'HAUTE COUTURE',
  'LEATHER GOODS',
  'ACCESSORIES',
  'FOOTWEAR',
  'BESPOKE',
];

export default function AddProductModal({
  isOpen,
  onClose,
  onProductAdded,
  existingCategories = [],
  storeSlug, // Pass store slug/name as prop
}) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(SUGGESTED_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCat, setIsCustomCat] = useState(false);
  const [description, setDescription] = useState('');
  const [stockQuantity, setStockQuantity] = useState(1);

  // Multi-image management
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Variants management
  const [variants, setVariants] = useState([]);
  const [variantName, setVariantName] = useState('');
  const [variantOptionInput, setVariantOptionInput] = useState('');

  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const allCategoryOptions = Array.from(new Set([...SUGGESTED_CATEGORIES, ...existingCategories]));

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 3) {
      alert('Maximum 3 imagery pieces allowed per item');
      return;
    }

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const removeImage = (index) => {
    const updatedFiles = imageFiles.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(updatedFiles);
    setImagePreviews(updatedPreviews);
  };

  const addVariant = () => {
    if (!variantName.trim() || !variantOptionInput.trim()) return;
    const options = variantOptionInput.split(',').map((opt) => opt.trim()).filter(Boolean);

    setVariants([...variants, { name: variantName.trim(), options }]);
    setVariantName('');
    setVariantOptionInput('');
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Upload images to store-specific folder on Cloudinary
  const uploadImagesToCloudinary = async () => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_PRESET || 'maison_unsigned';

    // Target folder structure: atelier_stores/{storeSlug}/products
    const folderPath = `atelier/stores/${storeSlug}/products`;

    const uploadPromises = imageFiles.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);
      formData.append('folder', folderPath);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      return data.secure_url;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let uploadedUrls = [];
      if (imageFiles.length > 0) {
        uploadedUrls = await uploadImagesToCloudinary();
      }

      const finalCategory = isCustomCat ? customCategory.trim().toUpperCase() : category;

      const payload = {
        title,
        price: Number(price),
        category: finalCategory || 'GENERAL',
        description,
        stockQuantity: Number(stockQuantity),
        images: uploadedUrls,
        variants,
      };

      const res = await api.post('/api/products', payload);
      onProductAdded(res.data.product);
      onClose();
    } catch (err) {
      console.error('Error creating piece:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-luxury-charcoal border border-luxury-border p-8 space-y-6 relative max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-luxury-border pb-4">
          <h2 className="font-serif text-2xl text-white tracking-wide uppercase">Commission New Piece</h2>
          <button onClick={onClose} className="text-luxury-muted hover:text-white text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Piece Title */}
          <div>
            <label className="block text-xs uppercase tracking-editorial text-luxury-muted mb-1">Piece Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Silk Atelier Robe"
              className="w-full bg-luxury-black border border-luxury-border p-3 text-white text-sm focus:border-luxury-gold focus:outline-none"
            />
          </div>

          {/* Price, Stock & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-editorial text-luxury-muted mb-1">Price (NGN)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="250000"
                className="w-full bg-luxury-black border border-luxury-border p-3 text-white text-sm font-mono focus:border-luxury-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-editorial text-luxury-muted mb-1">Stock Units</label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full bg-luxury-black border border-luxury-border p-3 text-white text-sm font-mono focus:border-luxury-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-editorial text-luxury-muted mb-1">Category</label>
              {!isCustomCat ? (
                <select
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === 'NEW') {
                      setIsCustomCat(true);
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  className="w-full bg-luxury-black border border-luxury-border p-3 text-white text-sm focus:border-luxury-gold focus:outline-none uppercase"
                >
                  {allCategoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="NEW">+ Create New Category...</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="BRIDAL"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-luxury-black border border-luxury-border p-3 text-white text-sm uppercase focus:border-luxury-gold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomCat(false)}
                    className="text-xs text-luxury-muted hover:text-white px-2"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Custom Variants Section */}
          <div className="border-t border-b border-luxury-border/60 py-4 space-y-3">
            <label className="block text-xs uppercase tracking-editorial text-luxury-muted">
              Piece Options / Variants (e.g. Sizes, Colors)
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Option Name (e.g. Size)"
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                className="w-1/3 bg-luxury-black border border-luxury-border p-2.5 text-xs text-white focus:border-luxury-gold focus:outline-none"
              />
              <input
                type="text"
                placeholder="Values separated by comma (S, M, L, XL)"
                value={variantOptionInput}
                onChange={(e) => setVariantOptionInput(e.target.value)}
                className="w-2/3 bg-luxury-black border border-luxury-border p-2.5 text-xs text-white focus:border-luxury-gold focus:outline-none"
              />
              <button
                type="button"
                onClick={addVariant}
                className="px-4 bg-luxury-border text-white text-xs uppercase hover:bg-luxury-gold hover:text-black shrink-0 transition-colors"
              >
                + Add
              </button>
            </div>

            {/* Display Added Variants */}
            {variants.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {variants.map((v, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 bg-luxury-black border border-luxury-border px-3 py-1 text-xs text-white"
                  >
                    <strong className="text-luxury-gold uppercase">{v.name}:</strong> {v.options.join(', ')}
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="text-luxury-muted hover:text-red-400 text-sm ml-1"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-editorial text-luxury-muted mb-1">Editorial Description</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hand-stitched silk satin robe tailored with mother-of-pearl accents..."
              className="w-full bg-luxury-black border border-luxury-border p-3 text-white text-sm focus:border-luxury-gold focus:outline-none"
            />
          </div>

          {/* Multi-Image Upload */}
          <div>
            <label className="block text-xs uppercase tracking-editorial text-luxury-muted mb-1">
              Imagery Upload (Max 3)
            </label>
            <div className="border border-dashed border-luxury-border p-4 text-center cursor-pointer hover:border-luxury-gold transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImagesChange}
                className="hidden"
                id="modal-multi-image-upload"
              />
              <label htmlFor="modal-multi-image-upload" className="cursor-pointer text-xs text-luxury-muted uppercase tracking-wider block">
                + Add Gallery Images ({imageFiles.length}/3)
              </label>
            </div>

            {/* Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-3 mt-3">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative group h-20 bg-luxury-black border border-luxury-border">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black/80 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex justify-end space-x-4 border-t border-luxury-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-luxury-border text-xs uppercase tracking-editorial text-luxury-muted hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-3 bg-luxury-gold text-luxury-black text-xs uppercase tracking-editorial font-semibold hover:bg-luxury-gold-hover disabled:opacity-50"
            >
              {isUploading ? 'Publishing Piece...' : 'Publish to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
