import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../api/client';
import { processStoreImage } from '../../utils/imageProcessor';
import { capitalCase } from '../../utils/capitalCase';


export default function Settings() {
  const store = useAuthStore((state) => state.store);
  const setStore = useAuthStore((state) => state.setStore);
  // Construct the storefront URL using the store slug
    const storeFrontUrl = store?.slug ? `/store/${store.slug}` : null;

  const [formData, setFormData] = useState({
    bio: store?.bio || '',
    logoUrl: store?.logoUrl || '',
    bannerUrl: store?.bannerUrl || '',
  });

  const [uploading, setUploading] = useState({ logo: false, banner: false });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleImageUpload = async (e, assetType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading((prev) => ({ ...prev, [assetType]: true }));
    setMessage({ type: '', text: '' });

    try {
      const targetAspect = assetType === 'logo' ? 1.0 : 3.0;

      // Auto-crops and compresses without rejecting user input
      const processedFile = await processStoreImage(file, {
        targetAspect,
        maxDimension: assetType === 'banner' ? 1920 : 800,
        quality: 0.82,
      });

      const data = new FormData();
      data.append('image', processedFile);
      data.append('assetType', assetType);

      const res = await api.post('/api/upload/store-asset', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const key = assetType === 'logo' ? 'logoUrl' : 'bannerUrl';
      setFormData((prev) => ({ ...prev, [key]: res.data.url }));
      setMessage({ type: 'success', text: `${assetType === 'logo' ? 'Logo' : 'Banner'} updated successfully` });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || err.message || `Failed to upload ${assetType}`,
      });
    } finally {
      setUploading((prev) => ({ ...prev, [assetType]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.put('/api/store/me', {
        bio: formData.bio,
        logoUrl: formData.logoUrl,
        bannerUrl: formData.bannerUrl,
      });

      // Update Zustand state
      if (setStore) setStore(res.data.store);

      setMessage({ type: 'success', text: 'Store settings updated successfully' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to update store settings',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header & Preview Link */}
            <div className="border-b border-luxury-border pb-6 flex items-end justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl text-white tracking-wide uppercase">
                  Storefront Settings
                </h1>
                <p className="text-luxury-muted text-xs tracking-editorial uppercase mt-1">
                 Brand Media Settings
                </p>
              </div>

              {storeFrontUrl && (
                <a
                  href={storeFrontUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-luxury-gold/60 text-luxury-gold hover:bg-luxury-gold hover:text-luxury-black transition-all px-4 py-2 text-xs uppercase tracking-editorial shrink-0"
                >
                  <span>View Storefront</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
      {message.text && (
        <div
          className={`p-4 border text-xs tracking-wide ${
            message.type === 'success'
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400'
              : 'bg-red-950/20 border-red-500/40 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <form className="bg-luxury-charcoal border border-luxury-border/60 p-8 space-y-6" onSubmit={handleSubmit}>
        {/* Banner Image Field */}
        <div>
          <label className="block text-xs uppercase tracking-editorial text-luxury-muted mb-2">
            Storefront Header Banner
          </label>
          <div className="relative h-32 w-full bg-luxury-black border border-luxury-border overflow-hidden mb-3 flex items-center justify-center">
            {formData.bannerUrl ? (
              <img src={formData.bannerUrl} alt="Store Banner" className="w-full h-full object-cover" />
            ) : (
              <span className="text-luxury-muted text-xs uppercase tracking-widest">No Banner Set</span>
            )}
            {uploading.banner && (
              <div className="absolute inset-0 bg-luxury-black/80 flex items-center justify-center text-xs text-luxury-gold uppercase animate-pulse">
                Uploading Banner...
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'banner')}
            disabled={uploading.banner}
            className="block w-full text-xs text-luxury-muted file:mr-4 file:py-2 file:px-4 file:border file:border-luxury-border file:text-xs file:uppercase file:bg-luxury-black file:text-white hover:file:border-luxury-gold file:cursor-pointer"
          />
        </div>

        {/* Logo Image Field */}
        <div>
          <label className="block text-xs uppercase tracking-editorial text-luxury-muted mb-2">
            Store Profile Logo
          </label>
          <div className="flex items-center gap-6 mb-3">
            <div className="relative h-20 w-20 bg-luxury-black border border-luxury-border overflow-hidden flex items-center justify-center shrink-0">
              {formData.logoUrl ? (
                <img src={formData.logoUrl} alt="Store Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-luxury-muted text-[10px] uppercase">No Logo</span>
              )}
              {uploading.logo && (
                <div className="absolute inset-0 bg-luxury-black/80 flex items-center justify-center text-[10px] text-luxury-gold uppercase animate-pulse">
                  Uploading...
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'logo')}
              disabled={uploading.logo}
              className="block w-full text-xs text-luxury-muted file:mr-4 file:py-2 file:px-4 file:border file:border-luxury-border file:text-xs file:uppercase file:bg-luxury-black file:text-white hover:file:border-luxury-gold file:cursor-pointer"
            />
          </div>
        </div>

        {/* Disabled Brand Name */}
        <div>
          <label className="block text-xs uppercase tracking-editorial text-luxury-muted mb-2">
            Brand / Store Name
          </label>
          <input
            type="text"
            value={capitalCase(store?.name) || ''}
            className="w-full bg-luxury-black/50 border border-luxury-border/40 p-3 text-luxury-muted text-sm cursor-not-allowed"
            disabled
          />
        </div>

        {/* Disabled WhatsApp Number */}
        <div>
          <label className="block text-xs uppercase tracking-editorial text-luxury-muted mb-2">
            WhatsApp Concierge Number (International Format)
          </label>
          <input
            type="text"
            value={store?.whatsappNumber || ''}
            className="w-full bg-luxury-black/50 border border-luxury-border/40 p-3 text-luxury-muted text-sm font-mono cursor-not-allowed"
            disabled
          />
        </div>

        {/* Bio Input */}
        <div>
          <label className="block text-xs uppercase tracking-editorial text-luxury-muted mb-2">
            Bio
          </label>
          <textarea
            rows="3"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Bespoke luxury garments handcrafted in Lagos."
            className="w-full bg-luxury-black border border-luxury-border p-3 text-white text-sm focus:border-luxury-gold focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving || uploading.logo || uploading.banner}
          className="border border-luxury-gold text-luxury-gold text-xs uppercase tracking-editorial px-8 py-3.5 hover:bg-luxury-gold hover:text-luxury-black transition-all disabled:opacity-50"
        >
          {saving ? 'Updating...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
