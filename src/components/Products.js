// src/components/Products.js
import React, { useState, useEffect } from 'react';
import { Filter, ChevronLeft, ChevronRight, X, Search, ShoppingCart, History } from 'lucide-react';
import Cart from './Cart';
import Checkout from './Checkout';
import OrderHistory from './OrderHistory';
import './Products.css';

const Products = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
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
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [products, selectedCategory, selectedCondition, priceRange, searchQuery]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
        setFilteredProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
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
      }
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

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedCategory('Semua');
    setSelectedCondition('Semua');
    setPriceRange('Semua');
    setSearchQuery('');
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

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatPriceRange = (range) => {
    if (range === 'Semua') return 'Semua Harga';
    const [min, max] = range.split('-').map(Number);
    if (max) {
      return `${formatPrice(min)} - ${formatPrice(max)}`;
    }
    return `> ${formatPrice(min)}`;
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
                  className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-slate-100 hover:border-emerald-200"
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
                    
                    {/* Description */}
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-grow">
                      {product.description}
                    </p>
                    
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
                          {formatPrice(product.price)}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => addToCart(product.id)}
                          className="flex-1 bg-white border-2 border-emerald-500 text-emerald-600 px-3 py-3 rounded-xl transition-all duration-200 font-bold hover:bg-emerald-50 flex items-center justify-center gap-1.5 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <ShoppingCart size={16} />
                          <span className="text-sm">Keranjang</span>
                        </button>
                        <button
                          onClick={() => buyNow(product.id)}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-3 py-3 rounded-xl transition-all duration-200 font-bold shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <span className="text-sm">Beli</span>
                        </button>
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
          onClose={() => setShowCart(false)}
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
