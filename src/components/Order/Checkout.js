import React, { useState } from 'react';
import { MapPin, User, Phone, CreditCard, X, CheckCircle } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function Checkout({ user, cartItems, total, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    paymentMethod: 'cod'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.province) {
      alert('Mohon lengkapi semua data!');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        user_id: user.id,
        user_name: user.name,
        user_email: user.email,
        items: cartItems.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_brand: item.brand,
          price: item.price,
          quantity: item.quantity
        })),
        shipping_address: {
          full_name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          postal_code: formData.postalCode
        },
        payment_method: formData.paymentMethod,
        total_amount: total,
        status: 'pending'
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error('Checkout failed');

      const result = await response.json();

      // Clear cart
      const cartKey = `cart_${user.id}`;
      localStorage.removeItem(cartKey);

      onSuccess(result);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl">
              <CreditCard size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Checkout</h2>
              <p className="text-sm text-slate-600">Lengkapi data pengiriman</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
            <h3 className="font-bold text-slate-900 mb-3">Ringkasan Pesanan</h3>
            <div className="space-y-2 mb-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-700">{item.name} x{item.quantity}</span>
                  <span className="font-bold text-slate-900">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-emerald-300 pt-3 flex justify-between">
              <span className="font-black text-slate-900">Total</span>
              <span className="text-xl font-black text-emerald-600">
                Rp {total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Shipping Info */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-emerald-600" />
              Data Pengiriman
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-slate-900"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Nomor Telepon *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-slate-900"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Alamat Lengkap *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Kota/Kabupaten *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Provinsi *</label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Kode Pos</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-emerald-600" />
              Metode Pembayaran
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl hover:border-emerald-500 cursor-pointer transition-all">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handleChange}
                  className="w-5 h-5 text-emerald-600"
                />
                <div>
                  <p className="font-bold text-slate-900">COD (Cash on Delivery)</p>
                  <p className="text-sm text-slate-600">Bayar saat barang sampai</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl hover:border-emerald-500 cursor-pointer transition-all">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="transfer"
                  checked={formData.paymentMethod === 'transfer'}
                  onChange={handleChange}
                  className="w-5 h-5 text-emerald-600"
                />
                <div>
                  <p className="font-bold text-slate-900">Transfer Bank</p>
                  <p className="text-sm text-slate-600">BCA, Mandiri, BNI, BRI</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl hover:border-emerald-500 cursor-pointer transition-all">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="qris"
                  checked={formData.paymentMethod === 'qris'}
                  onChange={handleChange}
                  className="w-5 h-5 text-emerald-600"
                />
                <div>
                  <p className="font-bold text-slate-900">QRIS</p>
                  <p className="text-sm text-slate-600">Scan QR pakai e-wallet apapun</p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="sticky bottom-0 bg-white pt-4 pb-2 -mx-6 px-6 border-t border-slate-200 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-black text-lg hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-200 hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle size={24} />
                  Konfirmasi Pesanan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
