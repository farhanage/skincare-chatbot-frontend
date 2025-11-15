// src/components/Products.js
import React, { useState, useEffect } from 'react';
import './Products.css';

const Products = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchCart();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCart(data.items);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  };

  const addToCart = async (productId) => {
    if (!user) {
      showMessage('Silakan login terlebih dahulu!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1
        })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Produk ditambahkan ke keranjang!');
        fetchCart();
      }
    } catch (err) {
      showMessage(' Gagal menambahkan ke keranjang');
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity
        })
      });

      if (response.ok) {
        fetchCart();
      }
    } catch (err) {
      console.error('Failed to update cart:', err);
    }
  };

  const checkout = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        showMessage(data.message);
        setCart([]);
        setShowCart(false);
      }
    } catch (err) {
      showMessage('Checkout gagal');
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

  const cartTotal = cart.reduce((sum, item) => sum + (item.item_total || 0), 0);

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
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-2">
              Skincare Shop
            </h1>
            <p className="text-slate-600 text-lg font-semibold">Produk perawatan kulit terpercaya</p>
          </div>
          
          {user && (
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-bold shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span>Keranjang</span>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
                  {cart.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {products.map((product) => (
          <div
            key={product.id}
            className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="p-6 flex flex-col h-full">
              {/* Category Badge */}
              <div className="mb-3">
                <span className="inline-block text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-wide">
                  {product.category}
                </span>
              </div>
              
              {/* Product Name */}
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2 min-h-[3.5rem]">
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
              
              {/* Price and Button - Fixed at bottom */}
              <div className="mt-auto pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl font-black text-slate-900">
                    {formatPrice(product.price)}
                  </div>
                </div>
                
                <button
                  onClick={() => addToCart(product.id)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-3 rounded-xl transition-all duration-200 font-bold shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Tambah ke Keranjang
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Sidebar */}
      {showCart && user && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setShowCart(false)}>
          <div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Cart Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Keranjang</h2>
                  <p className="text-slate-500 text-sm mt-1">{cart.length} item</p>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-slate-500 text-lg font-medium">
                    Keranjang masih kosong
                  </p>
                  <p className="text-slate-400 text-sm mt-2">
                    Yuk mulai belanja!
                  </p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div
                        key={item.product_id}
                        className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-emerald-300 transition-colors"
                      >
                        <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">
                          {item.product?.name}
                        </h3>
                        <p className="text-emerald-600 font-black text-lg mb-3">
                          {formatPrice(item.product?.price)}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-200">
                            <button
                              onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                              className="w-8 h-8 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-600 rounded-lg font-bold transition-colors"
                            >
                              −
                            </button>
                            <span className="text-slate-900 font-bold w-10 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                              className="w-8 h-8 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-600 rounded-lg font-bold transition-colors"
                            >
                              +
                            </button>
                          </div>
                          
                          <span className="text-slate-900 font-black text-lg">
                            {formatPrice(item.item_total)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Section */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 mb-6 border border-emerald-200">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700 font-bold text-lg">Total Belanja:</span>
                      <span className="text-emerald-600 font-black text-2xl">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={checkout}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-lg py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Checkout Sekarang
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
      `}</style>
    </div>
  );
};

export default Products;
