import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Fruit } from '../types/index.ts';

interface CartContextType {
  items: CartItem[];
  addToCart: (fruit: Fruit, quantity?: number) => void;
  removeFromCart: (fruitId: string) => void;
  updateQuantity: (fruitId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (fruit: Fruit) => {
    setItems(prevItems => {
      const exists = prevItems.some(item => item.fruit.id === fruit.id);

      // If the fruit already exists, return the list unchanged
      if (exists) return prevItems;

      // Otherwise, add it as a new item with default weight 0
      return [...prevItems, { fruit, quantity: 0 }];
    });
  };


  const removeFromCart = (fruitId: string) => {
    setItems(prevItems => prevItems.filter(item => item.fruit.id !== fruitId));
  };

  const updateQuantity = (fruitId: string, quantity: number) => {
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.fruit.id === fruitId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.length;   
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.fruit.price * item.quantity), 0);
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};