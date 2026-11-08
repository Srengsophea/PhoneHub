import { create } from 'zustand';
import api from '@/lib/api';
import type { WishlistItem, Product } from '@/types';
import { useAuth } from './auth';

const GUEST_WISHLIST_KEY = 'phonehub_guest_wishlist';
const GUEST_WISHLIST_ITEMS_KEY = 'phonehub_guest_wishlist_items';

function getStoredGuestIds(): number[] {
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getStoredGuestItems(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredGuestWishlist(items: WishlistItem[], ids: number[]) {
  try {
    localStorage.setItem(GUEST_WISHLIST_ITEMS_KEY, JSON.stringify(items));
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(ids));
  } catch {}
}

interface WishlistState {
  items: WishlistItem[];
  ids: Set<number>;
  loading: boolean;
  fetch: () => Promise<void>;
  toggle: (productId: number, product?: Product) => Promise<boolean>;
  has: (productId: number) => boolean;
  reset: () => void;
}

const initialGuestItems = getStoredGuestItems();
const initialGuestIds = Array.from(new Set([...getStoredGuestIds(), ...initialGuestItems.map((i) => i.product_id)]));

export const useWishlist = create<WishlistState>((set, get) => ({
  items: initialGuestItems,
  ids: new Set(initialGuestIds),
  loading: false,

  fetch: async () => {
    const authUser = useAuth.getState().user;

    if (!authUser) {
      set({ loading: true });
      const storedItems = getStoredGuestItems();
      const storedIds = Array.from(new Set([...getStoredGuestIds(), ...storedItems.map((i) => i.product_id)]));

      set({ items: storedItems, ids: new Set(storedIds) });

      // If we have favorited IDs without cached product items, retrieve them from catalog
      const hasMissingDetails = storedIds.some((id) => !storedItems.some((it) => it.product_id === id && it.product));

      if (storedIds.length > 0 && (storedItems.length === 0 || hasMissingDetails)) {
        try {
          const { data } = await api.get('/products?per_page=50');
          const allProducts: Product[] = data?.data || [];
          const matched = allProducts.filter((p) => storedIds.includes(p.id));

          if (matched.length > 0) {
            const freshItems: WishlistItem[] = matched.map((p) => ({
              id: p.id,
              product_id: p.id,
              product: p,
              created_at: new Date().toISOString(),
            }));
            saveStoredGuestWishlist(freshItems, storedIds);
            set({ items: freshItems, ids: new Set(storedIds), loading: false });
            return;
          }
        } catch {}
      }

      set({ loading: false });
      return;
    }

    // Authenticated user
    set({ loading: true });
    try {
      const { data } = await api.get('/wishlist');
      const items: WishlistItem[] = data.data ?? [];
      const userIds = new Set(items.map((i) => i.product_id));

      // Also merge any guest wishlist items into user account
      const guestIds = getStoredGuestIds();
      if (guestIds.length > 0) {
        for (const gid of guestIds) {
          if (!userIds.has(gid)) {
            api.post('/wishlist', { product_id: gid }).catch(() => {});
            userIds.add(gid);
          }
        }
        localStorage.removeItem(GUEST_WISHLIST_KEY);
        localStorage.removeItem(GUEST_WISHLIST_ITEMS_KEY);
      }

      set({ items, ids: userIds, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  /** Toggles wishlist item state and preserves product details in guest storage. */
  toggle: async (productId: number, product?: Product) => {
    const authUser = useAuth.getState().user;
    const had = get().has(productId);
    const ids = new Set(get().ids);
    let items = [...get().items];

    if (had) {
      ids.delete(productId);
      items = items.filter((it) => it.product_id !== productId);
    } else {
      ids.add(productId);
      if (product) {
        items = [
          {
            id: productId,
            product_id: productId,
            product,
            created_at: new Date().toISOString(),
          },
          ...items.filter((it) => it.product_id !== productId),
        ];
      }
    }

    set({ ids, items });

    if (!authUser) {
      saveStoredGuestWishlist(items, Array.from(ids));
      return !had;
    }

    try {
      if (had) {
        await api.delete(`/wishlist/${productId}`);
      } else {
        await api.post('/wishlist', { product_id: productId });
      }
      get().fetch();
      return !had;
    } catch {
      get().fetch();
      return had;
    }
  },

  has: (productId) => get().ids.has(productId),
  reset: () => set({ items: [], ids: new Set(), loading: false }),
}));
