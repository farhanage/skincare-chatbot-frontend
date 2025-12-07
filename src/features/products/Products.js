// src/components/Products.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, ChevronLeft, ChevronRight, X, Search, ShoppingCart, History, Sparkles, ShoppingBag } from 'lucide-react';
import Cart from '../cart/Cart';
import Checkout from '../orders/Checkout';
import OrderHistory from '../orders/OrderHistory';
import './Products.css';
import { getProducts, getBanditRecommendations } from '../../services/productService';
import { trackInteraction } from '../../services/interactionService';
import { formatCurrency } from '../../utils/formatters';

const Products = ({ user }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [message, setMessage] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedSort, setSelectedSort] = useState('default');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedCondition, setSelectedCondition] = useState('Semua');
  const [priceRange, setPriceRange] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dropdown states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchCart();
      fetchRecommendations();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [products, selectedCategory, selectedCondition, priceRange, searchQuery, selectedSort]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!user) return;
    
    setLoadingRecommendations(true);
    try {
      const data = await getBanditRecommendations({ n_recommendations: 6 });
      if (data.success) {
        const recommendations = data.recommendations || data.products || [];
        setRecommendedProducts(recommendations);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const fetchCart = () => {
    if (!user) return;
    
    const cartKey = `cart_${user.id}`;
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart:', e);
        setCart([]);
      }
    } else {
      // If no cart in localStorage, set to empty array
      setCart([]);
    }
  };

  

  const applyFilters = () => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== 'Semua') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Condition filter
    if (selectedCondition !== 'Semua') {
      filtered = filtered.filter(p => 
        p.for_conditions.some(c => c.toLowerCase().includes(selectedCondition.toLowerCase()))
      );
    }

    // Price range filter
    if (priceRange !== 'Semua') {
      const [min, max] = priceRange.split('-').map(Number);
      if (max) {
        filtered = filtered.filter(p => p.price >= min && p.price <= max);
      } else {
        filtered = filtered.filter(p => p.price >= min);
      }
    }

    // Search query
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting after filters
    const sorted = applySort(filtered, selectedSort);
    setFilteredProducts(sorted);
    setCurrentPage(1);
  };

  const applySort = (items = [], sortKey = 'default') => {
    // Create a copy to avoid mutating state directly
    const arr = [...items];
    switch (sortKey) {
      case 'newest':
        // newest - assume created_at field or fallback to id
        return arr.sort((a, b) => {
          const ta = a.created_at ? new Date(a.created_at).getTime() : (a.id || 0);
          const tb = b.created_at ? new Date(b.created_at).getTime() : (b.id || 0);
          return tb - ta;
        });
      case 'price-asc':
        return arr.sort((a, b) => (parseFloat(a.price || 0) - parseFloat(b.price || 0)));
      case 'price-desc':
        return arr.sort((a, b) => (parseFloat(b.price || 0) - parseFloat(a.price || 0)));
      case 'name-asc':
        return arr.sort((a, b) => (String(a.name || '').localeCompare(String(b.name || ''))));
      case 'popularity':
        return arr.sort((a, b) => {
          const sa = a.sold_count || a.sold || a.sales || 0;
          const sb = b.sold_count || b.sold || b.sales || 0;
          return sb - sa;
        });
      default:
        return arr; // default order from API
    }
  };

  const resetFilters = () => {
    setSelectedCategory('Semua');
    setSelectedCondition('Semua');
    setPriceRange('Semua');
    setSearchQuery('');
    setSelectedSort('default');
  };

  // Get unique categories and conditions
  const categories = ['Semua', ...new Set(products.map(p => p.category))];
  const conditions = ['Semua', 'Jerawat', 'Kulit Kering', 'Kulit Sensitif', 'Kulit Berminyak', 'Kulit Kusam', 'Anti Aging', 'Komedo', 'Bekas Jerawat'];
  const priceRanges = [
    'Semua',
    '0-50000',
    '50000-100000',
    '100000-200000',
    '200000-300000',
    '300000-500000'
  ];

  const sortOptions = [
    { id: 'default', label: 'Default' },
    { id: 'newest', label: 'Terbaru' },
    { id: 'price-asc', label: 'Harga: Rendah → Tinggi' },
    { id: 'price-desc', label: 'Harga: Tinggi → Rendah' },
    { id: 'name-asc', label: 'Nama: A → Z' },
    { id: 'popularity', label: 'Terlaris' }
  ];

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleProductClick = (productId) => {
    // Track click for logged-in users
    if (user) {
      trackInteraction(productId, 'click', 1.0);
    }
    navigate(`/products/${productId}`);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = async (productId) => {
    if (!user) {
      showMessage('Silakan login terlebih dahulu!');
      return;
    }

    try {
      // Find product
      const product = products.find(p => p.id === productId);
      if (!product) return;

      // Get current cart from localStorage
      const cartKey = `cart_${user.id}`;
      const savedCart = localStorage.getItem(cartKey);
      let currentCart = savedCart ? JSON.parse(savedCart) : [];

      // Check if product already in cart
      const existingIndex = currentCart.findIndex(item => item.id === productId);
      
      if (existingIndex >= 0) {
        // Increase quantity
        currentCart[existingIndex].quantity += 1;
        showMessage('✓ Produk ditambahkan ke keranjang!');
      } else {
        // Add new item
        currentCart.push({
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          quantity: 1
        });
        showMessage('✓ Produk ditambahkan ke keranjang!');
      }

      // Save to localStorage
      localStorage.setItem(cartKey, JSON.stringify(currentCart));
      setCart(currentCart);
      
      // Track add to cart interaction
      if (user) {
        trackInteraction(productId, 'add_to_cart', 2.0);
      }
    } catch (err) {
      showMessage('✗ Gagal menambahkan ke keranjang');
    }
  };

  const buyNow = async (productId) => {
    if (!user) {
      showMessage('Silakan login terlebih dahulu!');
      return;
    }

    try {
      // Find product
      const product = products.find(p => p.id === productId);
      if (!product) return;

      // Create checkout data with single item
      const items = [{
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        quantity: 1
      }];

      const total = product.price;

      setCheckoutData({ items, total, fromCart: false }); // Mark as direct buy
      setShowCheckout(true);
    } catch (err) {
      showMessage('✗ Gagal memproses pembelian');
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const formatPriceRange = (range) => {
    if (range === 'Semua') return 'Semua Harga';
    const [min, max] = range.split('-').map(Number);
    if (max) {
      return `${formatCurrency(min)} - ${formatCurrency(max)}`;
    }
    return `> ${formatCurrency(min)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-900 text-xl font-bold">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Message Toast */}
      {message && (
        <div className="fixed top-20 right-4 z-50 bg-white text-slate-900 rounded-xl p-4 shadow-2xl animate-slide-in border-l-4 border-emerald-500">
          <p className="font-medium">{message}</p>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-2">
              Skincare Shop
            </h1>
            <p className="text-slate-600 text-lg font-semibold">
              {filteredProducts.length} produk tersedia
            </p>
          </div>
          
          {user && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowOrderHistory(true)}
                className="bg-white border-2 border-emerald-500 text-emerald-600 px-6 py-3 rounded-xl transition-all duration-200 font-bold hover:bg-emerald-50 flex items-center gap-2"
              >
                <History size={20} />
                <span>Riwayat</span>
              </button>
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-bold shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <ShoppingCart size={20} />
                <span>Keranjang</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Recommended Products Section - Only for logged-in users */}
        {user && recommendedProducts.length > 0 && (
          <div className="mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-emerald-600" size={28} />
              <div>
                <h2 className="text-2xl font-black text-slate-900">Rekomendasi Untuk Anda</h2>
                <p className="text-slate-600 font-medium">Produk pilihan berdasarkan preferensi Anda</p>
              </div>
            </div>
            
            {loadingRecommendations ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <p className="ml-3 text-slate-600 font-medium">Memuat rekomendasi...</p>
              </div>
            ) : (
              <div className="overflow-x-auto pb-2 -mx-2 px-2">
                <div className="flex gap-4 min-w-max">
                  {recommendedProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="w-64 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-emerald-200 hover:border-emerald-400"
                    >
                      <div className="p-4">
                        {/* Category Badge */}
                        <div className="mb-2">
                          <span className="inline-block text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wide">
                            {product.category}
                          </span>
                        </div>
                        
                        {/* Product Name */}
                        <h3 className="font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors min-h-[3rem]">
                          {product.name}
                        </h3>

                        {/* Product Image */}
                        <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg mb-3 flex items-center justify-center h-40 overflow-hidden">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-contain p-3"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`${product.image_url ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                            <span className="text-3xl font-bold text-emerald-400">{product.brand?.charAt(0) || '?'}</span>
                          </div>
                        </div>
                        
                        {/* Brand */}
                        <p className="text-sm text-slate-600 mb-2 font-medium">{product.brand}</p>
                        
                        {/* Price */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-emerald-100">
                          <p className="text-lg font-black text-emerald-600">
                            {formatCurrency(product.price)}
                          </p>
                          <ChevronRight className="text-emerald-600 group-hover:translate-x-1 transition-transform" size={20} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 font-medium"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all shadow-lg"
          >
            <Filter size={20} />
            Filter
            {(selectedCategory !== 'Semua' || selectedCondition !== 'Semua' || priceRange !== 'Semua') && (
              <span className="bg-emerald-500 rounded-full w-2 h-2"></span>
            )}
          </button>
          {/* Sort Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
              }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${selectedSort !== 'default' ? 'bg-emerald-50 border-2 border-emerald-200 text-emerald-700' : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600'}`}
            >
              Sort by: {sortOptions.find(s => s.id === selectedSort)?.label || 'Default'}
              <ChevronRight size={18} className={`transition-transform ${showSortDropdown ? 'rotate-90' : ''}`} />
            </button>
            {showSortDropdown && (
              <div className="absolute z-50 w-56 mt-2 bg-white rounded-xl shadow-2xl border-2 border-emerald-200 overflow-hidden">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSelectedSort(opt.id);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 font-medium text-sm transition-all ${selectedSort === opt.id ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'hover:bg-emerald-50 text-slate-700'}`}
                  >
                    {selectedSort === opt.id ? '✓ ' : ''}{opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 bg-white rounded-xl p-6 border-2 border-slate-200 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-slate-900">Filter Produk</h3>
              <button
                onClick={resetFilters}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
              >
                <X size={16} />
                Reset
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category */}
              <div className="relative">
                <label className="block text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Kategori
                </label>
                <button
                  onClick={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowConditionDropdown(false);
                    setShowPriceDropdown(false);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl hover:border-emerald-400 font-bold text-slate-700 transition-all shadow-md hover:shadow-lg flex items-center justify-between group"
                >
                  <span className="group-hover:text-emerald-600 transition-colors">{selectedCategory}</span>
                  <ChevronRight size={20} className={`text-emerald-500 transition-transform ${showCategoryDropdown ? 'rotate-90' : ''}`} />
                </button>
                
                {showCategoryDropdown && (
                  <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-emerald-200 max-h-80 overflow-y-auto">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left font-bold transition-all ${
                          selectedCategory === cat
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                            : 'hover:bg-emerald-50 text-slate-700'
                        } first:rounded-t-xl last:rounded-b-xl`}
                      >
                        {selectedCategory === cat && '✓ '}{cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Condition */}
              <div className="relative">
                <label className="block text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Kondisi Kulit
                </label>
                <button
                  onClick={() => {
                    setShowConditionDropdown(!showConditionDropdown);
                    setShowCategoryDropdown(false);
                    setShowPriceDropdown(false);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl hover:border-emerald-400 font-bold text-slate-700 transition-all shadow-md hover:shadow-lg flex items-center justify-between group"
                >
                  <span className="group-hover:text-emerald-600 transition-colors">{selectedCondition}</span>
                  <ChevronRight size={20} className={`text-emerald-500 transition-transform ${showConditionDropdown ? 'rotate-90' : ''}`} />
                </button>
                
                {showConditionDropdown && (
                  <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-emerald-200 max-h-80 overflow-y-auto">
                    {conditions.map(cond => (
                      <button
                        key={cond}
                        onClick={() => {
                          setSelectedCondition(cond);
                          setShowConditionDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left font-bold transition-all ${
                          selectedCondition === cond
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                            : 'hover:bg-emerald-50 text-slate-700'
                        } first:rounded-t-xl last:rounded-b-xl`}
                      >
                        {selectedCondition === cond && '✓ '}{cond}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div className="relative">
                <label className="block text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Rentang Harga
                </label>
                <button
                  onClick={() => {
                    setShowPriceDropdown(!showPriceDropdown);
                    setShowCategoryDropdown(false);
                    setShowConditionDropdown(false);
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl hover:border-emerald-400 font-bold text-slate-700 transition-all shadow-md hover:shadow-lg flex items-center justify-between group"
                >
                  <span className="group-hover:text-emerald-600 transition-colors">{formatPriceRange(priceRange)}</span>
                  <ChevronRight size={20} className={`text-emerald-500 transition-transform ${showPriceDropdown ? 'rotate-90' : ''}`} />
                </button>
                
                {showPriceDropdown && (
                  <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-emerald-200 max-h-80 overflow-y-auto">
                    {priceRanges.map(range => (
                      <button
                        key={range}
                        onClick={() => {
                          setPriceRange(range);
                          setShowPriceDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left font-bold transition-all ${
                          priceRange === range
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                            : 'hover:bg-emerald-50 text-slate-700'
                        } first:rounded-t-xl last:rounded-b-xl`}
                      >
                        {priceRange === range && '✓ '}{formatPriceRange(range)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto">
        {currentProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-slate-500 text-xl font-bold">Produk tidak ditemukan</p>
            <button
              onClick={resetFilters}
              className="mt-4 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {currentProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-slate-100 hover:border-emerald-200 cursor-pointer"
                >
                  <div className="p-6 flex flex-col h-full">
                    {/* Category Badge */}
                    <div className="mb-3">
                      <span className="inline-block text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-wide">
                        {product.category}
                      </span>
                    </div>
                    
                    {/* Product Name */}
                    <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                      {product.name}
                    </h3>

                    {/* Product Image */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl mb-4 flex items-center justify-center h-48 overflow-hidden">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-contain p-4"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`${product.image_url ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                        <span className="text-4xl font-bold text-emerald-300">{product.brand?.charAt(0) || '?'}</span>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div className="mb-4 flex-grow">
                      <p className={`text-slate-600 text-sm ${expandedDescriptions[product.id] ? '' : 'line-clamp-3'}`}>
                        {product.description}
                      </p>
                      {product.description && product.description.split(' ').length > 25 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedDescriptions(prev => ({
                              ...prev,
                              [product.id]: !prev[product.id]
                            }));
                          }}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 mt-2"
                        >
                          {expandedDescriptions[product.id] ? 'Tampilkan Lebih Sedikit' : 'Tampilkan Lebih'}
                        </button>
                      )}
                    </div>
                    
                    {/* Conditions Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.for_conditions.slice(0, 2).map((condition, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                    
                    {/* Price and Buttons */}
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xl font-black text-slate-900">
                          {formatCurrency(product.price)}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product.id);
                          }}
                          className="flex-1 bg-white border-2 border-emerald-500 text-emerald-600 px-3 py-3 rounded-xl transition-all duration-200 font-bold hover:bg-emerald-50 flex items-center justify-center gap-1.5 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <ShoppingCart size={16} />
                          <span className="text-sm">Keranjang</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            buyNow(product.id);
                          }}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-3 py-3 rounded-xl transition-all duration-200 font-bold shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <span className="text-sm items-center flex gap-1 justify-center">
                            <ShoppingBag size={16} />
                          </span>
                        </button>
                        {product.product_url && (
                          <a
                            href={product.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 bg-white border-2 border-orange-500 text-orange-600 px-3 py-3 rounded-xl transition-all duration-200 font-bold hover:bg-orange-50 flex items-center justify-center gap-1.5 transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <ShoppingBag size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} />
                  Prev
                </button>

                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber)}
                          className={`w-10 h-10 rounded-xl font-bold transition-all ${
                            currentPage === pageNumber
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                              : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <span key={pageNumber} className="flex items-center text-slate-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>



      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Cart Modal */}
      {showCart && user && (
        <Cart
          user={user}
          onClose={() => {
            setShowCart(false);
            fetchCart(); // Refresh cart when closing to update badge
          }}
          onCheckout={(items, total) => {
            setCheckoutData({ items, total, fromCart: true }); // Mark as from cart
            setShowCart(false);
            setShowCheckout(true);
          }}
        />
      )}

      {/* Checkout Modal */}
      {showCheckout && checkoutData && (
        <Checkout
          user={user}
          cartItems={checkoutData.items}
          total={checkoutData.total}
          onClose={() => {
            setShowCheckout(false);
            setCheckoutData(null);
          }}
          onSuccess={(order) => {
            // Only clear cart if checkout was from cart
            if (checkoutData?.fromCart) {
              const cartKey = `cart_${user.id}`;
              localStorage.removeItem(cartKey);
              setCart([]);
            }
            
            setShowCheckout(false);
            setCheckoutData(null);
            showMessage(`✓ Pesanan berhasil dibuat! Order ID: ${order.id}`);
            fetchCart(); // Refresh cart
          }}
        />
      )}

      {/* Order History Modal */}
      {showOrderHistory && user && (
        <OrderHistory
          user={user}
          onClose={() => setShowOrderHistory(false)}
        />
      )}
    </div>
  );
};

export default Products;
