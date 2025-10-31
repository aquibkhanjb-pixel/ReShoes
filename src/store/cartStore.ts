import { create } from "zustand";

export interface CartItem {
  _id: string;
  shoe: {
    _id: string;
    title: string;
    brand: string;
    price: number;
    images: string[];
    condition: string;
    size: number;
    status: string;
    seller: {
      _id: string;
      name: string;
      email: string;
    };
  };
  addedAt: string;
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  loading: boolean;
  setItems: (items: CartItem[]) => void;
  setItemCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  isInCart: (shoeId: string) => boolean;
  addItemToStore: (item: CartItem) => void;
  removeItemFromStore: (shoeId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  itemCount: 0,
  loading: false,
  setItems: (items) =>
    set({
      items,
      itemCount: items.length,
    }),
  setItemCount: (count) => set({ itemCount: count }),
  setLoading: (loading) => set({ loading }),
  isInCart: (shoeId) => {
    return get().items.some((item) => item.shoe._id === shoeId);
  },
  addItemToStore: (item) => {
    const { items } = get();
    if (!items.some((i) => i.shoe._id === item.shoe._id)) {
      set({ items: [...items, item], itemCount: items.length + 1 });
    }
  },
  removeItemFromStore: (shoeId) => {
    const { items } = get();
    const newItems = items.filter((item) => item.shoe._id !== shoeId);
    set({ items: newItems, itemCount: newItems.length });
  },
  clearCart: () => set({ items: [], itemCount: 0 }),
}));
