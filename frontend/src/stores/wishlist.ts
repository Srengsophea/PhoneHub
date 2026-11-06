import { create } from 'zustand';
import api from '@/lib/api';
import type { WishlistItem } from '@/types';

interface WishlistState {
  items: WishlistItem[];
  ids: Set<number>;
  fetch: () => Promise<void>;
  toggle: (productId: number) => Promise<boolean>;
  has: (productId: number) => boolean;
  reset: () => void;
}

export const useWishlist = create<WishlistState>((set, get) => ({
  items: [],
  ids: new Set(),
  fetch: async () => {
    try {
      const { data } = await api.get('/wishlist');
      const items: WishlistItem[] = data.data ?? [];
      set({ items, ids: new Set(items.map((i) => i.product_id)) });
    } catch {
      /* ignore */
    }
  },
  /** Returns the new "is wishlisted" state. */
  toggle: async (productId) => {
    const had = get().has(productId);
    const ids = new Set(get().ids);
    if (had) ids.delete(productId);
    else ids.add(productId);
    set({ ids });
    try {
      if (had) await api.delete(`/wishlist/${productId}`);
      else await api.post('/wishlist', { product_id: productId });
      get().fetch();
      return !had;
    } catch {
      get().fetch();
      return had;
    }
  },
  has: (productId) => get().ids.has(productId),
  reset: () => set({ items: [], ids: new Set() }),
}));

