import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/products`);
        // Filter out inactive products
        setProducts(res.data.filter(p => p.is_active));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="w-full bg-[#FDF9F1] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#113C2B] mb-4">Shop All Delicacies</h1>
          <div className="w-24 h-1 bg-[#F8B319] mx-auto rounded-full mb-4"></div>
          <p className="text-gray-500 text-lg">Authentic homemade recipes delivered to your door</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#113C2B]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((prod, idx) => (
              <ProductCard key={prod.id} prod={prod} idx={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
