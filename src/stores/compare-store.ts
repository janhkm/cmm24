import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompareState {
  items: string[];
  titles: Record<string, string>;
  maxItems: number;
  addItem: (id: string, title?: string) => boolean;
  removeItem: (id: string) => void;
  toggleItem: (id: string, title?: string) => boolean;
  clearItems: () => void;
  isInCompare: (id: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      titles: {},
      maxItems: 5,

      addItem: (id: string, title?: string) => {
        const { items, maxItems, titles } = get();
        if (items.length >= maxItems) {
          return false;
        }
        if (!items.includes(id)) {
          set({
            items: [...items, id],
            titles: title ? { ...titles, [id]: title } : titles,
          });
        }
        return true;
      },

      removeItem: (id: string) => {
        const { items, titles } = get();
        const newTitles = { ...titles };
        delete newTitles[id];
        set({ items: items.filter((item) => item !== id), titles: newTitles });
      },

      toggleItem: (id: string, title?: string) => {
        const { items, addItem, removeItem } = get();
        if (items.includes(id)) {
          removeItem(id);
          return false;
        }
        return addItem(id, title);
      },

      clearItems: () => {
        set({ items: [], titles: {} });
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
