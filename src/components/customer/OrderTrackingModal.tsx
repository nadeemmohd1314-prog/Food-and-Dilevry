import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import { api } from '../../services/api';
import {
  X,
  CheckCircle2,
  Clock,
  Bike,
  UtensilsCrossed,
  Phone,
  ShieldCheck,
  Star,
  MapPin,
  RefreshCw,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

interface OrderTrackingModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenSupport?: (orderId: string) => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order: initialOrder,
  isOpen,
  onClose,
  onOpenSupport,
}) => {
  const [order, setOrder] = useState<Order | null>(initialOrder);
  const [rating, setRating] = useState<number>(initialOrder?.rating || 5);
  const [review, setReview] = useState<string>(initialOrder?.reviewComment || '');
  const [rated, setRated] = useState<boolean>(Boolean(initialOrder?.rating));
  const [submittingRating, setSubmittingRating] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    setOrder(initialOrder);
    setRating(initialOrder?.rating || 5);
    setRated(Boolean(initialOrder?.rating));
  }, [initialOrder]);

  // Live polling every 5 seconds to sync with admin & rider actions
  useEffect(() => {
    if (!order || !isOpen || order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await api.orders.list({ search: order.orderNumber });
        if (res && res.length > 0) {
          setOrder(res[0]);
        }
      } catch {
        // ignore
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const steps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'pending', label: 'Order Placed', desc: 'Sent to kitchen for confirmation' },
    { key: 'preparing', label: 'Kitchen Preparing', desc: 'Chefs are cooking your meal' },
    { key: 'ready_for_pickup', label: 'Ready for Pickup', desc: 'Packed fresh and waiting for rider' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider is on the way to your door' },
    { key: 'delivered', label: 'Delivered', desc: 'Enjoy your delicious feast!' },
  ];

  const getStepStatus = (stepKey: OrderStatus) => {
    const statusOrder: OrderStatus[] = [
      'pending',
      'accepted',
      'preparing',
      'ready_for_pickup',
      'out_for_delivery',
      'delivered',
    ];

    const currentIdx = statusOrder.indexOf(order.orderStatus);
    const stepIdx = statusOrder.indexOf(stepKey);

    if (order.orderStatus === 'cancelled') return 'cancelled';
    if (currentIdx > stepIdx) return 'completed';
    if (currentIdx === stepIdx || (stepKey === 'preparing' && order.orderStatus === 'accepted')) return 'active';
    return 'upcoming';
  };

  const handleRateOrder = async () => {
    setSubmittingRating(true);
    try {
      await api.orders.rate(order.id, { rating, reviewComment: review });
      setRated(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleCancelOrder = async () => {
    const reason = window.prompt('Please enter the reason for cancelling this order:');
    if (!reason) return;
    setCancelling(true);
    try {
      const updated = await api.orders.updateStatus(order.id, {
        orderStatus: 'cancelled',
        cancellationReason: reason,
      });
      setOrder(updated);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col my-6 max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-red-600 to-amber-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono bg-white/20 px-2 py-0.5 rounded-md font-bold text-xs">
                {order.orderNumber}
              </span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize">
                {order.orderStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <h3 className="font-extrabold text-base mt-1">{order.restaurantName}</h3>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* OTP Box (Critical for Secure Proof of Delivery) */}
          {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-2 border-dashed border-amber-400 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5 text-amber-900 font-extrabold text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Secure Delivery OTP:</span>
                </div>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Share this 4-digit code with your rider when they reach your doorstep.
                </p>
              </div>

              <div className="px-4 py-2 bg-white rounded-xl shadow-xs border border-amber-300 font-mono text-2xl font-black text-amber-700 tracking-widest select-all">
                {order.deliveryOtp || '4892'}
              </div>
            </div>
          )}

          {/* Simulated Interactive Delivery Map View */}
          <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-900 border border-gray-200">
            {/* Map styling grid */}
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Simulated Route Line */}
            <svg className="absolute inset-0 w-full h-full">
              <path
                d="M 60 120 Q 180 30, 360 80 T 520 100"
                fill="none"
                stroke="#ef4444"
                strokeWidth="4"
                strokeDasharray="6 6"
              />
            </svg>

            {/* Restaurant Pin */}
            <div className="absolute left-10 top-24 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg animate-pulse">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="mt-1 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                {order.restaurantName}
              </span>
            </div>

            {/* Delivery Rider Pin (animated moving) */}
            <div className="absolute left-1/2 top-10 -translate-x-1/2 flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl border-2 border-white animate-bounce">
                <Bike className="w-5 h-5" />
              </div>
              <span className="mt-1 bg-red-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                {order.assignedDriverName || 'Rider En Route'}
              </span>
            </div>

            {/* Customer Home Pin */}
            <div className="absolute right-10 top-20 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="mt-1 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                {order.customer.name}'s Home
              </span>
            </div>

            {/* Live Status overlay badge */}
            <div className="absolute bottom-2 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-gray-800 flex items-center space-x-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Live GPS & Dispatch Active in {order.city || 'UP'}</span>
            </div>
          </div>

          {/* Assigned Driver Card */}
          {order.assignedDriverName && (
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-xs">{order.assignedDriverName}</h4>
                  <p className="text-[11px] text-gray-500 font-medium">Your Delivery Partner</p>
                </div>
              </div>

              {order.assignedDriverPhone && (
                <a
                  href={`tel:${order.assignedDriverPhone}`}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Rider</span>
                </a>
              )}
            </div>
          )}

          {/* Live Order Timeline */}
          <div className="space-y-4 pt-2">
            <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider">
              Order Journey
            </h4>

            <div className="relative pl-6 space-y-5 border-l-2 border-gray-200 ml-3">
              {steps.map((st) => {
                const status = getStepStatus(st.key);
                return (
                  <div key={st.key} className="relative">
                    {/* Circle icon */}
                    <div
                      className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                        status === 'completed'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : status === 'active'
                          ? 'bg-red-600 border-red-600 text-white animate-pulse'
                          : 'bg-white border-gray-300 text-gray-300'
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                      )}
                    </div>

                    <div>
                      <h5
                        className={`font-bold text-xs ${
                          status === 'active'
                            ? 'text-red-600 font-black'
                            : status === 'completed'
                            ? 'text-gray-900'
                            : 'text-gray-400'
                        }`}
                      >
                        {st.label}
                      </h5>
                      <p className="text-[11px] text-gray-500 mt-0.5">{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Items & Total */}
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="font-bold text-gray-900 pb-1 border-b border-gray-200">
              Ordered Dishes
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-gray-700">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-200 flex justify-between font-black text-gray-900 text-xs">
              <span>Paid via {order.paymentMethod.toUpperCase()}</span>
              <span>Total: ₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Customer Rating Section (Delivered) */}
          {order.orderStatus === 'delivered' && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
              <div className="font-bold text-amber-900 text-xs">How was your meal experience?</div>

              {rated ? (
                <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs bg-white p-2.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Thank you! Your {rating}-star rating has been recorded.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Leave a short comment (e.g. Delicious hot kebabs!)..."
                    className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />

                  <button
                    onClick={handleRateOrder}
                    disabled={submittingRating}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Submit Feedback
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action buttons (Cancel / Support) */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            {order.orderStatus === 'pending' && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="text-red-600 hover:text-red-700 font-bold text-xs flex items-center space-x-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Cancel Order</span>
              </button>
            )}

            <button
              onClick={() => onOpenSupport && onOpenSupport(order.id)}
              className="text-gray-500 hover:text-gray-800 font-bold text-xs flex items-center space-x-1 ml-auto"
            >
              <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              <span>Need Help with Order?</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
