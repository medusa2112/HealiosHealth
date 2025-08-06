import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type Product } from "@shared/schema";
import { type CartItem, type CartState } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

// Extend Window interface for Google Analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

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

  // Generate or retrieve session token for cart tracking
  const [sessionToken] = useState(() => {
    if (typeof window !== 'undefined') {
      let token = localStorage.getItem('cart_session_token');
      if (!token) {
        token = crypto.randomUUID();
        localStorage.setItem('cart_session_token', token);
      }
      return token;
    }
    return crypto.randomUUID();
  });

  // Sync cart to server whenever it changes
  const syncCartToServer = async (cartItems: CartItem[]) => {
    try {
      const totalAmount = cartItems.reduce((sum, item) => {
        return sum + (parseFloat(item.product.price) * item.quantity);
      }, 0);

      await apiRequest('/api/cart/sync', 'POST', {
        session_token: sessionToken,
        items: cartItems,
        totalAmount,
        currency: 'ZAR'
      });
    } catch (error) {
      console.error('Failed to sync cart to server:', error);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existingItem = prev.items.find((item) => item.product.id === product.id);
      
      // Google Analytics - Add to Cart Event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'add_to_cart', {
          currency: 'ZAR',
          value: parseFloat(product.price),
          send_to: 'AW-CONVERSION_ID/ADD_TO_CART_LABEL', // Replace with your actual conversion ID
          items: [{
            item_id: product.id,
            item_name: product.name,
            category: product.categories?.[0] || 'Supplements',
            quantity: 1,
            price: parseFloat(product.price)
          }]
        });
      }
      
      let newItems: CartItem[];
      if (existingItem) {
        newItems = prev.items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...prev.items, { product, quantity: 1 }];
      }
      
      // Sync to server in background
      syncCartToServer(newItems);
      
      return {
        ...prev,
        items: newItems,
      };
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const newItems = prev.items.filter((item) => item.product.id !== productId);
      
      // Sync to server in background
      syncCartToServer(newItems);
      
      return {
        ...prev,
        items: newItems,
      };
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) => {
      const newItems = prev.items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
      
      // Sync to server in background
      syncCartToServer(newItems);
      
      return {
        ...prev,
        items: newItems,
      };
    });
  };

  const clearCart = () => {
    setCart((prev) => {
      // Sync empty cart to server in background
      syncCartToServer([]);
      
      return { ...prev, items: [] };
    });
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
