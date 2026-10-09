import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Filter, X, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoryObj, setCategoryObj] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const priceRanges = [
    { id: 'all', label: 'All Prices' },
    { id: 'under-200', label: 'Under ₹200', min: 0, max: 200 },
    { id: '200-500', label: '₹200 - ₹500', min: 200, max: 500 },
    { id: 'above-500', label: 'Above ₹500', min: 500, max: 99999 }
  ];

  // Format category name for display
  const displayCategoryName = categoryName
    ? categoryName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Category';

  useEffect(() => {
    fetchData();
  }, [categoryName]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/products`),
        axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/categories`)
      ]);

      const searchParam = categoryName.toLowerCase().replace(/-/g, ' ');

      // Find Category object
      const cat = catRes.data.find(c => c.name.toLowerCase() === searchParam || c.name.toLowerCase().includes(searchParam));
      setCategoryObj(cat || null);

      // Filter products
      const filtered = prodRes.data.filter(p => {
        if (!p.is_active) return false;
        // Either match by category_id if we found the cat, or by string parsing
        if (cat) return p.category_id === cat.id;
        const dbCategory = (p.category || '').toLowerCase();
        return dbCategory.includes(searchParam) || searchParam.includes(dbCategory);
      });

      setAllProducts(filtered);
      applyFilters(filtered, [], 'all', 'featured');
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (baseProducts, subcats, priceId, sort) => {
    let result = [...baseProducts];

    // Subcategory Filter
    if (subcats.length > 0) {
      result = result.filter(p => p.subcategory && subcats.includes(p.subcategory));
    }

    // Price Filter
    if (priceId !== 'all') {
      const range = priceRanges.find(r => r.id === priceId);
      if (range) {
        result = result.filter(p => {
          const parsedSizes = typeof p.variants === 'string' ? JSON.parse(p.variants) : (p.variants || []);
          const price = parseFloat(parsedSizes[0]?.price || p.price || 0);
          return price >= range.min && price <= range.max;
        });
      }
    }

    // Sort
    result.sort((a, b) => {
      const priceA = parseFloat((typeof a.variants === 'string' ? JSON.parse(a.variants) : (a.variants || []))[0]?.price || a.price || 0);
      const priceB = parseFloat((typeof b.variants === 'string' ? JSON.parse(b.variants) : (b.variants || []))[0]?.price || b.price || 0);
      
      if (sort === 'price-asc') return priceA - priceB;
      if (sort === 'price-desc') return priceB - priceA;
      if (sort === 'name-asc') return a.name.localeCompare(b.name);
      return 0; // featured (no sort)
    });

    setProducts(result);
  };

  // Whenever a filter changes, re-apply
  useEffect(() => {
    applyFilters(allProducts, selectedSubcategories, selectedPriceRange, sortBy);
  }, [selectedSubcategories, selectedPriceRange, sortBy, allProducts]);

  const handleSubcategoryChange = (sub) => {
    if (selectedSubcategories.includes(sub)) {
      setSelectedSubcategories(selectedSubcategories.filter(s => s !== sub));
    } else {
      setSelectedSubcategories([...selectedSubcategories, sub]);
    }
  };

  const clearFilters = () => {
    setSelectedSubcategories([]);
    setSelectedPriceRange('all');
    setSortBy('featured');
  };

  let subcategoriesList = [];
  if (categoryObj && categoryObj.subcategories) {
    subcategoriesList = Array.isArray(categoryObj.subcategories) 
      ? categoryObj.subcategories 
      : (typeof categoryObj.subcategories === 'string' ? JSON.parse(categoryObj.subcategories || '[]') : []);
  }

  // If no subcategories in DB for this category, extract unique ones from products just in case
  if (subcategoriesList.length === 0) {
    const uniqueSubs = new Set();
    allProducts.forEach(p => p.subcategory && uniqueSubs.add(p.subcategory));
    subcategoriesList = Array.from(uniqueSubs);
  }

  return (
    <div className="w-full bg-[#FDF9F1] min-h-screen pb-16">
      {/* Category Banner */}
      <div className="bg-[#113C2B] pt-12 pb-20 px-4 relative overflow-hidden">
        {categoryObj?.image_url && (
          <img src={categoryObj.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#113C2B] to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="flex items-center justify-center text-xs font-bold text-[#F8B319] mb-4 space-x-2 tracking-widest uppercase">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>•</span>
            <span className="text-white">{displayCategoryName}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6">
            {displayCategoryName}
          </h1>
          {categoryObj?.description ? (
            <p className="text-white/80 max-w-2xl mx-auto text-lg leading-relaxed">{categoryObj.description}</p>
          ) : (
            <p className="text-white/80 max-w-xl mx-auto text-lg">Browse our exclusive collection of authentic, homemade {displayCategoryName.toLowerCase()}.</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-[#e8dfc8]">
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="flex items-center gap-2 font-bold text-[#113C2B]"
            >
              <Filter className="w-5 h-5" /> Filters
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-500">Sort:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border-none rounded-lg text-sm font-bold text-[#113C2B] py-1 pl-2 pr-6 focus:ring-0"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">A to Z</option>
              </select>
            </div>
          </div>

          {/* Sidebar (Desktop & Mobile Overlay) */}
          <div className={`
            fixed inset-0 z-50 lg:static lg:z-auto lg:block lg:w-1/4
            ${isMobileFiltersOpen ? 'block' : 'hidden'}
          `}>
            {/* Mobile Backdrop */}
            <div className="fixed inset-0 bg-black/50 lg:hidden" onClick={() => setIsMobileFiltersOpen(false)}></div>
            
            {/* Sidebar Content */}
            <div className="fixed inset-y-0 right-0 w-[80%] max-w-sm bg-white lg:bg-transparent lg:static lg:w-full h-full lg:h-auto overflow-y-auto lg:overflow-visible p-6 lg:p-0 shadow-2xl lg:shadow-none transition-transform duration-300">
              
              <div className="flex justify-between items-center lg:hidden mb-6">
                <h2 className="text-xl font-bold font-serif text-[#113C2B]">Filters</h2>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e8dfc8] sticky top-28">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-[#113C2B] font-serif flex items-center gap-2">
                    <Filter className="w-5 h-5 text-[#F8B319]" /> Filters
                  </h3>
                  {(selectedSubcategories.length > 0 || selectedPriceRange !== 'all') && (
                    <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:underline">Clear All</button>
                  )}
                </div>

                {/* Subcategories Filter */}
                {subcategoriesList.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-bold text-gray-900 mb-4 tracking-wide text-sm">Subcategories</h4>
                    <div className="space-y-3">
                      {subcategoriesList.map(sub => (
                        <label key={sub} className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${selectedSubcategories.includes(sub) ? 'bg-[#113C2B] border-[#113C2B]' : 'border-gray-300 group-hover:border-[#113C2B]'}`}>
                            {selectedSubcategories.includes(sub) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className={`text-sm font-medium transition-colors ${selectedSubcategories.includes(sub) ? 'text-[#113C2B] font-bold' : 'text-gray-600 group-hover:text-[#113C2B]'}`}>{sub}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range Filter */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-4 tracking-wide text-sm">Price</h4>
                  <div className="space-y-3">
                    {priceRanges.map(range => (
                      <label key={range.id} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${selectedPriceRange === range.id ? 'border-[#113C2B]' : 'border-gray-300 group-hover:border-[#113C2B]'}`}>
                          {selectedPriceRange === range.id && <div className="w-2.5 h-2.5 rounded-full bg-[#113C2B]"></div>}
                        </div>
                        <span className={`text-sm font-medium transition-colors ${selectedPriceRange === range.id ? 'text-[#113C2B] font-bold' : 'text-gray-600 group-hover:text-[#113C2B]'}`}>{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4 flex flex-col pt-6 lg:pt-0">
            
            {/* Desktop Sort Bar */}
            <div className="hidden lg:flex justify-between items-end mb-6">
              <div>
                <p className="text-sm font-bold text-gray-500">
                  Showing <span className="text-[#113C2B]">{products.length}</span> {products.length === 1 ? 'product' : 'products'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Sort By</span>
                <div className="relative">
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-[#e8dfc8] rounded-xl text-sm font-bold text-[#113C2B] py-2.5 pl-4 pr-10 focus:outline-none focus:border-[#113C2B] shadow-sm cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Alphabetically: A-Z</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#113C2B]/20 border-t-[#113C2B]"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#e8dfc8] shadow-sm flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Filter className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#113C2B] mb-2">No products found</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">We couldn't find any products matching your current filters in this category.</p>
                <button onClick={clearFilters} className="bg-[#113C2B] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#F8B319] hover:text-[#113C2B] transition-colors">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                {products.map((prod, idx) => (
                  <ProductCard key={prod.id} prod={prod} idx={idx} />
                ))}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
