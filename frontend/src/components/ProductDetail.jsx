import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useCartStore } from '../store/useCartStore';
import useSEO from '../hooks/useSEO';
import { capitalCase } from '../utils/capitalCase';



export default function ProductDetail() {
  const { productSlug } = useParams();
  const [store, setStore] = useState(null);
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [loading, setLoading] = useState(true);

  // Toast Notification State
  const [showToast, setShowToast] = useState(false);

  const addToCart = useCartStore((state) => state.addToCart);
  const quantity = product?.stockQuantity;

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const res = await api.get(`/api/products/slug/${productSlug}`);

        setStore(res.data.store);
        setProduct(res.data.product);

        api.post('/api/analytics/event', {
          type: 'view',
          storeId: res.data.product.storeId,
          productId: res.data.product._id,
        }).catch(() => {});
      } catch (err) {
        console.error('Failed to load piece:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [productSlug]);

  const handleVariantSelect = (variantName, value) => {
    setSelectedVariants((prev) => ({ ...prev, [variantName]: value }));
  };

  const handleAddToCart = () => {
    addToCart(product, store, selectedVariants);
    setShowToast(true);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  useSEO({
    title: store
      ? `${capitalCase(product?.title)} - ${capitalCase(store.name)}`
      : "Loading Storefront...",
    description:
      `View ${capitalCase(product?.title)} by ${capitalCase(store?.name)}.`,
    ogImage: product.images?.[selectedImage] || "/default-preview.png",
    ogType: "website",
  });

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center text-luxury-gold text-xs uppercase tracking-editorial animate-pulse">
        Loading Piece Details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black text-white p-6 md:p-12 relative selection:bg-luxury-gold selection:text-black">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Link
            to={`/store/${store?.slug}`}
            className="text-luxury-muted text-xs uppercase tracking-editorial hover:text-white transition-colors"
          >
            ← Back to {store?.name || 'Catalog'}
          </Link>
          <Link
            to="/cart"
            className="text-luxury-gold text-xs uppercase tracking-editorial hover:underline"
          >
            View Shopping Bag
          </Link>
        </div>

        {/* Detail Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="h-96 md:h-[28rem] bg-luxury-charcoal border border-luxury-border overflow-hidden">
              <img
                src={product.images?.[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-16 w-16 border ${
                      selectedImage === idx ? 'border-luxury-gold' : 'border-luxury-border'
                    } overflow-hidden bg-luxury-charcoal transition-all`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info & Options */}
          <div className="space-y-6">
            <div>
              <span className="text-[10px] tracking-widest text-luxury-gold uppercase block mb-1">
                {product.category || 'COLLECTION'}
              </span>
              <h1 className="font-serif text-3xl text-white tracking-wide uppercase">
                {product.title}
              </h1>
              <p className="font-mono text-xl text-white mt-2">
                {store?.currency || 'NGN'} {Number(product.price).toLocaleString()}
              </p>
            </div>

            <p className="text-luxury-muted text-xs leading-relaxed border-t border-b border-luxury-border/60 py-4 font-light">
              {product.description}
            </p>

            {product.variants?.map((v) => (
              <div key={v.name} className="space-y-2">
                <label className="text-xs uppercase tracking-editorial text-luxury-muted block">
                  {v.name}
                </label>
                <div className="flex flex-wrap gap-2">
                  {v.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleVariantSelect(v.name, option)}
                      className={`px-4 py-2 text-xs uppercase border transition-all ${
                        selectedVariants[v.name] === option
                          ? 'border-luxury-gold bg-luxury-gold text-luxury-black font-semibold'
                          : 'border-luxury-border text-white hover:border-luxury-gold'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={handleAddToCart}
              disabled={quantity === 0}
              className={`w-full py-4 text-xs uppercase tracking-editorial font-semibold transition-all duration-300 ${
                quantity === 0
                  ? 'bg-luxury-charcoal text-luxury-muted border border-luxury-border cursor-not-allowed'
                  : 'bg-luxury-gold text-luxury-black hover:bg-white'
              }`}
            >
              {quantity === 0 ? 'Out of Stock' : 'Add Piece to Bag'}
            </button>
          </div>
        </div>
      </div>

      {/* Atelier Luxury Toast Notification */}
      {showToast && (
        <div
          className="fixed bottom-8 right-8 z-50 flex items-center gap-4 bg-luxury-charcoal/95 backdrop-blur-md border border-luxury-gold/40 shadow-2xl p-4 max-w-sm animate-slide-up"
          style={{
            animation: 'toastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* Thumbnail Preview */}
          <div className="h-12 w-12 shrink-0 bg-luxury-black border border-luxury-border overflow-hidden">
            <img
              src={product.images?.[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] tracking-widest text-luxury-gold uppercase">Added To Selection</p>
            <h4 className="font-serif text-sm text-white truncate">{product.title}</h4>
            <Link
              to="/cart"
              className="text-[11px] text-luxury-muted hover:text-white underline tracking-editorial uppercase mt-0.5 inline-block"
            >
              View Bag & Checkout →
            </Link>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowToast(false)}
            className="text-luxury-muted hover:text-white p-1 text-xs transition-colors self-start"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Inline Animation Style Keyframes */}
      <style>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
