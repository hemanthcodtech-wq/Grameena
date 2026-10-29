import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ChevronRight, Leaf, ShieldCheck, CheckCircle2, Star, Minus, Plus, ShoppingCart, ArrowLeft, ArrowRight, Heart, MessageSquare, AlertCircle, Loader2, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCachedApi } from '../hooks/useCachedApi';
import { useSEO } from '../hooks/useSEO';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const scrollRef = useRef(null);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('Ingredients');
  const [mainImg, setMainImg] = useState('');

  // Review states
  const [reviewsList, setReviewsList] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  const { data: allProducts, loading: prodLoading } = useCachedApi('gram_prod', `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/products`, []);
  const { data: catData, loading: catLoading } = useCachedApi('gram_cat', `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/products/categories/all`, []);

  const product = (allProducts || []).find(p => p.id === parseInt(id));
  const isWishlisted = isInWishlist(product?.id);
  const category = product ? (catData || []).find(c => c.id === product.category_id) : null;
  const relatedProducts = product ? (allProducts || []).filter(p => p.category_id === product.category_id && p.id !== product.id && p.is_active).slice(0, 8) : [];
  
  const loading = prodLoading || catLoading;

  // SEO & Schema for product
  const productPrice = product?.sizes && product.sizes.length > 0
    ? (typeof product.sizes === 'string' ? JSON.parse(product.sizes)[selectedSizeIdx]?.price : product.sizes[selectedSizeIdx]?.price) || product.price
    : product?.price || 0;

  const productSchema = product ? {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    'name': product.name,
    'image': product.image_url ? [product.image_url] : [],
    'description': product.description || `Buy fresh authentic ${product.name} online from Grameena Bharatham.`,
    'brand': {
      '@type': 'Brand',
      'name': 'Grameena Bharatham'
    },
    'offers': {
      '@type': 'Offer',
      'url': `https://www.grameenabharatham.com/product/${product.id}`,
      'priceCurrency': 'INR',
      'price': productPrice,
      'itemCondition': 'https://schema.org/NewCondition',
      'availability': product.is_active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  } : null;

  useSEO({
    title: product ? `${product.name} - Buy Authentic Homemade Online` : 'Authentic Delicacy',
    description: product ? `${product.description ? product.description.slice(0, 150) : `Buy authentic homemade ${product.name} online.`} 100% natural Andhra style delicacies.` : undefined,
    canonical: product ? `https://www.grameenabharatham.com/product/${product.id}` : undefined,
    ogImage: product?.image_url,
    schema: productSchema
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    setQty(1);
    setSelectedSizeIdx(0);
  }, [id]);

  useEffect(() => {
    if (product) {
      setMainImg(product.image_url);
      let revs = [];
      try {
        revs = typeof product.reviews === 'string' ? JSON.parse(product.reviews) : (product.reviews || []);
      } catch {}
      setReviewsList(Array.isArray(revs) ? revs : []);
    }
  }, [product, id]);

  const handleOpenReviewModal = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Login is compulsory: redirect to login with return path
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setReviewError('');
    setReviewSuccess('');
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError('Please share your review experience.');
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await axios.post(
        `${apiUrl}/api/products/${product.id}/reviews`,
        {
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data?.review) {
        setReviewsList(prev => [res.data.review, ...prev]);
        setReviewSuccess('Thank you! Your review has been submitted successfully.');
        setReviewComment('');
        setReviewTitle('');
        setReviewRating(5);
        setTimeout(() => {
          setIsReviewModalOpen(false);
          setReviewSuccess('');
        }, 1500);
      }
    } catch (err) {
      console.error('Submit review error:', err);
      setReviewError(err.response?.data?.error || 'Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-[#FDF9F1] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#113C2B]/20 border-t-[#113C2B] rounded-full animate-spin" />
      </div>
    );
  }

  if (!product && !loading) {
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
  
  // Parse images gallery from product.images or fallback to product.image_url
  let galleryImages = [];
  try {
    const rawImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
    if (Array.isArray(rawImages) && rawImages.length > 0) {
      galleryImages = rawImages.filter(Boolean);
    }
  } catch {}
  if (galleryImages.length === 0 && product.image_url) {
    galleryImages = [product.image_url];
  }

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

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl sm:text-4xl font-black text-[#113C2B]">₹{displayPrice}</span>
              {((currentSize?.mrp) || product.mrp) && parseFloat((currentSize?.mrp) || product.mrp) > parseFloat(displayPrice) && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ₹{parseFloat((currentSize?.mrp) || product.mrp)}
                  </span>
                  <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {Math.round(((parseFloat((currentSize?.mrp) || product.mrp) - parseFloat(displayPrice)) / parseFloat((currentSize?.mrp) || product.mrp)) * 100)}% OFF
                  </span>
                </>
              )}
              {hasSizes && (
                <span className="text-sm font-bold text-[#113C2B]/60">({displayWeight})</span>
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
            <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-10">
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-[#113C2B] text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-[#1A4B3A] transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                Add to Cart
              </button>
              <button 
                onClick={handleBuyNow}
                className="flex-1 bg-[#F8B319] text-[#113C2B] py-4 px-6 rounded-xl font-bold text-lg hover:bg-[#e09c13] transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                Buy Now
              </button>
              <button
                onClick={() => toggleWishlist({
                  ...product,
                  price: displayPrice,
                  weight: displayWeight
                })}
                title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                className={`py-4 px-5 rounded-xl font-bold text-base flex items-center justify-center gap-2 border-2 transition-all shadow-sm ${
                  isWishlisted
                    ? 'bg-rose-50 border-red-500 text-red-500'
                    : 'bg-white border-[#e8dfc8] text-[#113C2B] hover:border-red-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="hidden xl:inline">{isWishlisted ? 'Saved' : 'Wishlist'}</span>
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
              <ul className="list-disc pl-5 space-y-3 text-gray-600 text-sm sm:text-base leading-relaxed">
                {product.ingredients && product.ingredients.trim() ? (
                  product.ingredients.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i}>
                      {line.includes(':') ? (
                        <>
                          <span className="font-bold text-[#113C2B]">{line.split(':')[0]}:</span> {line.split(':').slice(1).join(':')}
                        </>
                      ) : (
                        <span>{line}</span>
                      )}
                    </li>
                  ))
                ) : (
                  <li><span className="font-bold text-[#113C2B]">Main Ingredients:</span> Locally sourced produce, Mustard Seeds, Fenugreek, Red Chilli, Salt, Sesame Oil, Traditional Spices.</li>
                )}
              </ul>
            )}
            
            {activeTab === 'Preparation & Story' && (
              <ul className="list-disc pl-5 space-y-3 text-gray-600 text-sm sm:text-base leading-relaxed">
                {product.description ? (
                  <li>{product.description}</li>
                ) : (
                  <li>Made with authentic Andhra spices using traditional methods passed down through generations.</li>
                )}
                {product.precautions && product.precautions.trim() && (
                  product.precautions.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i}><span className="font-bold text-[#113C2B]">Safety / Precaution:</span> {line}</li>
                  ))
                )}
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

        {/* Customer Reviews Section */}
        <div className="mb-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#113C2B] mb-2">Customer Reviews</h2>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-[#113C2B]">
                  {(() => {
                    if (reviewsList.length === 0) return '5.0';
                    const avg = reviewsList.reduce((sum, r) => sum + (parseFloat(r.rating) || 5), 0) / reviewsList.length;
                    return avg.toFixed(1);
                  })()}
                </span>
                <div className="flex text-[#F8B319]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-xs font-bold text-[#113C2B]/60 mt-1">
                Based on {reviewsList.length} verified {reviewsList.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            
            {product.allow_reviews !== false ? (
              <button 
                onClick={handleOpenReviewModal}
                className="px-6 py-2.5 bg-[#113C2B] text-white hover:bg-[#F8B319] hover:text-[#113C2B] font-bold rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2 self-start sm:self-auto"
              >
                <MessageSquare className="w-4 h-4" />
                Write a Review
              </button>
            ) : (
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3.5 py-2 rounded-xl">
                Reviews currently closed
              </span>
            )}
          </div>

          {/* Reviews List */}
          {reviewsList.length > 0 ? (
            <div className="space-y-4">
              {reviewsList.map((rev, idx) => {
                const userInitial = (rev.user_name || 'C').charAt(0).toUpperCase();
                const reviewDate = rev.created_at ? new Date(rev.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Verified Customer';

                return (
                  <div key={rev.id || idx} className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e8dfc8] shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-[#113C2B] flex items-center justify-center text-white font-serif font-bold text-base shrink-0">
                          {userInitial}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-[#113C2B] text-sm sm:text-base">
                              {rev.user_name || 'Customer'}
                            </h4>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              Verified Buyer
                            </span>
                          </div>
                          
                          <div className="flex text-[#F8B319] my-1">
                            {[...Array(5)].map((_, s) => (
                              <Star 
                                key={s} 
                                className={`w-3.5 h-3.5 ${s < (parseInt(rev.rating) || 5) ? 'fill-current' : 'text-gray-200'}`} 
                              />
                            ))}
                          </div>

                          {rev.title && (
                            <h5 className="font-bold text-xs sm:text-sm text-gray-900 mt-1.5">
                              {rev.title}
                            </h5>
                          )}
                          <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                            {rev.comment}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                        {reviewDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-[#e8dfc8] text-center">
              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h4 className="font-serif font-bold text-[#113C2B] text-lg mb-1">Be the first to review this product!</h4>
              <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto mb-4">
                Have you enjoyed this traditional recipe? Share your thoughts and culinary experience with other food lovers.
              </p>
              {product.allow_reviews !== false && (
                <button 
                  onClick={handleOpenReviewModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#113C2B] text-white hover:bg-[#F8B319] hover:text-[#113C2B] font-bold rounded-xl text-xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Leave a Review
                </button>
              )}
            </div>
          )}
        </div>

        {/* Write Review Modal */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#e8dfc8] animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="bg-[#FDF9F1] px-6 py-4 border-b border-[#e8dfc8] flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#113C2B]">Write a Review</h3>
                  <p className="text-[11px] text-[#113C2B]/60 truncate max-w-xs">{product.name}</p>
                </div>
                <button 
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
                {reviewError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                {reviewSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{reviewSuccess}</span>
                  </div>
                )}

                {/* Rating Stars Selection */}
                <div>
                  <label className="text-xs font-bold text-[#113C2B] block mb-1.5">Overall Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star 
                          className={`w-7 h-7 ${star <= reviewRating ? 'fill-[#F8B319] text-[#F8B319]' : 'text-gray-300'}`} 
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-[#113C2B] ml-2">
                      {reviewRating === 5 ? '5 - Excellent!' :
                       reviewRating === 4 ? '4 - Very Good' :
                       reviewRating === 3 ? '3 - Average' :
                       reviewRating === 2 ? '2 - Poor' : '1 - Terrible'}
                    </span>
                  </div>
                </div>

                {/* Review Headline / Title */}
                <div>
                  <label className="text-xs font-bold text-[#113C2B] block mb-1">Headline (Optional)</label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Delicious authentic flavor, true homemade taste!"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfc8] text-xs focus:outline-none focus:ring-1 focus:ring-[#113C2B] bg-[#FDF9F1]/50"
                  />
                </div>

                {/* Review Comment */}
                <div>
                  <label className="text-xs font-bold text-[#113C2B] block mb-1">Your Review *</label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="What did you like or dislike? How was the aroma, spice level, or quality?"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8dfc8] text-xs focus:outline-none focus:ring-1 focus:ring-[#113C2B] bg-[#FDF9F1]/50 resize-none"
                  />
                </div>

                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>You are signed in. Your verified name will appear beside this review.</span>
                </div>

                {/* Modal Actions */}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="flex-1 py-2.5 border border-[#e8dfc8] text-[#113C2B] font-semibold rounded-xl text-xs hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting || !reviewComment.trim()}
                    className="flex-1 py-2.5 bg-[#113C2B] text-white hover:bg-[#F8B319] hover:text-[#113C2B] font-bold rounded-xl text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {reviewSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Review</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
