import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  shopId: string | null;
  shopName: string | null;
  addItem: (item: Omit<CartItem, "quantity">, shopId: string, shopName: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      shopId: null,
      shopName: null,
      addItem: (item, shopId, shopName) => {
        const { items, shopId: currentShopId } = get();
        const existingItem = items.find((i) => i.id === item.id);
        
        if (items.length > 0 && currentShopId !== shopId) {
          set({
            items: [{ ...item, quantity: 1 }],
            shopId,
            shopName,
          });
          return;
        }
        
        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
            shopId,
            shopName,
          });
        } else {
          set({
            items: [...items, { ...item, quantity: 1 }],
            shopId,
            shopName,
          });
        }
      },
      removeItem: (itemId) => {
        const { items } = get();
        const newItems = items.filter((i) => i.id !== itemId);
        set({
          items: newItems,
          shopId: newItems.length > 0 ? get().shopId : null,
          shopName: newItems.length > 0 ? get().shopName : null,
        });
      },
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        });
      },
      clearCart: () => set({ items: [], shopId: null, shopName: null }),
      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "kiranaflow-cart",
    }
  )
);
