import { create } from 'zustand';
import api, { getErrorMessage } from '@/lib/api';
import type { Cart, CartItem } from '@/types';

const CART_STORAGE_KEY = 'phonehub_cart_persisted';

const emptyCart: Cart = {
  items: [],
  subtotal: 0,
  discount_amount: 0,
  shipping_fee: 0,
  tax_amount: 0,
  total_amount: 0,
  coupon: null,
};

function getInitialCart(): Cart {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
        return { ...emptyCart, ...parsed };
      }
    }
  } catch {}
  return emptyCart;
}

export interface CartResult {
  ok: boolean;
  message?: string;
}

interface CartState {
  cart: Cart;
  loading: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  count: () => number;
  fetch: () => Promise<void>;
  add: (productId: number, variantId?: number | null | undefined, quantity?: number, openDrawer?: boolean) => Promise<CartResult>;
  update: (itemId: number, quantity: number) => Promise<CartResult>;
  remove: (itemId: number) => Promise<CartResult>;
  clear: () => Promise<void>;
  applyCoupon: (code: string) => Promise<CartResult>;
  removeCoupon: () => Promise<CartResult>;
  reset: () => void;
}

export const useCart = create<CartState>((set, get) => {
  const save = (cartData: Cart) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    } catch {}
  };

  const run = async (fn: () => Promise<{ data: { data: Cart } }>, openAfter = false): Promise<CartResult> => {
    set({ loading: true });
    try {
      const res = await fn();
      const updated = { ...emptyCart, ...res.data.data };
      save(updated);
      set({ cart: updated, loading: false, ...(openAfter ? { open: true } : {}) });
      return { ok: true };
    } catch (err) {
      set({ loading: false });
      return { ok: false, message: getErrorMessage(err) };
    }
  };

  return {
    cart: getInitialCart(),
    loading: false,
    open: false,
    setOpen: (open) => set({ open }),
    count: () => get().cart.items.reduce((n: number, i: CartItem) => n + i.quantity, 0),
    fetch: async () => {
      try {
        const res = await api.get('/cart');
        const incoming = res.data?.data;
        if (incoming && Array.isArray(incoming.items) && incoming.items.length > 0) {
          const updated = { ...emptyCart, ...incoming };
          save(updated);
          set({ cart: updated, loading: false });
        } else {
          // If server cart is empty but we have local items, keep local and sync to backend
          const local = getInitialCart();
          if (local.items.length > 0) {
            set({ cart: local, loading: false });
            for (const item of local.items) {
              try {
                await api.post('/cart/items', {
                  product_id: item.product_id,
                  variant_id: item.variant_id || null,
                  quantity: item.quantity,
                });
              } catch {}
            }
          } else {
            set({ cart: emptyCart, loading: false });
          }
        }
      } catch (err) {
        set({ cart: getInitialCart(), loading: false });
      }
    },
    add: (productId, variantId = null, quantity = 1, openDrawer = true) =>
      run(() => api.post('/cart/items', { product_id: productId, variant_id: variantId, quantity }), openDrawer),
    update: (itemId, quantity) =>
      quantity <= 0 ? get().remove(itemId) : run(() => api.put(`/cart/items/${itemId}`, { quantity })),
    remove: (itemId) => run(() => api.delete(`/cart/items/${itemId}`)),
    clear: async () => {
      try {
        await api.delete('/cart');
      } finally {
        try {
          localStorage.removeItem(CART_STORAGE_KEY);
        } catch {}
        set({ cart: emptyCart });
      }
    },
    applyCoupon: async (code) => {
      set({ loading: true });
      try {
        const res = await api.post('/cart/coupon', { code });
        const payload = res.data.data?.cart ?? res.data.data;
        const updated = { ...emptyCart, ...payload };
        save(updated);
        set({ cart: updated, loading: false });
        return { ok: true };
      } catch (err) {
        set({ loading: false });
        return { ok: false, message: getErrorMessage(err, 'Invalid or expired coupon.') };
      }
    },
    removeCoupon: () => run(() => api.delete('/cart/coupon')),
    reset: () => {
      try {
        localStorage.removeItem(CART_STORAGE_KEY);
      } catch {}
      set({ cart: emptyCart });
    },
  };
});
