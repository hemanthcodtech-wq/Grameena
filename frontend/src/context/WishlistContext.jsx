import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('grameena_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse wishlist from localStorage', e);
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('grameena_wishlist', JSON.stringify(wishlistItems));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlistItems]);

  const showToast = (message, item, action = 'added') => {
    setToastMessage({ message, item, action, id: Date.now() });
    setTimeout(() => {
      setToastMessage((current) => (current?.id === current?.id ? null : current));
    }, 2800);
  };

  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlistItems.some((item) => String(item.id) === String(productId));
  };

  const addToWishlist = (product) => {
    if (!product || !product.id) return;
    if (isInWishlist(product.id)) return;

    const parsedSizes = typeof product.sizes === 'string' 
      ? JSON.parse(product.sizes || '[]') 
      : (product.sizes || []);
    const parsedVariants = typeof product.variants === 'string'
      ? JSON.parse(product.variants || '[]')
      : (product.variants || []);
    
    const displayPrice = product.price || parsedSizes[0]?.price || parsedVariants[0]?.price || 0;
    const displayWeight = parsedSizes[0]?.size || parsedVariants[0]?.size || 'Standard';

    const normalizedItem = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: displayPrice,
      image_url: product.image_url || (Array.isArray(product.images) ? product.images[0] : null) || '',
      category: product.category || '',
      category_id: product.category_id || null,
      sizes: product.sizes || [],
      variants: product.variants || [],
      weight: displayWeight,
      is_bestseller: !!product.is_bestseller,
      is_offer: !!product.is_offer,
      is_festive: !!product.is_festive,
      is_trending: !!product.is_trending,
      addedAt: new Date().toISOString()
    };

    setWishlistItems((prev) => [normalizedItem, ...prev]);
    showToast(`Added to your wishlist`, normalizedItem, 'added');
  };

  const removeFromWishlist = (productId) => {
    const itemToRemove = wishlistItems.find((item) => String(item.id) === String(productId));
    setWishlistItems((prev) => prev.filter((item) => String(item.id) !== String(productId)));
    if (itemToRemove) {
      showToast(`Removed from wishlist`, itemToRemove, 'removed');
    }
  };

  const toggleWishlist = (product) => {
    if (!product || !product.id) return;
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    showToast('Wishlist cleared', null, 'cleared');
  };

  const totalWishlistItems = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        totalWishlistItems,
        toastMessage,
        setToastMessage
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
