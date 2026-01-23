import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompareState {
  items: string[];
  maxItems: number;
  addItem: (id: string) => boolean;
  removeItem: (id: string) => void;
  toggleItem: (id: string) => boolean;
  clearItems: () => void;
  isInCompare: (id: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      maxItems: 5,

      addItem: (id: string) => {
        const { items, maxItems } = get();
        if (items.length >= maxItems) {
          return false;
        }
        if (!items.includes(id)) {
          set({ items: [...items, id] });
        }
        return true;
      },

      removeItem: (id: string) => {
        const { items } = get();
        set({ items: items.filter((item) => item !== id) });
      },

      toggleItem: (id: string) => {
        const { items, addItem, removeItem } = get();
        if (items.includes(id)) {
          removeItem(id);
          return false;
        }
        return addItem(id);
      },

      clearItems: () => {
        set({ items: [] });
      },

      isInCompare: (id: string) => {
        return get().items.includes(id);
      },
    }),
    {
      name: 'cmm24-compare',
    }
  )
);
