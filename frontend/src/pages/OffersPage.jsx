import { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Percent, Tag, ShoppingBag, ArrowRight, Clock, ShieldCheck, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { useSEO } from '../hooks/useSEO';

const OffersPage = () => {
  useSEO({
    title: 'Special Offers, Combos & Deals - Save on Authentic Delicacies',
    description: 'Grab the best discounts on Andhra pickles, cold-pressed oils, and festival snack combos at Grameena Bharatham. Limited time festive coupons and bundle savings.',
    canonical: 'https://www.grameenabharatham.com/offers'
  });

  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOfferFilter, setSelectedOfferFilter] = useState('all');

  useEffect(() => {
    const fetchOffersData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await axios.get(`${apiUrl}/api/products/offers/active`);
        setOffers(res.data.offers || []);
        setProducts(res.data.products || []);
      } catch (err) {
        console.error('Failed to load offers and deals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffersData();
  }, []);

  const filteredProducts = products.filter(p => {
    // Strictly ensure only admin-offered items are ever displayed
    if (!p.is_offer && !p.offer) return false;
    if (selectedOfferFilter === 'all') return true;
    
    // Check if the current product matches the selected offer
    const activeOffer = offers.find(o => String(o.id) === String(selectedOfferFilter));
    if (!activeOffer) {
      return p.offer && String(p.offer.id) === String(selectedOfferFilter);
    }

    let cats = [];
    if (activeOffer.applicable_categories) {
      cats = typeof activeOffer.applicable_categories === 'string'
        ? JSON.parse(activeOffer.applicable_categories)
        : activeOffer.applicable_categories;
    }
    let prods = [];
    if (activeOffer.applicable_products) {
      prods = typeof activeOffer.applicable_products === 'string'
        ? JSON.parse(activeOffer.applicable_products)
        : activeOffer.applicable_products;
    }

    const pCat = String(p.category || '').toLowerCase();
    const pIdStr = String(p.id);

    const hasSpecificCats = Array.isArray(cats) && cats.length > 0;
    const hasSpecificProds = Array.isArray(prods) && prods.length > 0;

    if (hasSpecificProds || hasSpecificCats) {
      const prodMatches = hasSpecificProds && prods.some(prodId => String(prodId) === pIdStr);
      const catMatches = hasSpecificCats && cats.some(c => String(c).toLowerCase() === pCat);
      return prodMatches || catMatches;
    }

    // If offer is storewide / universal, it applies to all admin offer-tagged products
    return !!p.is_offer || (p.offer && String(p.offer.id) === String(selectedOfferFilter));
  });

  return (
    <div className="w-full bg-[#FDF9F1] min-h-screen pb-20">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-[#113C2B] via-[#1A4B3A] to-[#113C2B] text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F8B319_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#F8B319]/20 border border-[#F8B319]/40 text-[#F8B319] px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 shadow-sm"
          >
            <Flame className="w-4 h-4 fill-current" /> Exclusive Festive Deals & Seasonal Discounts
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight mb-4"
          >
            Special Offers & Deals
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base md:text-lg"
          >
            Relish authentic Andhra pickles, pure cold-pressed oils, and artisanal handmade snacks with exclusive discounts straight from rural village kitchens.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Promotional Offers Row */}
        {offers.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#113C2B] flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#F8B319]" /> Active Promotions
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Discounts applied automatically on eligible items</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer, idx) => {
                let cats = [];
                if (offer.applicable_categories) {
                  cats = typeof offer.applicable_categories === 'string' ? JSON.parse(offer.applicable_categories) : offer.applicable_categories;
                }
                let prods = [];
                if (offer.applicable_products) {
                  prods = typeof offer.applicable_products === 'string' ? JSON.parse(offer.applicable_products) : offer.applicable_products;
                }

                const isSelected = selectedOfferFilter === String(offer.id);

                return (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedOfferFilter(isSelected ? 'all' : String(offer.id))}
                    className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 relative border flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#113C2B] to-[#1A4B3A] text-white border-[#113C2B] shadow-xl scale-[1.02]'
                        : 'bg-white hover:shadow-lg border-[#e8dfc8] text-[#113C2B]'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                          isSelected ? 'bg-[#F8B319] text-[#113C2B]' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          <Percent className="w-3.5 h-3.5" /> {offer.discount_percentage}% OFF
                        </span>
                        {offer.valid_until && (
                          <span className={`text-[11px] flex items-center gap-1 ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                            <Clock className="w-3 h-3" /> Ends: {new Date(offer.valid_until).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <h3 className={`text-xl font-serif font-bold mb-2 ${isSelected ? 'text-white' : 'text-[#113C2B]'}`}>
                        {offer.title}
                      </h3>
                      <p className={`text-xs sm:text-sm line-clamp-2 ${isSelected ? 'text-gray-200' : 'text-gray-600'}`}>
                        {offer.description || `Special promotional savings on selected traditional items.`}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-black/10 flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-[#F8B319]' : 'text-emerald-700'}`}>
                        {Array.isArray(cats) && cats.length > 0
                          ? `Applies to: ${cats.join(', ')}`
                          : Array.isArray(prods) && prods.length > 0
                          ? `Applies to: ${prods.length} selected items`
                          : 'Applies storewide'}
                      </span>
                      <span className={`text-xs font-bold underline flex items-center gap-1 ${isSelected ? 'text-white' : 'text-[#113C2B]'}`}>
                        {isSelected ? 'Viewing Items' : 'Filter Items →'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pt-4 border-t border-[#e8dfc8]">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#113C2B]">
              Offered Products ({filteredProducts.length})
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {selectedOfferFilter === 'all'
                ? 'All handcrafted items currently featuring discounted offer prices'
                : 'Filtered by chosen promotional campaign'}
            </p>
          </div>

          {selectedOfferFilter !== 'all' && (
            <button
              onClick={() => setSelectedOfferFilter('all')}
              className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
            >
              Clear Filter ×
            </button>
          )}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-[#113C2B]/20 border-t-[#113C2B] rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-[#113C2B]/70">Loading authentic deals & offers...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#e8dfc8] max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#F8B319]">
              <Tag className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#113C2B] mb-2">No active offers found for this selection</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              Check out all other authentic Andhra traditional delicacies available in our store.
            </p>
            <button
              onClick={() => setSelectedOfferFilter('all')}
              className="bg-[#113C2B] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1A4B3A] transition-colors"
            >
              View All Delicacies
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((prod, idx) => (
              <ProductCard
                key={prod.id}
                prod={prod}
                idx={idx}
                badge="OFFER"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersPage;
