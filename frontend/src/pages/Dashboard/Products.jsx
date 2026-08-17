import { useEffect, useState } from 'react';
import api from '../../api/client';
import AddProductModal from '../../components/AddProductModal';
import EditProductModal from '../../components/EditProductModal';
import { useAuthStore } from '../../store/useAuthStore';

export default function Products() {
  const { store } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/products/me/all');
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductAdded = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts((prev) => prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p)));
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this piece from your catalog?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const existingCategories = Array.from(new Set(products.map((p) => p.category)));
  const filteredProducts =
    selectedCategory === 'ALL'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-luxury-border pb-6">
        <div>
          <h1 className="font-serif text-3xl text-white tracking-wide uppercase">Catalog</h1>
          <p className="text-luxury-muted text-xs tracking-editorial uppercase mt-1">
            Manage Collection
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-editorial px-6 py-3 hover:bg-luxury-gold-hover transition-colors"
        >
          + Add New Piece
        </button>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 border-b border-luxury-border/40">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-4 py-2 text-xs uppercase tracking-editorial transition-colors whitespace-nowrap ${
            selectedCategory === 'ALL' ? 'bg-luxury-gold text-black font-semibold' : 'text-luxury-muted hover:text-white'
          }`}
        >
          All ({products.length})
        </button>
        {existingCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs uppercase tracking-editorial transition-colors whitespace-nowrap ${
              selectedCategory === cat ? 'bg-luxury-gold text-black font-semibold' : 'text-luxury-muted hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-luxury-charcoal border border-luxury-border/60 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs uppercase text-luxury-gold animate-pulse">Loading Catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs uppercase text-luxury-muted">No pieces found in this collection.</div>
        ) : (
          <table className="w-full text-left text-xs uppercase tracking-wider">
            <thead>
              <tr className="border-b border-luxury-border text-luxury-muted bg-luxury-black/50">
                <th className="p-4">Piece</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border/40 text-white">
              {filteredProducts.map((item) => (
                <tr key={item._id} className="hover:bg-luxury-black/30 transition-colors">
                  <td className="p-4 font-serif text-sm flex items-center gap-4">
                    <div className="h-12 w-12 bg-luxury-black border border-luxury-border overflow-hidden shrink-0">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-luxury-muted">N/A</div>
                      )}
                    </div>
                    <span>{item.title}</span>
                  </td>
                  <td className="p-4 text-luxury-muted">{item.category}</td>
                  <td className="p-4 font-mono text-luxury-gold">₦ {Number(item.price).toLocaleString()}</td>
                  <td className="p-4 font-mono">{item.stockQuantity} Units</td>
                  <td className="p-4 text-right space-x-4">
                    <button onClick={() => setEditingProduct(item)} className="text-luxury-gold hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={handleProductAdded}
        existingCategories={existingCategories}
        storeSlug={store?.slug}
      />

      <EditProductModal
        isOpen={!!editingProduct}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onProductUpdated={handleProductUpdated}
      />
    </div>
  );
}
