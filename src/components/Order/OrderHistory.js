import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck, Eye } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const statusConfig = {
  pending: { label: 'Menunggu Konfirmasi', icon: Clock, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  confirmed: { label: 'Dikonfirmasi', icon: CheckCircle, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  processing: { label: 'Diproses', icon: Package, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  shipping: { label: 'Dikirim', icon: Truck, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  delivered: { label: 'Selesai', icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200' },
  cancelled: { label: 'Dibatalkan', icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200' }
};

export default function OrderHistory({ user, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/orders/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to load orders');

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const OrderDetailModal = ({ order, onClose }) => {
    const StatusIcon = statusConfig[order.status]?.icon || Clock;
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Detail Pesanan</h3>
            <p className="text-slate-600">Order ID: {order.id}</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Status */}
            <div className={`p-4 rounded-xl border-2 ${statusConfig[order.status]?.color || 'text-slate-600 bg-slate-50 border-slate-200'} flex items-center gap-3`}>
              <StatusIcon size={24} />
              <div>
                <p className="font-bold">Status Pesanan</p>
                <p className="text-sm">{statusConfig[order.status]?.label || order.status}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-bold text-slate-900 mb-3">Produk</h4>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-slate-900">{item.product_name}</p>
                        <p className="text-sm text-slate-600">{item.product_brand}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-700">x{item.quantity}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-slate-600">
                        Rp {item.price.toLocaleString('id-ID')} / pcs
                      </p>
                      <p className="font-black text-emerald-600">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h4 className="font-bold text-slate-900 mb-3">Alamat Pengiriman</h4>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="font-bold text-slate-900">{order.shipping_address.full_name}</p>
                <p className="text-sm text-slate-700 mt-1">{order.shipping_address.phone}</p>
                <p className="text-sm text-slate-700 mt-2">{order.shipping_address.address}</p>
                <p className="text-sm text-slate-700">
                  {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postal_code}
                </p>
              </div>
            </div>

            {/* Payment */}
            <div>
              <h4 className="font-bold text-slate-900 mb-3">Pembayaran</h4>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-700">Metode</span>
                  <span className="font-bold text-slate-900">
                    {order.payment_method === 'cod' ? 'COD (Cash on Delivery)' : 'Transfer Bank'}
                  </span>
                </div>
                <div className="border-t border-slate-300 pt-3 mt-3 flex justify-between">
                  <span className="font-black text-slate-900">Total Pembayaran</span>
                  <span className="text-xl font-black text-emerald-600">
                    Rp {order.total_amount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="text-sm text-slate-600">
              <p>Dibuat: {formatDate(order.created_at)}</p>
              <p>Terakhir diupdate: {formatDate(order.updated_at)}</p>
            </div>
          </div>

          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-black text-slate-900">Riwayat Pembelian</h2>
            <p className="text-sm text-slate-600 mt-1">{orders.length} pesanan</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-slate-100 p-6 rounded-2xl mb-4">
                  <Package size={48} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Belum Ada Pesanan</h3>
                <p className="text-slate-600">Mulai berbelanja untuk melihat riwayat pesanan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const StatusIcon = statusConfig[order.status]?.icon || Clock;
                  
                  return (
                    <div key={order.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-lg transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-slate-900">{order.id}</p>
                          <p className="text-sm text-slate-600">{formatDate(order.created_at)}</p>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${statusConfig[order.status]?.color || 'text-slate-600 bg-slate-50 border-slate-200'}`}>
                          <StatusIcon size={16} />
                          <span className="text-sm font-bold">{statusConfig[order.status]?.label || order.status}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-slate-700">{item.product_name} x{item.quantity}</span>
                            <span className="font-bold text-slate-900">
                              Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-300">
                        <div>
                          <p className="text-xs text-slate-600">Total Pembayaran</p>
                          <p className="text-lg font-black text-emerald-600">
                            Rp {order.total_amount.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-all"
                        >
                          <Eye size={18} />
                          Detail
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <button
              onClick={onClose}
              className="w-full bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </>
  );
}
