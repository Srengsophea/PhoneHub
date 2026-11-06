import { create } from 'zustand';
import api, { getErrorMessage } from '@/lib/api';
import type { Cart, CartItem } from '@/types';

const emptyCart: Cart = {
  items: [],
  subtotal: 0,
  discount_amount: 0,
  shipping_fee: 0,
  tax_amount: 0,
  total_amount: 0,
  coupon: null,
};

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
  add: (productId: number, variantId?: number | null | undefined, quantity?: number) => Promise<CartResult>;
  update: (itemId: number, quantity: number) => Promise<CartResult>;
  remove: (itemId: number) => Promise<CartResult>;
  clear: () => Promise<void>;
  applyCoupon: (code: string) => Promise<CartResult>;
  removeCoupon: () => Promise<CartResult>;
  reset: () => void;
}

export const useCart = create<CartState>((set, get) => {
  const run = async (fn: () => Promise<{ data: { data: Cart } }>, openAfter = false): Promise<CartResult> => {
    set({ loading: true });
    try {
      const res = await fn();
      set({ cart: { ...emptyCart, ...res.data.data }, loading: false, ...(openAfter ? { open: true } : {}) });
      return { ok: true };
    } catch (err) {
      set({ loading: false });
      return { ok: false, message: getErrorMessage(err) };
    }
  };

  return {
    cart: emptyCart,
    loading: false,
    open: false,
    setOpen: (open) => set({ open }),
    count: () => get().cart.items.reduce((n: number, i: CartItem) => n + i.quantity, 0),
    fetch: async () => {
      await run(() => api.get('/cart'));
    },
    add: (productId, variantId = null, quantity = 1) =>
      run(() => api.post('/cart/items', { product_id: productId, variant_id: variantId, quantity }), true),
    update: (itemId, quantity) =>
      quantity <= 0 ? get().remove(itemId) : run(() => api.put(`/cart/items/${itemId}`, { quantity })),
    remove: (itemId) => run(() => api.delete(`/cart/items/${itemId}`)),
    clear: async () => {
      try {
        await api.delete('/cart');
      } finally {
        set({ cart: emptyCart });
      }
    },
    applyCoupon: async (code) => {
      set({ loading: true });
      try {
        const res = await api.post('/cart/coupon', { code });
        const payload = res.data.data?.cart ?? res.data.data;
        set({ cart: { ...emptyCart, ...payload }, loading: false });
        return { ok: true };
      } catch (err) {
        set({ loading: false });
        return { ok: false, message: getErrorMessage(err, 'Invalid or expired coupon.') };
      }
    },
    removeCoupon: () => run(() => api.delete('/cart/coupon')),
    reset: () => set({ cart: emptyCart }),
  };
});
