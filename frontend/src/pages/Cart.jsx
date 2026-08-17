import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import api from '../api/client';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCartStore();

  // Group items by storeId
  const storeGroups = useMemo(() => {
    return cart.reduce((acc, item) => {
      const id = item.storeId;
      if (!acc[id]) {
        acc[id] = {
          storeId: id,
          storeName: item.storeName,
          whatsappNumber: item.whatsappNumber,
          currency: item.currency || 'NGN',
          items: [],
        };
      }
      acc[id].items.push(item);
      return acc;
    }, {});
  }, [cart]);

  const handleWhatsAppCheckoutForStore = async (group) => {
    const { storeId, storeName, whatsappNumber, currency, items } = group;
    console.log(group)

    if (!whatsappNumber) {
      alert(`WhatsApp contact is missing for ${storeName}.`);
      return;
    }

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Track analytics events for this specific store's items
    await Promise.all(
      items.map((item) =>
        api.post('/api/analytics/event', {
          type: 'inquiry',
          storeId,
          productId: item.productId,
          value: item.price * item.quantity,
        }).catch(() => {})
      )
    );

    let message = `Hello ${storeName}, I would like to place an order for the following item(s):\n\n`;

    items.forEach((item, index) => {
      const variantStr = Object.entries(item.selectedVariants || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');

      message += `${index + 1}. *${item.title}* (${item.quantity}x) - ${item.currency} ${(item.price * item.quantity).toLocaleString()}`;
      if (variantStr) message += ` [${variantStr}]`;
      message += `\n`;
    });

    message += `\n*Total:* ${currency} ${totalAmount.toLocaleString()}`;

    // Clean phone number (strip spaces/dashes)
    const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-luxury-black text-white flex flex-col items-center justify-center p-6 space-y-4">
        <h1 className="font-serif text-2xl uppercase tracking-wide">Your Bag is Empty</h1>
        <p className="text-luxury-muted text-xs uppercase tracking-editorial">Explore the catalog to add items.</p>
        <Link to="/" className="text-luxury-gold text-xs uppercase tracking-editorial hover:underline pt-2">
          Return to Marketplace →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex items-center justify-between border-b border-luxury-border pb-6">
          <h1 className="font-serif text-3xl uppercase tracking-wide">Shopping Bag</h1>
          <button onClick={clearCart} className="text-luxury-muted text-xs uppercase hover:text-red-400 transition-colors">
            Clear Entire Bag
          </button>
        </div>

        {/* Render each store as an isolated order block */}
        <div className="space-y-12">
          {Object.values(storeGroups).map((group) => {
            const groupTotal = group.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

            return (
              <div key={group.storeId} className="bg-luxury-charcoal/40 border border-luxury-border/80 p-6 space-y-6">
                {/* Store Sub-header */}
                <div className="flex items-center justify-between border-b border-luxury-border/60 pb-4">
                  <h2 className="font-serif text-xl uppercase tracking-wider text-luxury-gold">
                    Store: {group.storeName}
                  </h2>
                  <span className="text-luxury-muted text-xs uppercase font-mono">
                    {group.items.length} {group.items.length === 1 ? 'Item' : 'Items'}
                  </span>
                </div>

                {/* Store Items List */}
                <div className="divide-y divide-luxury-border/40">
                  {group.items.map((item) => (
                    <div key={item.cartItemId} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-luxury-black border border-luxury-border overflow-hidden shrink-0">
                          {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <h3 className="font-serif text-base uppercase">{item.title}</h3>
                          <p className="font-mono text-luxury-gold text-xs mt-0.5">
                            {item.currency} {Number(item.price).toLocaleString()}
                          </p>
                          {Object.keys(item.selectedVariants).length > 0 && (
                            <div className="text-luxury-muted text-[10px] uppercase mt-1">
                              {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                        <div className="flex items-center border border-luxury-border">
                          <button onClick={() => updateQuantity(item.cartItemId, -1)} className="px-3 py-1 text-luxury-muted hover:text-white">-</button>
                          <span className="px-3 py-1 font-mono text-xs">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartItemId, 1)} className="px-3 py-1 text-luxury-muted hover:text-white">+</button>
                        </div>

                        <div className="text-right">
                          <p className="font-mono text-sm">
                            {item.currency} {(item.price * item.quantity).toLocaleString()}
                          </p>
                          <button onClick={() => removeFromCart(item.cartItemId)} className="text-[10px] text-red-400 uppercase hover:underline mt-1">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Store Specific Checkout Footer */}
                <div className="pt-4 border-t border-luxury-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <span className="text-[10px] uppercase text-luxury-muted tracking-editorial block">Selection Subtotal</span>
                    <span className="font-mono text-lg text-white">{group.currency} {groupTotal.toLocaleString()}</span>
                  </div>

                  <button
                    onClick={() => handleWhatsAppCheckoutForStore(group)}
                    className="w-full sm:w-auto px-8 py-3 bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-editorial hover:bg-white transition-colors"
                  >
                    Inquire Order with {group.storeName} →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
