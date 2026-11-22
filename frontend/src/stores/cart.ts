import { create } from 'zustand';
import api, { getErrorMessage } from '@/lib/api';
import type { Cart, CartItem } from '@/types';
import { useAuth } from './auth';

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
  pendingItemIds: number[];
  pendingProductIds: number[];
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

  const runForItem = async (
    itemId: number,
    fn: () => Promise<{ data: { data: Cart } }>
  ): Promise<CartResult> => {
    set((s) => ({
      pendingItemIds: s.pendingItemIds.includes(itemId) ? s.pendingItemIds : [...s.pendingItemIds, itemId],
    }));
    try {
      const res = await fn();
      const updated = { ...emptyCart, ...res.data.data };
      save(updated);
      set((s) => ({
        cart: updated,
        pendingItemIds: s.pendingItemIds.filter((id) => id !== itemId),
      }));
      return { ok: true };
    } catch (err) {
      set((s) => ({
        pendingItemIds: s.pendingItemIds.filter((id) => id !== itemId),
      }));
      return { ok: false, message: getErrorMessage(err) };
    }
  };

  const runForProduct = async (
    productId: number,
    fn: () => Promise<{ data: { data: Cart } }>,
    openAfter = false
  ): Promise<CartResult> => {
    set((s) => ({
      pendingProductIds: s.pendingProductIds.includes(productId)
        ? s.pendingProductIds
        : [...s.pendingProductIds, productId],
    }));
    try {
      const res = await fn();
      const updated = { ...emptyCart, ...res.data.data };
      save(updated);
      set((s) => ({
        cart: updated,
        pendingProductIds: s.pendingProductIds.filter((id) => id !== productId),
        ...(openAfter ? { open: true } : {}),
      }));
      return { ok: true };
    } catch (err) {
      set((s) => ({
        pendingProductIds: s.pendingProductIds.filter((id) => id !== productId),
      }));
      return { ok: false, message: getErrorMessage(err) };
    }
  };

  return {
    cart: getInitialCart(),
    loading: false,
    pendingItemIds: [],
    pendingProductIds: [],
    open: false,
    setOpen: (open) => set({ open }),
    count: () => get().cart.items.reduce((n: number, i: CartItem) => n + i.quantity, 0),
    fetch: async () => {
      try {
        const res = await api.get('/cart');
        const incoming = res.data?.data;
        if (incoming) {
          const updated = { ...emptyCart, ...incoming };
          save(updated);
          set({ cart: updated, loading: false });
        } else {
          set({ cart: emptyCart, loading: false });
        }
      } catch (err) {
        set({ cart: emptyCart, loading: false });
      }
    },
    add: (productId, variantId = null, quantity = 1, openDrawer = false) => {
      return runForProduct(
        productId,
        () => api.post('/cart/items', { product_id: productId, variant_id: variantId, quantity }),
        openDrawer
      );
    },
    update: async (itemId, quantity) => {
      if (quantity < 1) return { ok: true };
      return runForItem(itemId, () => api.put(`/cart/items/${itemId}`, { quantity }));
    },
    remove: (itemId) => runForItem(itemId, () => api.delete(`/cart/items/${itemId}`)),
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
