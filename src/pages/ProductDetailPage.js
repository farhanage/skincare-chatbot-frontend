import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Layout';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Menu, ArrowLeft, ShoppingCart, Package, Star, Shield, Truck, Award, ChevronRight } from 'lucide-react';
import { getProductById, getProductRecommendations, getBanditRecommendations } from '../services/productService';
import { trackInteraction } from '../services/interactionService';
import { formatCurrency } from '../utils/formatters';

export default function ProductDetailPage({ user, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useLocalStorage('sidebarOpen', true);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [similarProducts, setSimilarProducts] = useState([]);
  const [personalizedProducts, setPersonalizedProducts] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchRecommendations();
  }, [id, user]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await getProductById(id);
      if (data.success) {
        setProduct(data.product);
        // Note: Click tracking is done when user clicks the product card
        // in Products.js or chat recommendations, not here on page load
      }
    } catch (err) {
      console.error('Failed to fetch product:', err);
      showMessage('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const addToCart = () => {
    if (!user) {
      showMessage('Silakan login terlebih dahulu!');
      navigate('/login');
      return;
    }

    try {
      const cartKey = `cart_${user.id}`;
      const savedCart = localStorage.getItem(cartKey);
      let currentCart = savedCart ? JSON.parse(savedCart) : [];

      const existingIndex = currentCart.findIndex(item => item.id === product.id);
      
      if (existingIndex >= 0) {
        currentCart[existingIndex].quantity += quantity;
        showMessage('✓ Produk berhasil ditambahkan ke keranjang!');
      } else {
        currentCart.push({
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          quantity: quantity
        });
        showMessage('✓ Produk berhasil ditambahkan ke keranjang!');
      }

      localStorage.setItem(cartKey, JSON.stringify(currentCart));
      
      // Track add to cart interaction
      trackInteraction(product.id, 'add_to_cart', 2.0);
    } catch (err) {
      showMessage('✗ Gagal menambahkan ke keranjang');
    }
  };

  const buyNow = () => {
    if (!user) {
      showMessage('Silakan login terlebih dahulu!');
      navigate('/login');
      return;
    }

    try {
      const checkoutKey = `checkout_${user.id}`;
      const checkoutData = {
        items: [{
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          quantity: quantity
        }],
        total: product.price * quantity
      };
      
      sessionStorage.setItem(checkoutKey, JSON.stringify(checkoutData));
      navigate('/products?checkout=true');
    } catch (err) {
      showMessage('Terjadi kesalahan');
    }
  };

  const fetchRecommendations = async () => {
    if (!id) return;
    
    setLoadingRecommendations(true);
    try {
      // Fetch similar products (You May Also Like)
      const similarData = await getProductRecommendations(id, 5);
      if (similarData.success) {
        const recommendations = similarData.recommendations || similarData.products || [];
        setSimilarProducts(recommendations);
      }

      // Fetch personalized recommendations (only for logged-in users)
      if (user) {
        const banditData = await getBanditRecommendations();
        if (banditData.success) {
          const recommendations = banditData.recommendations || banditData.products || [];
          setPersonalizedProducts(recommendations);
        }
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleRecommendationClick = (productId) => {
    // Track click for logged-in users
    if (user) {
      trackInteraction(productId, 'click', 1.0);
    }
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar 
          currentPage="products"
          user={user}
          onLogout={onLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar 
          currentPage="products"
          user={user}
          onLogout={onLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
          <div className="text-center">
            <p className="text-xl text-slate-600 mb-4">Produk tidak ditemukan</p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Kembali ke Produk
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        currentPage="products"
        user={user}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-3.5 left-3 z-20 bg-white p-2 sm:p-3 rounded-xl shadow-lg text-emerald-600 hover:bg-emerald-50 transition-all"
      >
        <Menu size={20} className="sm:w-6 sm:h-6" />
      </button>

      <div className={`flex-1 min-h-screen relative overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} pt-8 lg:pt-0`}>
        {/* Background */}
        <div className="fixed inset-0 opacity-60 pointer-events-none" style={{
          backgroundImage: `url('/bg.png')`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}></div>
        <div className="fixed inset-0 bg-gradient-to-br from-white/80 via-emerald-50/70 to-teal-50/70 pointer-events-none"></div>

        {/* Message Notification */}
        {message && (
          <div className="fixed top-4 right-4 z-50 bg-white border border-emerald-200 shadow-lg rounded-lg px-6 py-3 animate-in slide-in-from-top">
            <p className="text-sm font-medium text-slate-800">{message}</p>
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 font-medium"
          >
            <ArrowLeft size={20} />
            Kembali ke Produk
          </button>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-6 sm:p-8 lg:p-10">
              {/* Product Image */}
              <div className="flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8">
                <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-contain rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`${product.image_url ? 'hidden' : 'flex'} flex-col items-center justify-center`}>
                    <Package size={120} className="text-emerald-200" />
                    <span className="text-4xl font-bold text-emerald-600 mt-4">{product.brand?.charAt(0)}</span>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col">
                <div className="mb-2">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                    {product.category}
                  </span>
                </div>
                
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{product.name}</h1>
                <p className="text-lg text-emerald-600 font-semibold mb-1">{product.brand}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star size={18} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium text-slate-700">4.5</span>
                  </div>
                  <span className="text-sm text-slate-500">•</span>
                  <span className="text-sm text-slate-500">1,234 terjual</span>
                </div>

                <div className="mb-6">
                  <p className="text-4xl font-bold text-slate-900">{formatCurrency(product.price)}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Deskripsi</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
                </div>

                {/* For Conditions */}
                {product.for_conditions && product.for_conditions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Cocok untuk:</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.for_conditions.map((condition, idx) => (
                        <span key={idx} className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-lg border border-teal-200">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Jumlah</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center border border-slate-300 rounded-lg hover:bg-slate-50 font-semibold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 h-10 text-center border border-slate-300 rounded-lg font-semibold"
                      min="1"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center border border-slate-300 rounded-lg hover:bg-slate-50 font-semibold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={addToCart}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-xl hover:bg-emerald-50 font-semibold transition-colors"
                  >
                    <ShoppingCart size={20} />
                    Tambah ke Keranjang
                  </button>
                  <button
                    onClick={buyNow}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    Beli Sekarang
                  </button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200">
                  <div className="flex flex-col items-center text-center">
                    <Shield className="text-emerald-600 mb-2" size={24} />
                    <p className="text-xs text-slate-600">100% Original</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Truck className="text-emerald-600 mb-2" size={24} />
                    <p className="text-xs text-slate-600">Gratis Ongkir</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Award className="text-emerald-600 mb-2" size={24} />
                    <p className="text-xs text-slate-600">Bergaransi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* You May Also Like Section */}
          <div className="mt-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">You May Also Like</h2>
              <p className="text-slate-600">Produk serupa yang mungkin Anda sukai</p>
            </div>
            
            {loadingRecommendations ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <p className="ml-3 text-slate-600">Memuat rekomendasi...</p>
              </div>
            ) : similarProducts.length > 0 ? (
              <div className="overflow-x-auto pb-4 -mx-2 px-2">
                <div className="flex gap-4 min-w-max">
                  {similarProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleRecommendationClick(product.id)}
                      className="w-64 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group border border-slate-200 hover:border-emerald-300"
                    >
                      <div className="p-4">
                        {/* Product Image */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg mb-3 flex items-center justify-center h-40 overflow-hidden">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`${product.image_url ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                            <Package size={48} className="text-emerald-300" />
                          </div>
                        </div>
                        
                        {/* Category */}
                        <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full mb-2">
                          {product.category}
                        </span>
                        
                        {/* Product Name */}
                        <h3 className="font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                          {product.name}
                        </h3>
                        
                        {/* Brand */}
                        <p className="text-sm text-slate-600 mb-2">{product.brand}</p>
                        
                        {/* Price */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                          <p className="text-lg font-bold text-emerald-600">
                            {formatCurrency(product.price)}
                          </p>
                          <ChevronRight className="text-emerald-600 group-hover:translate-x-1 transition-transform" size={20} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>Tidak ada rekomendasi produk serupa saat ini</p>
              </div>
            )}
          </div>

          {/* Recommended For You Section (only for logged-in users) */}
          {user && (
            <div className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Recommended For You</h2>
                <p className="text-slate-600">Rekomendasi khusus berdasarkan preferensi Anda</p>
              </div>
              
              {loadingRecommendations ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  <p className="ml-3 text-slate-600">Memuat rekomendasi...</p>
                </div>
              ) : personalizedProducts.length > 0 ? (
                <div className="overflow-x-auto pb-4 -mx-2 px-2">
                  <div className="flex gap-4 min-w-max">
                    {personalizedProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleRecommendationClick(product.id)}
                      className="w-64 bg-gradient-to-br from-white to-emerald-50/30 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-emerald-200 hover:border-emerald-400"
                    >
                      <div className="p-4">
                        {/* Product Image */}
                        <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg mb-3 flex items-center justify-center h-40 overflow-hidden">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`${product.image_url ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                            <Package size={48} className="text-emerald-400" />
                          </div>
                        </div>
                        
                        {/* Category*/}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                            {product.category}
                          </span>
                        </div>
                        
                        {/* Product Name */}
                        <h3 className="font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                          {product.name}
                        </h3>
                        
                        {/* Brand */}
                        <p className="text-sm text-slate-600 mb-2">{product.brand}</p>
                        
                        {/* Price */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-emerald-100">
                          <p className="text-lg font-bold text-emerald-600">
                            {formatCurrency(product.price)}
                          </p>
                          <ChevronRight className="text-emerald-600 group-hover:translate-x-1 transition-transform" size={20} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>Tidak ada rekomendasi personal saat ini</p>
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
