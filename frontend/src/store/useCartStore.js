import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (product, store, selectedVariants) => {
        const cart = get().cart;
        const variantString = Object.entries(selectedVariants || {})
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}:${v}`)
          .join('|');

        const cartItemId = `${product._id}-${variantString}`;
        const existingIndex = cart.findIndex((item) => item.cartItemId === cartItemId);
        if (existingIndex > 0 || existingIndex === 0) {
          const updatedCart = [...cart];
          updatedCart[existingIndex].quantity += 1;
          set({ cart: updatedCart });
        } else {
          set({
            cart: [
              ...cart,
              {
                cartItemId,
                productId: product._id,
                title: product.title,
                price: product.price,
                image: product.images?.[0] || '',
                selectedVariants: { ...selectedVariants },
                quantity: 1,
                storeId: store._id,
                storeName: store.name,
                whatsappNumber: store.whatsappNumber,
                currency: store.currency || 'NGN',
              },
            ],
          });
        }
      },
      updateQuantity: (cartItemId, delta) => {
        const cart = get().cart;
        const updatedCart = cart
          .map((item) => {
            if (item.cartItemId === cartItemId) {
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
          })
          .filter(Boolean);
        set({ cart: updatedCart });
      },
      removeFromCart: (cartItemId) => {
        set({ cart: get().cart.filter((item) => item.cartItemId !== cartItemId) });
      },
      clearCart: () => set({ cart: [] }),
    }),
    { name: 'shopping-cart' }
  )
);
