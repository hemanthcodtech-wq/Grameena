import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { ChevronRight, Leaf, ShieldCheck, CheckCircle2, Star, Minus, Plus, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const scrollRef = useRef(null);
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('Ingredients');
  const [mainImg, setMainImg] = useState('');
  
  // Extra data for related products
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      // Since there's no specific GET /products/:id in the public API, we'll fetch all and filter
      const res = await axios.get('http://localhost:5000/api/products');
      const allProducts = res.data;
      const current = allProducts.find(p => p.id === parseInt(id));
      if (!current) {
        setLoading(false);
        return;
      }
      setProduct(current);
      setMainImg(current.image_url);

      const catRes = await axios.get('http://localhost:5000/api/products/categories/all');
      const cat = catRes.data.find(c => c.id === current.category_id);
      setCategory(cat);

      // Related products (same category)
      const related = allProducts.filter(p => p.category_id === current.category_id && p.id !== current.id && p.is_active).slice(0, 8);
      setRelatedProducts(related);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF9F1] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#113C2B]/20 border-t-[#113C2B] rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDF9F1] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif text-[#113C2B] mb-4">Product not found</h2>
        <Link to="/" className="text-orange-500 hover:underline">Go back home</Link>
      </div>
    );
  }

  const parsedSizes = typeof product.variants === 'string' ? JSON.parse(product.variants) : (product.variants || []);
  const hasSizes = Array.isArray(parsedSizes) && parsedSizes.length > 0;
  const currentSize = hasSizes ? parsedSizes[selectedSizeIdx] : null;
  const displayPrice = product.price || (currentSize?.price) || 0;
  const displayWeight = currentSize?.size || 'Standard';
  
  // Dummy images for gallery
  const galleryImages = [
    product.image_url,
    product.image_url,
    product.image_url,
    product.image_url,
  ];

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: displayPrice,
      image: product.image_url,
      weight: displayWeight
    }, qty, displayWeight);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#FDF9F1] pt-4 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center text-xs font-semibold text-gray-500 mb-8 space-x-2">
          <Link to="/" className="text-[#113C2B] hover:text-[#F8B319] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/category/${category?.name?.toLowerCase() || 'shop'}`} className="text-[#F8B319] transition-colors hover:text-[#113C2B]">
            {category?.name || 'Category'}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-400">{product.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="flex flex-col lg:flex-row gap-12 mb-16 relative">
          
          {/* Decorative Leaf */}
          <div className="absolute right-0 top-0 opacity-80 pointer-events-none hidden lg:block">
            <Leaf className="w-16 h-16 text-[#8cc63f] rotate-45 transform translate-x-4 -translate-y-4" />
          </div>

          {/* Left: Images */}
          <div className="flex flex-col-reverse lg:flex-row gap-4 lg:w-1/2">
            {/* Thumbnails */}
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible">
              {galleryImages.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setMainImg(img)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${mainImg === img ? 'border-[#113C2B]' : 'border-transparent hover:border-[#F8B319]'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
            
            {/* Main Image */}
            <div className="flex-1 bg-[#F5F0E6] rounded-3xl overflow-hidden relative border border-[#e8dfc8]">
              <img src={mainImg} alt={product.name} className="w-full h-full object-cover aspect-square sm:aspect-auto sm:h-[500px]" />
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#113C2B] mb-3 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-[#F8B319]">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="text-sm font-bold text-[#113C2B]">4.8</span>
              <span className="text-sm text-gray-500 font-medium">(124 reviews)</span>
            </div>

            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl sm:text-4xl font-black text-[#113C2B]">₹{displayPrice}</span>
              {hasSizes && (
                <span className="text-sm font-bold text-[#113C2B]/60 mb-1.5">({displayWeight})</span>
              )}
            </div>

            {hasSizes && (
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Weight:</p>
                <div className="flex flex-wrap gap-2">
                  {parsedSizes.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => setSelectedSizeIdx(i)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                        selectedSizeIdx === i 
                          ? 'bg-white border-[#113C2B] text-[#113C2B] shadow-sm' 
                          : 'bg-transparent border-gray-300 text-gray-500 hover:border-[#113C2B]'
                      }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center border border-[#e8dfc8] rounded-xl bg-white overflow-hidden h-12">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-full flex items-center justify-center text-[#113C2B] hover:bg-gray-50 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <div className="w-12 h-full flex items-center justify-center font-bold text-[#113C2B] border-x border-[#e8dfc8]">
                  {qty}
                </div>
                <button onClick={() => setQty(qty + 1)} className="w-12 h-full flex items-center justify-center text-[#113C2B] hover:bg-gray-50 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-[#113C2B] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1A4B3A] transition-colors shadow-lg"
              >
                Add to Cart
              </button>
              <button 
                onClick={handleBuyNow}
                className="flex-1 bg-[#F8B319] text-[#113C2B] py-4 rounded-xl font-bold text-lg hover:bg-[#e09c13] transition-colors shadow-lg"
              >
                Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 border-t border-[#e8dfc8] pt-6">
              <div className="flex flex-col items-center text-center gap-2">
                <Leaf className="w-6 h-6 text-[#113C2B]" />
                <span className="text-[10px] sm:text-xs font-bold text-[#113C2B]">100% Natural</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#113C2B]" />
                <span className="text-[10px] sm:text-xs font-bold text-[#113C2B]">No Preservatives</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-[#113C2B]" />
                <span className="text-[10px] sm:text-xs font-bold text-[#113C2B]">Traditional Recipe</span>
              </div>
            </div>

          </div>
        </div>

        {/* Tabs Section */}
        <div className="mb-16">
          <div className="flex overflow-x-auto border-b border-[#e8dfc8] hide-scrollbar mb-6">
            {['Ingredients', 'Preparation & Story', 'Storage & Delivery', 'Reviews'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-bold text-sm sm:text-base whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab 
                    ? 'border-[#F8B319] text-[#F8B319]' 
                    : 'border-transparent text-gray-400 hover:text-[#113C2B]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e8dfc8]">
            {activeTab === 'Ingredients' && (
              <ul className="list-disc pl-5 space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">
                {product.ingredients ? (
                  product.ingredients.split('\n').map((line, i) => <li key={i}><span className="font-bold text-[#113C2B]">{line.split(':')[0]}</span> {line.split(':').slice(1).join(':')}</li>)
                ) : (
                  <li><span className="font-bold text-[#113C2B]">Main Ingredients:</span> Locally sourced produce, Mustard Seeds, Fenugreek, Red Chilli, Salt, Sesame Oil, Traditional Spices.</li>
                )}
              </ul>
            )}
            
            {activeTab === 'Preparation & Story' && (
              <ul className="list-disc pl-5 space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">
                {product.description ? (
                  <li>{product.description}</li>
                ) : (
                  <li>Made with authentic Andhra spices using traditional methods passed down through generations.</li>
                )}
                {product.precautions && <li><span className="font-bold text-[#113C2B]">Safety:</span> {product.precautions}</li>}
              </ul>
            )}

            {activeTab === 'Storage & Delivery' && (
              <ul className="list-disc pl-5 space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">
                {product.storage ? (
                  product.storage.split('\n').map((line, i) => <li key={i}>{line}</li>)
                ) : (
                  <>
                    <li>Store in a cool, dry place. Keep the lid tightly closed.</li>
                    <li>Delivery in 2-5 business days across Andhra Pradesh.</li>
                  </>
                )}
              </ul>
            )}

            {activeTab === 'Reviews' && (
              <div className="text-gray-500 text-sm italic">
                Reviews will be displayed here.
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Static Section */}
        <div className="mb-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#113C2B] mb-2">Customer Reviews</h2>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-[#113C2B]">4.8</span>
                <div className="flex text-[#F8B319]">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
              </div>
              <p className="text-xs font-bold text-[#113C2B]/60 mt-1">Based on 124 reviews</p>
            </div>
            <button className="px-6 py-2 border-2 border-[#113C2B] text-[#113C2B] font-bold rounded-xl hover:bg-[#113C2B] hover:text-white transition-colors">
              Write a Review
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e8dfc8]">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-[#113C2B] flex items-center justify-center text-white font-serif font-bold text-xl shrink-0">
                  S
                </div>
                <div>
                  <h4 className="font-bold text-[#113C2B] text-sm sm:text-base">Sridevi R. <span className="text-[10px] font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-2">Verified</span></h4>
                  <div className="flex text-[#F8B319] my-1">
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                  <p className="text-gray-600 text-sm mt-2">Amazing taste! Feels like homemade. Will definitely buy again.</p>
                  <div className="flex gap-2 mt-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#e8dfc8]"><img src={product.image_url} alt="Review" className="w-full h-full object-cover" /></div>
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#e8dfc8]"><img src={product.image_url} alt="Review" className="w-full h-full object-cover" /></div>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 font-semibold whitespace-nowrap">12 Aug 2025</span>
            </div>
          </div>
        </div>

        {/* People Also Bought */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            {/* Section Header */}
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-[#F8B319] text-[#113C2B] text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">From This Category</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#113C2B]">People Also Bought</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                  className="w-10 h-10 rounded-full border-2 border-[#113C2B] text-[#113C2B] flex items-center justify-center hover:bg-[#113C2B] hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                  className="w-10 h-10 rounded-full border-2 border-[#113C2B] text-[#113C2B] flex items-center justify-center hover:bg-[#113C2B] hover:text-white transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Scroll Row */}
            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto pb-4 hide-scrollbar scroll-smooth"
            >
              {relatedProducts.map((p, i) => {
                const pVariants = typeof p.variants === 'string' ? JSON.parse(p.variants || '[]') : (p.variants || []);
                const pPrice = p.price || (pVariants[0]?.price) || 0;
                return (
                  <div
                    key={p.id}
                    className="shrink-0 w-48 sm:w-56 bg-white rounded-2xl border border-[#e8dfc8] overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <Link to={`/product/${p.id}`} className="block">
                      <div className="relative h-44 sm:h-52 overflow-hidden bg-[#FDF9F1]">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {p.is_trending && (
                          <span className="absolute top-2 left-2 bg-[#113C2B] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">Trending</span>
                        )}
                        {p.is_festive && (
                          <span className="absolute top-2 left-2 bg-[#F8B319] text-[#113C2B] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">Festive</span>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-[#113C2B] text-sm leading-tight line-clamp-2 mb-1 group-hover:text-[#F8B319] transition-colors">{p.name}</h4>
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, si) => (
                            <Star key={si} className="w-3 h-3 fill-[#F8B319] text-[#F8B319]" />
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-[#113C2B] text-base">₹{pPrice}</span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              addToCart({ id: p.id, name: p.name, price: pPrice, image: p.image_url }, 1);
                            }}
                            className="w-8 h-8 bg-[#113C2B] text-white rounded-full flex items-center justify-center hover:bg-[#F8B319] hover:text-[#113C2B] transition-colors"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetailsPage;
