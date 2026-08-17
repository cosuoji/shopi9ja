import { useState, useEffect } from 'react';
import api from '../api/client';

export default function EditProductModal({ isOpen, onClose, product, storeSlug, onProductUpdated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stockQuantity: '',
  });

  // State for existing remote Cloudinary URLs vs new local File uploads
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  // Variants state
  const [variants, setVariants] = useState([]);
  const [variantName, setVariantName] = useState('');
  const [variantOptionInput, setVariantOptionInput] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        stockQuantity: product.stockQuantity || 0,
      });
      setExistingImages(product.images || []);
      setVariants(product.variants || []);
      setNewImageFiles([]);
      setNewImagePreviews([]);
    }
  }, [product]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImagePreviews]);

  if (!isOpen || !product) return null;

  // Image handling
  const totalImagesCount = existingImages.length + newImageFiles.length;

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + totalImagesCount > 3) {
      alert('Maximum 3 imagery pieces allowed per item');
      return;
    }

    const updatedFiles = [...newImageFiles, ...files];
    setNewImageFiles(updatedFiles);

    const updatedPreviews = updatedFiles.map((file) => URL.createObjectURL(file));
    setNewImagePreviews(updatedPreviews);
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImageFiles(newImageFiles.filter((_, i) => i !== index));
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
  };

  // Variant handling
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

  // Cloudinary direct unsigned upload for new image files
  const uploadNewImagesToCloudinary = async () => {
    if (newImageFiles.length === 0) return [];

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_PRESET || 'maison_unsigned';
    const folderPath = `atelier/stores/${storeSlug}/products`;

    const uploadPromises = newImageFiles.map(async (file) => {
      const bodyData = new FormData();
      bodyData.append('file', file);
      bodyData.append('upload_preset', preset);
      bodyData.append('folder', folderPath);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: bodyData,
      });
      const data = await res.json();
      return data.secure_url;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Upload new files to Cloudinary
      const newlyUploadedUrls = await uploadNewImagesToCloudinary();

      // Combine remaining existing URLs with freshly uploaded URLs
      const finalImages = [...existingImages, ...newlyUploadedUrls];

      const payload = {
        ...formData,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        images: finalImages,
        variants,
      };

      const res = await api.put(`/api/products/${product._id}`, payload);
      onProductUpdated(res.data.product);
      onClose();
    } catch (err) {
      console.error('Failed to update product details:', err);
      alert('Failed to update product details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-luxury-charcoal border border-luxury-border w-full max-w-lg p-6 space-y-6 my-8">
        <div className="flex justify-between items-center border-b border-luxury-border pb-4">
          <h2 className="font-serif text-xl uppercase text-white">Edit Piece Details</h2>
          <button onClick={onClose} className="text-luxury-muted hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs uppercase">
          <div>
            <label className="text-luxury-muted block mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-luxury-black border border-luxury-border p-3 text-white focus:border-luxury-gold outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-luxury-muted block mb-1">Price (NGN)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-luxury-black border border-luxury-border p-3 text-white focus:border-luxury-gold outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-luxury-muted block mb-1">Stock Quantity</label>
              <input
                type="number"
                required
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                className="w-full bg-luxury-black border border-luxury-border p-3 text-white focus:border-luxury-gold outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-luxury-muted block mb-1">Category</label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-luxury-black border border-luxury-border p-3 text-white focus:border-luxury-gold outline-none"
            />
          </div>

          {/* Imagery Grid */}
          <div className="space-y-2">
            <label className="text-luxury-muted block">Imagery Pieces (Max 3)</label>
            <div className="grid grid-cols-3 gap-3">
              {/* Existing Cloudinary Images */}
              {existingImages.map((url, idx) => (
                <div key={`existing-${idx}`} className="relative group h-24 bg-luxury-black border border-luxury-border overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(idx)}
                    className="absolute inset-0 bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {/* New Unsaved Local Image Previews */}
              {newImagePreviews.map((preview, idx) => (
                <div key={`new-${idx}`} className="relative group h-24 bg-luxury-black border border-luxury-gold overflow-hidden">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute inset-0 bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {/* Add Image Button */}
              {totalImagesCount < 3 && (
                <label className="h-24 border border-dashed border-luxury-border flex flex-col items-center justify-center cursor-pointer hover:border-luxury-gold transition-colors bg-luxury-black">
                  <span className="text-xl text-luxury-gold">+</span>
                  <span className="text-[9px] text-luxury-muted mt-1">Add Image</span>
                  <input type="file" multiple accept="image/*" onChange={handleImagesChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Variants Management */}
          <div className="space-y-3 pt-2">
            <label className="text-luxury-muted block">Variants (e.g., Size, Color)</label>
            {variants.map((v, idx) => (
              <div key={idx} className="flex justify-between items-center bg-luxury-black border border-luxury-border p-2">
                <span className="text-white">{v.name}: <span className="text-luxury-muted">{v.options.join(', ')}</span></span>
                <button type="button" onClick={() => removeVariant(idx)} className="text-red-400 hover:text-red-300 ml-2">✕</button>
              </div>
            ))}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Name (Size)"
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                className="w-1/3 bg-luxury-black border border-luxury-border p-2 text-white outline-none"
              />
              <input
                type="text"
                placeholder="Options (S, M, L)"
                value={variantOptionInput}
                onChange={(e) => setVariantOptionInput(e.target.value)}
                className="w-2/3 bg-luxury-black border border-luxury-border p-2 text-white outline-none"
              />
              <button type="button" onClick={addVariant} className="bg-luxury-border text-white px-3 py-2 hover:bg-luxury-gold hover:text-black">
                +
              </button>
            </div>
          </div>

          <div>
            <label className="text-luxury-muted block mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-luxury-black border border-luxury-border p-3 text-white focus:border-luxury-gold outline-none normal-case"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-luxury-border">
            <button type="button" onClick={onClose} className="px-4 py-2 text-luxury-muted hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-luxury-gold text-black px-6 py-2 font-semibold hover:bg-luxury-gold-hover transition-colors"
            >
              {loading ? 'Saving Piece...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
