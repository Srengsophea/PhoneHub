import { create } from 'zustand';
import api from '@/lib/api';
import type { WishlistItem } from '@/types';
import { useAuth } from './auth';

const GUEST_WISHLIST_KEY = 'phonehub_guest_wishlist';

function getGuestWishlist(): number[] {
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGuestWishlist(ids: number[]) {
  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(ids));
  } catch {}
}

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
  ids: new Set(getGuestWishlist()),
  fetch: async () => {
    const authUser = useAuth.getState().user;
    if (!authUser) {
      const guestIds = getGuestWishlist();
      set({ ids: new Set(guestIds) });
      return;
    }
    try {
      const { data } = await api.get('/wishlist');
      const items: WishlistItem[] = data.data ?? [];
      const userIds = new Set(items.map((i) => i.product_id));

      // Also merge any guest wishlist items into user account
      const guestIds = getGuestWishlist();
      if (guestIds.length > 0) {
        for (const gid of guestIds) {
          if (!userIds.has(gid)) {
            api.post('/wishlist', { product_id: gid }).catch(() => {});
            userIds.add(gid);
          }
        }
        localStorage.removeItem(GUEST_WISHLIST_KEY);
      }
      set({ items, ids: userIds });
    } catch {
      /* ignore */
    }
  },
  /** Returns the new "is wishlisted" state without forcing guest login. */
  toggle: async (productId) => {
    const authUser = useAuth.getState().user;
    const had = get().has(productId);
    const ids = new Set(get().ids);

    if (had) {
      ids.delete(productId);
    } else {
      ids.add(productId);
    }
    set({ ids });

    if (!authUser) {
      saveGuestWishlist(Array.from(ids));
      return !had;
    }

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
