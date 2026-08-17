import { Link } from 'react-router-dom';
import { createHybridSlug } from '../utils/slugify';

export default function ProductCard({ product, storeSlug }) {
  const hybridSlug = createHybridSlug(product.title, product._id);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="group relative bg-luxury-black border border-luxury-border/40 overflow-hidden flex flex-col justify-between transition-all duration-500 hover:border-luxury-gold/50">
      {/* Clickable Image Container */}
      <Link to={`/store/${storeSlug}/product/${hybridSlug}`} className="block relative aspect-[3/4] w-full overflow-hidden bg-luxury-charcoal">
        <img
          src={
            product.images?.[0]
              ? product.images[0].replace('/upload/', '/upload/w_600,f_auto,q_auto/')
              : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
          }
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Details */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <span className="text-[10px] tracking-widest text-luxury-muted uppercase block mb-1">
            {product.category || 'COLLECTION'}
          </span>
          <Link to={`/store/${storeSlug}/product/${hybridSlug}`}>
            <h3 className="font-serif text-lg text-white font-normal tracking-wide truncate hover:text-luxury-gold transition-colors">
              {product.title}
            </h3>
          </Link>
          <p className="mt-2 font-mono text-luxury-gold text-sm">
            {formatCurrency(product.price)}
          </p>
        </div>

        {/* Action */}
        <Link to={`/store/${storeSlug}/product/${hybridSlug}`}>
          <button
            className="mt-5 w-full border border-luxury-border text-white text-xs tracking-editorial uppercase py-3 hover:border-luxury-gold hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300"
          >
            VIEW ITEM
          </button>
        </Link>
      </div>
    </div>
  );
}
