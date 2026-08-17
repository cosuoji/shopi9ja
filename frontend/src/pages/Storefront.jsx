import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import useSEO from '../hooks/useSEO';
import { capitalCase } from '../utils/capitalCase';


export default function Storefront() {
  const { slug } = useParams();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);


  const storeSchema =
    store
      ? {
          "@context": "https://schema.org",
          "@type": "OnlineStore",

          name: store.name,

          description:
            store.bio ||
            `Shop products from ${store.name} on Independent Markets.`,

          url: `https://independentmarkets.netlify.app/store/${store.slug}`,

          ...(store.logoUrl && {
            logo: store.logoUrl,
          }),

          ...(store.bannerUrl && {
            image: store.bannerUrl,
          }),
        }
      : null;

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const res = await api.get(`/api/store/public/${slug}`);
        setStore(res.data.store);
        setProducts(res.data.products || []);
      } catch (err) {
        console.error('Error fetching storefront:', err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchStoreData();
  }, [slug]);


  useSEO({
    title: store
      ? `${store.name} — Shop Online | Independent Markets`
      : "Loading Store | Independent Markets",
    description:
      store?.bio
        ? store.bio.slice(0, 155)
        : store
          ? `Explore products from ${store.name} on Independent Markets.`
          : "Explore independent stores on Independent Markets.",
    canonical: store
      ? `https://independentmarkets.netlify.app/store/${store.slug}`
      : undefined,
    ogImage:
      store?.bannerUrl ||
      store?.logoUrl ||
      "/default-preview.png",
    ogType: "website",
    structuredData: storeSchema,
  });
  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center text-luxury-gold text-xs uppercase tracking-editorial animate-pulse">
        Loading Atelier Storefront...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black text-white selection:bg-luxury-gold selection:text-black">
      {/* Banner */}
      <div className="relative h-48 sm:h-64 bg-luxury-charcoal border-b border-luxury-border overflow-hidden">
        {store?.bannerUrl && <img src={store.bannerUrl} alt={store.name} className="w-full h-full object-cover" />}
      </div>

      {/* Header Profile */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-10 pb-12 border-b border-luxury-border/40 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="h-28 w-28 bg-luxury-black border border-luxury-border p-1 shrink-0 overflow-hidden shadow-2xl">
            {store?.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-luxury-charcoal flex items-center justify-center text-luxury-gold text-2xl font-serif">
                {store?.name?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h1 className="font-serif pt-22 text-4xl text-white tracking-wide uppercase">{store?.name}</h1>
            <p className="text-luxury-muted text-sm max-w-xl font-light">{store?.bio}</p>
          </div>
        </div>
      </div>

      {/* Product Catalog Grid */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-xs uppercase tracking-editorial text-luxury-muted mb-8">Items ({products.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} storeSlug={slug} />
          ))}
        </div>
      </main>
    </div>
  );
}
