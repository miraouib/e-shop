import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  title: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  quantityThreshold?: number;
  image?: string;
  promotions?: any[];
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },
      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const items = get().items;
        return items.reduce((total, item) => {
          let priceToUse = item.price;
          
          if (item.promotions && item.promotions.length > 0) {
            const applicablePromotions = item.promotions
              .filter((p: any) => item.quantity >= p.quantityThreshold)
              .sort((a: any, b: any) => b.quantityThreshold - a.quantityThreshold);
            
            if (applicablePromotions.length > 0) {
              priceToUse = applicablePromotions[0].discountPrice;
            }
          } else if (item.quantityThreshold && item.quantity >= item.quantityThreshold && item.discountPrice) {
            // Fallback for old items in cart
            priceToUse = item.discountPrice;
          }

          return total + (priceToUse * item.quantity);
        }, 0);
      },
    }),
    {
      name: 'ecommerce-cart', // stocké dans localStorage
    }
  )
);
