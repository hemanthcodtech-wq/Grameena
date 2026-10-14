import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  Package, 
  Check, 
  Share2, 
  ChevronRight,
  ShieldCheck,
  Truck,
  Leaf
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, addMultipleToCart } = useCart();
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedItemsMap, setAddedItemsMap] = useState({});
  const [allMovedToast, setAllMovedToast] = useState(false);

  const handleAddToCart = (item) => {
    const itemWeight = item.weight || item.size || 'Standard';
    addToCart({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price) || 0,
      image: item.image_url || '/images/pickles.jpg',
      weight: itemWeight,
      size: itemWeight
    }, 1, itemWeight);

    setAddedItemsMap((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      // Remove item from wishlist once moved to cart
      removeFromWishlist(item.id);
    }, 800);
  };

  const handleAddAllToCart = () => {
    if (wishlistItems.length === 0) return;

    const itemsToTransfer = wishlistItems.map((item) => {
      const itemWeight = item.weight || item.size || 'Standard';
      return {
        product: {
          id: item.id,
          name: item.name,
          price: parseFloat(item.price) || 0,
          image: item.image_url || '/images/pickles.jpg',
          weight: itemWeight,
          size: itemWeight
        },
        quantity: 1,
        size: itemWeight
      };
    });

    addMultipleToCart(itemsToTransfer);

    // Visual feedback on all cards
    const newMap = {};
    wishlistItems.forEach((item) => {
      newMap[item.id] = true;
    });
    setAddedItemsMap(newMap);
    setAllMovedToast(true);

    // After animation, clear wishlist so items are officially moved to cart
    setTimeout(() => {
      clearWishlist();
      setAllMovedToast(false);
      navigate('/cart');
    }, 1200);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Grameena Bharatham Wishlist',
          text: 'Check out the authentic Andhra delicacies I picked on Grameena Bharatham!',
          url: window.location.href,
        });
      } catch (e) {
        // user cancelled share
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const totalValue = wishlistItems.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);

  return (
    <div className="w-full min-h-screen bg-[#FDF9F1] pb-24 font-sans">
      {/* Hero Header */}
      <section className="relative bg-[#113C2B] text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle decorative background patterns */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-300 via-transparent to-transparent"></div>
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-[#F8B319]/10 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center text-xs font-semibold text-amber-200/70 mb-6 space-x-2">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/products" className="hover:text-white transition-colors">Shop</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-bold">My Wishlist</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#F8B319]/20 text-[#F8B319] border border-[#F8B319]/30 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-4">
                <Heart className="w-3.5 h-3.5 fill-[#F8B319]" />
                Saved Favorites
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-3">
                My Delicacies Wishlist
              </h1>
              <p className="text-white/80 max-w-xl text-sm sm:text-base leading-relaxed">
                Keep track of authentic homemade Andhra pickles, pure wood-pressed oils, and crispy traditional snacks saved for your next order.
              </p>
            </div>

            {wishlistItems.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/15 transition-all shadow-sm"
                >
                  <Share2 className="w-4 h-4 text-[#F8B319]" />
                  {copiedLink ? 'Link Copied!' : 'Share Wishlist'}
                </button>
                <button
                  onClick={clearWishlist}
                  className="inline-flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border border-red-500/30 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {wishlistItems.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl p-8 sm:p-16 border border-[#e8dfc8] shadow-sm text-center flex flex-col items-center max-w-2xl mx-auto"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-rose-50 text-red-500 flex items-center justify-center mb-6 shadow-inner relative">
              <Heart className="w-12 h-12 stroke-[1.5]" />
              <motion.div 
                animate={{ scale: [1, 1.25, 1], rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="absolute -top-1 -right-1 bg-[#F8B319] text-[#113C2B] p-2 rounded-full shadow-md"
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#113C2B] mb-3">
              Your Wishlist is Empty
            </h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
              Explore our range of traditional Andhra delicacies. Tap the heart icon on any product to save it right here for later!
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto justify-center">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#113C2B] hover:bg-[#1A4B3A] text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 text-sm sm:text-base"
              >
                Explore All Products <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/category/pickles"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-50 hover:bg-amber-100 text-[#113C2B] font-bold rounded-xl border border-amber-200/80 transition-colors text-sm sm:text-base"
              >
                Authentic Pickles
              </Link>
            </div>

            {/* Quick Benefits Banner inside empty state */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-12 pt-8 border-t border-[#f0e6d2]">
              <div className="flex items-center justify-center gap-3 text-left">
                <Leaf className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold text-gray-700">100% Homemade & Pure</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-left">
                <Truck className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-xs font-semibold text-gray-700">Free Delivery &gt; ₹999</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-left">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-xs font-semibold text-gray-700">Zero Chemical Preservatives</span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Wishlist Grid & Stats */
          <div className="space-y-8">
            {/* Action Bar / Stats Summary */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#e8dfc8] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F8B319] flex items-center justify-center font-bold text-xl font-serif">
                  {wishlistItems.length}
                </div>
                <div>
                  <h3 className="font-bold text-[#113C2B] text-base sm:text-lg">
                    {wishlistItems.length} {wishlistItems.length === 1 ? 'Delicacy' : 'Delicacies'} Saved
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Total Estimated Value: <span className="font-extrabold text-[#113C2B]">₹{totalValue}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleAddAllToCart}
                  disabled={allMovedToast}
                  className={`flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5 ${
                    allMovedToast 
                      ? 'bg-emerald-600 text-white cursor-wait' 
                      : 'bg-[#113C2B] hover:bg-[#1A4B3A] text-white active:scale-95'
                  }`}
                >
                  {allMovedToast ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3] animate-bounce" />
                      Moving Items to Cart...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Move All to Cart
                    </>
                  )}
                </button>
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-[#113C2B] text-[#113C2B] hover:bg-[#113C2B] hover:text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </motion.div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              <AnimatePresence>
                {wishlistItems.map((item, idx) => {
                  const isAdded = !!addedItemsMap[item.id];

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#e8dfc8] shadow-sm hover:shadow-xl hover:border-amber-300/80 transition-all duration-300 flex flex-col relative group"
                    >
                      {/* Top Action Tags */}
                      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                        {item.is_festive && (
                          <span className="bg-[#F8B319] text-[#113C2B] text-[9px] font-black px-2 py-0.5 rounded uppercase">
                            Festive
                          </span>
                        )}
                        {item.is_bestseller && (
                          <span className="bg-[#113C2B] text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                            Bestseller
                          </span>
                        )}
                        {item.is_offer && (
                          <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                            Offer
                          </span>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWishlist(item.id);
                        }}
                        aria-label="Remove from wishlist"
                        title="Remove from wishlist"
                        className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-rose-50 shadow-md flex items-center justify-center transition-colors group-hover:scale-105"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Product Image */}
                      <Link
                        to={`/product/${item.id}`}
                        className="w-full aspect-square bg-[#FDF9F1] rounded-xl sm:rounded-2xl mb-4 overflow-hidden relative block"
                      >
                        <img
                          src={item.image_url || '/images/pickles.jpg'}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/pickles.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col">
                        {item.category && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#F8B319] mb-1">
                            {item.category}
                          </span>
                        )}

                        <Link to={`/product/${item.id}`} className="group-hover:text-[#113C2B]">
                          <h4 className="font-serif font-bold text-[#113C2B] text-base sm:text-lg mb-1 line-clamp-1 hover:text-[#F8B319] transition-colors">
                            {item.name}
                          </h4>
                        </Link>

                        {item.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-auto pt-3 border-t border-[#f3ede1] flex items-center justify-between gap-2">
                          <div>
                            <div className="text-lg sm:text-xl font-black text-[#113C2B]">
                              ₹{item.price}
                            </div>
                            <span className="text-[11px] text-gray-400 font-medium">
                              {item.weight || 'Standard Pack'}
                            </span>
                          </div>

                          <button
                            onClick={() => handleAddToCart(item)}
                            className={`px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm ${
                              isAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#113C2B] hover:bg-[#F8B319] hover:text-[#113C2B] text-white'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-4 h-4 stroke-[3]" /> Added
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
