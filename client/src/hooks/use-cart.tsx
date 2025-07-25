import { createContext, useContext, useState, type ReactNode } from "react";
import { type Product } from "@shared/schema";
import { type CartItem, type CartState } from "@/lib/types";

interface CartContextType {
  cart: CartState;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>({
    items: [],
    isOpen: false,
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existingItem = prev.items.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      
      return {
        ...prev,
        items: [...prev.items, { product, quantity: 1 }],
      };
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.product.id !== productId),
    }));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      ),
    }));
  };

  const clearCart = () => {
    setCart((prev) => ({ ...prev, items: [] }));
  };

  const toggleCart = () => {
    setCart((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  };

  const getTotalItems = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.items.reduce(
      (total, item) => total + parseFloat(item.product.price) * item.quantity,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
