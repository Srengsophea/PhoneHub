import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';

const MAX = 4;

interface CompareState {
  items: Product[];
  toggle: (p: Product) => { ok: boolean; message?: string };
  has: (id: number) => boolean;
  remove: (id: number) => void;
  clear: () => void;
}

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (p) => {
        if (get().has(p.id)) {
          set({ items: get().items.filter((i) => i.id !== p.id) });
          return { ok: true };
        }
        if (get().items.length >= MAX) return { ok: false, message: `You can compare up to ${MAX} phones.` };
        set({ items: [...get().items, p] });
        return { ok: true };
      },
      has: (id) => get().items.some((i) => i.id === id),
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clear: () => set({ items: [] }),
    }),
    { name: 'phonehub_compare' },
  ),
);

