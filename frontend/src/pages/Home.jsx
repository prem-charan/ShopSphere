import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaShoppingCart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { addToCart } from '../utils/cart';
import { campaignAPI } from '../services/campaignAPI';
import CustomerHeader from '../components/CustomerHeader';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [campaignProducts, setCampaignProducts] = useState([]); // [{ product, discountPercent, campaignPrice }]
  const [productCampaigns, setProductCampaigns] = useState(new Map()); // productId -> campaign info

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCampaigns();
  }, []);

  useEffect(() => {
    // Handle search term from navigation state
    if (location.state?.search) {
      setSearchTerm(location.state.search);
      // Clear the state to prevent re-application on refresh
      window.history.replaceState({}, document.title);
    }
    
    // Handle clear filters from navigation state
    if (location.state?.clearFilters) {
      clearCampaign();
      // Clear the state to prevent re-application on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    // Check for active campaigns for all products
    if (products.length > 0 && campaigns.length > 0) {
      checkProductCampaigns();
    }
  }, [products, campaigns]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAllProducts();
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productAPI.getAllCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await campaignAPI.getActiveCampaigns();
      setCampaigns(res.data || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  const selectCampaign = async (campaignId) => {
    try {
      setSelectedCampaignId(campaignId);
      setLoading(true);
      const res = await campaignAPI.getCampaignProducts(campaignId);
      setCampaignProducts(res.data || []);
      setSearchTerm('');
      setSelectedCategory('');
    } catch (err) {
      console.error('Error fetching campaign products:', err);
      setCampaignProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const checkProductCampaigns = async () => {
    const campaignMap = new Map();
    
    for (const campaign of campaigns) {
      try {
        const campaignProductsRes = await campaignAPI.getCampaignProducts(campaign.campaignId);
        const campaignProducts = campaignProductsRes.data || [];
        
        campaignProducts.forEach(cp => {
          if (!campaignMap.has(cp.product.productId)) {
            campaignMap.set(cp.product.productId, {
              campaignId: campaign.campaignId,
              title: campaign.title,
              discountPercent: cp.discountPercent,
              campaignPrice: cp.campaignPrice
            });
          }
        });
      } catch (err) {
        console.error('Error checking campaign products:', err);
      }
    }
    
    setProductCampaigns(campaignMap);
  };

  const clearCampaign = () => {
    setSelectedCampaignId(null);
    setCampaignProducts([]);
    setSearchTerm('');
    setSelectedCategory('');
  };

  const baseProducts = selectedCampaignId
    ? campaignProducts.map((cp) => ({
        ...cp.product,
        campaignDiscountPercent: cp.discountPercent,
        campaignPrice: cp.campaignPrice,
        campaignId: selectedCampaignId,
      }))
    : products.map(product => {
        const campaign = productCampaigns.get(product.productId);
        return campaign ? {
          ...product,
          campaignDiscountPercent: campaign.discountPercent,
          campaignPrice: campaign.campaignPrice,
          campaignId: campaign.campaignId,
          campaignTitle: campaign.title,
        } : product;
      });

  const filteredProducts = baseProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductClick = (productId) => {
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: `/product/${productId}` } });
    } else {
      navigate(`/product/${productId}`);
    }
  };

  const carouselSettings = {
    dots: true,
    infinite: campaigns.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    nextArrow: <FaChevronRight color="black" />,
    prevArrow: <FaChevronLeft color="black" />,
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: `/product/${product.productId}` } });
      return;
    }
    if (product.stockQuantity === 0) return;
    addToCart(product.productId, 1, {
      unitPrice: product.campaignPrice || null,
      campaignId: product.campaignId || null,
      campaignTitle: product.campaignTitle || null,
    });
    // Cart will update automatically via event listener
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Customer Header */}
      <CustomerHeader />
      
      {/* Admin Quick Access */}
      {isAuthenticated() && user?.role === 'ADMIN' && (
        <div className="bg-indigo-100 border-b border-indigo-200">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-indigo-700 hover:text-indigo-900 font-medium text-sm"
            >
              → Go to Admin Dashboard
            </button>
          </div>
        </div>
      )}


      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => {
              setSelectedCategory('');
              clearCampaign();
            }}
            className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
              !selectedCategory
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Products
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns (top of items section) */}
      {campaigns.length > 0 && (
        <div className="max-w-7xl mx-auto px-12 -mt-2 pb-6">

          <div className="relative">
            <Slider {...carouselSettings}>
              {campaigns.map((c) => (
                <div key={c.campaignId} className="px-3">
                  <div
                    onClick={() => selectCampaign(c.campaignId)}
                    className={`cursor-pointer rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden ${
                      selectedCampaignId === c.campaignId ? 'ring-4 ring-blue-300' : ''
                    }`}
                  >
                    {c.bannerImageUrl ? (
                      <div className="h-48 bg-gray-100">
                        <img
                          src={c.bannerImageUrl}
                          alt={c.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl mb-2">🎁</div>
                          <div className="text-sm text-gray-600 font-medium">{c.title}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            Loading products...
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.productId}
                onClick={() => handleProductClick(product.productId)}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
              >
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FaShoppingCart className="text-6xl" />
                    </div>
                  )}
                  {product.isLowStock && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Low Stock
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-gray-800 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-2">{product.category}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      {product.campaignPrice ? (
                        <>
                          <p className="text-2xl font-bold text-blue-600">
                            ₹{Number(product.campaignPrice).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 line-through">
                            ₹{Number(product.price).toFixed(2)}
                          </p>
                        </>
                      ) : (
                        <p className="text-2xl font-bold text-blue-600">₹{product.price}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      product.isLowStock
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stockQuantity} in stock
                    </span>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stockQuantity === 0}
                      className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <FaShoppingCart />
                        <span>Add to Cart</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
