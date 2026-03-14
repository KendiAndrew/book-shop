import { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  bookid: number;
  title: string;
  author: string;
  price: number;
  quantity: number;
  format: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (bookid: number) => void;
  updateQuantity: (bookid: number, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType>(null!);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  const save = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem("cart", JSON.stringify(next));
  };

  const addItem = (item: Omit<CartItem, "quantity">) => {
    const existing = items.find((i) => i.bookid === item.bookid);
    if (existing) {
      save(
        items.map((i) =>
          i.bookid === item.bookid ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      save([...items, { ...item, quantity: 1 }]);
    }
  };

  const removeItem = (bookid: number) => {
    save(items.filter((i) => i.bookid !== bookid));
  };

  const updateQuantity = (bookid: number, qty: number) => {
    if (qty <= 0) {
      removeItem(bookid);
    } else {
      save(items.map((i) => (i.bookid === bookid ? { ...i, quantity: qty } : i)));
    }
  };

  const clearCart = () => save([]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
