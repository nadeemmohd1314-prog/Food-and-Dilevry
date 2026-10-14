import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { X, Clock, MapPin, Receipt, Star, ArrowRight, ShoppingBag } from 'lucide-react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (order: Order) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
}) => {
  const { customerUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.orders.list({ customerPhone: customerUser?.phoneNumber })
        .then((data) => {
          setOrders(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, customerUser]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[88vh]">
        <div className="bg-gradient-to-r from-red-600 to-amber-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <Receipt className="w-5 h-5 text-white" />
            <h3 className="font-extrabold text-lg">My Past Orders</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-bold text-gray-800">No orders found yet</p>
              <p className="text-xs text-gray-400 mt-1">Place an order from any UP restaurant to see it here!</p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-red-300 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900 text-sm">{ord.restaurantName}</span>
                    <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold">
                      {ord.orderNumber}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(ord.createdAt).toLocaleDateString()} at{' '}
                    {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-gray-700 font-medium">
                    {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                  <div className="flex items-center space-x-3 pt-1 text-xs">
                    <span className="font-extrabold text-gray-900">₹{ord.totalAmount.toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      ord.orderStatus === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.orderStatus === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ord.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      onSelectOrder(ord);
                      onClose();
                    }}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs flex items-center space-x-1 transition-colors"
                  >
                    <span>Track / Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
