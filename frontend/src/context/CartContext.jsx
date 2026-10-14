import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('grameena_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('grameena_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, size = null) => {
    setCartItems(prev => {
      const selectedSize = size || product.size || product.weight || 'Standard';
      const existing = prev.find(item => item.id === product.id && (item.size === selectedSize || item.weight === selectedSize));
      if (existing) {
        return prev.map(item => 
          item.id === product.id && (item.size === selectedSize || item.weight === selectedSize)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, size: selectedSize, weight: selectedSize, price: parseFloat(product.price) || 0 }];
    });
  };

  const addMultipleToCart = (productsList) => {
    if (!Array.isArray(productsList) || productsList.length === 0) return;
    setCartItems(prev => {
      let updated = [...prev];
      productsList.forEach(({ product, quantity = 1, size = null }) => {
        const selectedSize = size || product.size || product.weight || 'Standard';
        const existingIdx = updated.findIndex(item => item.id === product.id && (item.size === selectedSize || item.weight === selectedSize));
        if (existingIdx > -1) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + quantity
          };
        } else {
          updated.push({
            ...product,
            quantity,
            size: selectedSize,
            weight: selectedSize,
            price: parseFloat(product.price) || 0
          });
        }
      });
      return updated;
    });
  };

  const removeFromCart = (id, size) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.size === size)));
  };

  const updateQuantity = (id, size, change) => {
    setCartItems(prev => 
      prev.map(item => {
        if (item.id === id && item.size === size) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCartItems([]);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      addMultipleToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      subtotal,
      totalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};
