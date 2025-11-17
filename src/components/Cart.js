import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, X, ShoppingBag } from 'lucide-react';

export default function Cart({ user, onClose, onCheckout }) {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user]);

  const loadCart = () => {
    const cartKey = `cart_${user.id}`;
    const saved = localStorage.getItem(cartKey);
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load cart:', e);
      }
    }
  };

  const saveCart = (items) => {
    const cartKey = `cart_${user.id}`;
    localStorage.setItem(cartKey, JSON.stringify(items));
    setCartItems(items);
  };

  const updateQuantity = (productId, change) => {
    const updated = cartItems.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    saveCart(updated);
  };

  const removeItem = (productId) => {
    const updated = cartItems.filter(item => item.id !== productId);
    saveCart(updated);
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Keranjang kosong!');
      return;
    }
    onCheckout(cartItems, calculateTotal());
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl">
              <ShoppingCart size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Keranjang</h2>
              <p className="text-sm text-slate-600">{cartItems.length} produk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="bg-slate-100 p-6 rounded-2xl mb-4">
                <ShoppingCart size={48} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Keranjang Kosong</h3>
              <p className="text-slate-600">Tambahkan produk ke keranjang untuk checkout</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-slate-50 rounded-xl p-4 flex gap-4 border border-slate-200">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-slate-600 mb-2">{item.brand}</p>
                    <p className="text-lg font-black text-emerald-600">
                      Rp {item.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-300">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-2 hover:bg-slate-100 rounded-l-lg transition-all"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} className={item.quantity <= 1 ? 'text-slate-300' : 'text-slate-600'} />
                      </button>
                      <span className="px-3 font-bold text-slate-900 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-2 hover:bg-slate-100 rounded-r-lg transition-all"
                      >
                        <Plus size={16} className="text-slate-600" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <p className="font-bold text-slate-700">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </p>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-all text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Total & Checkout */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-slate-900">Total</span>
              <span className="text-2xl font-black text-emerald-600">
                Rp {calculateTotal().toLocaleString('id-ID')}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-black text-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-xl flex items-center justify-center gap-2"
            >
              <ShoppingBag size={24} />
              Checkout Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
