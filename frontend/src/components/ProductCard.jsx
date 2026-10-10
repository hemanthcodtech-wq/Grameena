import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ prod, idx, badge }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const parsedSizes = typeof prod.sizes === 'string' ? JSON.parse(prod.sizes) : prod.sizes;
  const hasSizes = Array.isArray(parsedSizes) && parsedSizes.length > 0;
  
  // Default to first size if available
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  
  const currentSize = hasSizes ? parsedSizes[selectedSizeIdx] : null;
  const displayPrice = prod.price || (currentSize?.price) || 'TBA';
  const displaySize = currentSize?.size || 'Standard';

  // Carousel State
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const parsedImages = typeof prod.images === 'string' ? JSON.parse(prod.images) : (prod.images || []);
  // Use DB images if available, else fallback to a mix of images so the user can test the carousel!
  const allImages = parsedImages.length > 0 ? parsedImages : [prod.image_url, '/images/pickles.jpg', '/images/snacks.jpg'];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
      onClick={() => navigate(`/product/${prod.id}`)}
      className="bg-white rounded-xl sm:rounded-3xl p-3 sm:p-5 shadow-sm border border-[#e8dfc8] hover:shadow-xl hover:border-transparent transition-all duration-300 relative group flex flex-col cursor-pointer"
    >
      <div className="absolute top-2 left-2 sm:top-5 sm:left-5 z-10 flex flex-col gap-1 sm:gap-2">
        {badge === 'FESTIVE' ? (
          <span className="bg-[#F8B319] text-[#113C2B] text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">FESTIVE</span>
        ) : (
          <>
            {prod.is_bestseller && <span className="bg-[#113C2B] text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">BESTSELLER</span>}
            {prod.is_offer && <span className="bg-red-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">OFFER</span>}
          </>
        )}
      </div>
      
      <button 
        onClick={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 sm:top-5 sm:right-5 w-7 h-7 sm:w-10 sm:h-10 bg-white rounded-full shadow-md text-gray-300 hover:text-red-500 flex items-center justify-center z-10 transition-colors"
      >
        <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      
      <div className={`w-full aspect-[4/3] sm:aspect-square ${badge === 'FESTIVE' ? 'bg-orange-50' : 'bg-[#Fdf9f1]'} rounded-lg sm:rounded-2xl mb-3 sm:mb-6 overflow-hidden relative group/carousel`}>
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentImgIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            src={allImages[currentImgIdx]} 
            alt={prod.name} 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          />
        </AnimatePresence>

        {allImages.length > 1 && (
          <>
            {/* Left/Right Controls (visible on hover) */}
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImgIdx(p => p === 0 ? allImages.length - 1 : p - 1); }}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImgIdx(p => (p + 1) % allImages.length); }}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20"
            >
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            
            {/* Dots */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 sm:gap-1.5 z-20">
              {allImages.map((_, i) => (
                <div key={i} className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-colors ${i === currentImgIdx ? 'bg-[#113C2B] scale-125' : 'bg-gray-300'}`}></div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className="flex-1 flex flex-col px-1 sm:px-2">
        {prod.category && <p className="text-[9px] sm:text-[10px] text-[#F8B319] font-bold uppercase tracking-wider mb-0.5">{prod.category}</p>}
        <h3 className="font-bold text-[#113C2B] text-sm sm:text-xl mb-0.5 sm:mb-1 font-serif line-clamp-1">{prod.name}</h3>
        <p className="text-[10px] sm:text-xs text-gray-500 mb-2 sm:mb-3 line-clamp-1">{prod.description}</p>
        
        {/* Size Selection Pills */}
        {hasSizes && parsedSizes.length > 1 && (
          <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
            {parsedSizes.map((s, i) => (
              <button 
                key={i}
                onClick={(e) => { e.stopPropagation(); setSelectedSizeIdx(i); }}
                className={`text-[9px] sm:text-[11px] px-1.5 py-0.5 sm:px-2 sm:py-1 rounded font-bold border transition-colors ${
                  selectedSizeIdx === i 
                    ? (badge === 'FESTIVE' ? 'bg-[#F8B319] border-[#F8B319] text-[#113C2B]' : 'bg-[#113C2B] border-[#113C2B] text-white')
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {s.size}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-auto">
          <div className="text-sm sm:text-2xl font-black text-[#113C2B]">₹{displayPrice}</div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              addToCart({
                id: prod.id,
                name: prod.name,
                price: displayPrice,
                image: prod.image_url,
                weight: displaySize
              }, 1, displaySize);
            }}
            className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors shadow-md ${
              badge === 'FESTIVE' 
                ? 'bg-[#F8B319] hover:bg-[#e09c13] text-[#113C2B]' 
                : 'bg-[#113C2B] hover:bg-[#F8B319] text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
