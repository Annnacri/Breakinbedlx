import React, { createContext, useContext, useState, useMemo } from 'react';
import { MenuItem } from '../data/menu';

interface CartItem extends MenuItem {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
  hasMainItem: boolean;
  canAddExtra: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const hasMainItem = useMemo(() => items.some(i => i.isMain), [items]);
  const canAddExtra = hasMainItem;

  const addItem = (item: MenuItem) => {
    if (!item.isMain && !canAddExtra) {
      alert('Por favor, adicione um menu principal primeiro.');
      return;
    }
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const clearCart = () => setItems([]);

  const total = useMemo(() => 
    items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  , [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, hasMainItem, canAddExtra }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
