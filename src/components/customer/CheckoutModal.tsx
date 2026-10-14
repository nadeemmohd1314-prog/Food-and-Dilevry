import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../translations';
import { PaymentMethod, Order } from '../../types';
import { api } from '../../services/api';
import {
  X,
  MapPin,
  Phone,
  User,
  CreditCard,
  Banknote,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Home,
  Briefcase,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: (order: Order) => void;
  onOpenPhoneAuth: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderPlaced,
  onOpenPhoneAuth,
}) => {
  const { customerUser, isCustomerAuthenticated, selectedCity, language } = useAuth();
  const {
    restaurantId,
    restaurantName,
    items,
    subtotal,
    deliveryFee,
    packagingFee,
    taxAmount,
    discountAmount,
    totalAmount,
    appliedCoupon,
    clearCart,
  } = useCart();

  const [customerName, setCustomerName] = useState(customerUser?.name || 'Customer');
  const [phone, setPhone] = useState(customerUser?.phoneNumber?.replace('+91', '') || '');
  const [address, setAddress] = useState(
    customerUser?.deliveryAddress || `Flat 402, Signature Residency, ${selectedCity}, Uttar Pradesh`
  );
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [landmark, setLandmark] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = translations[language];

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!restaurantId || items.length === 0) {
      setError('Your food basket is empty.');
      return;
    }

    if (!phone.trim()) {
      setError('Please provide a valid Indian phone number.');
      return;
    }

    if (!address.trim()) {
      setError('Delivery address is required.');
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        restaurantId,
        customer: {
          name: customerName.trim(),
          phone: phone.startsWith('+91') ? phone : `+91 ${phone.trim()}`,
          city: selectedCity,
          deliveryAddress: address.trim(),
          addressType,
          landmark: landmark.trim(),
          deliveryNotes: deliveryNotes.trim(),
        },
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          specialInstructions: i.specialInstructions || '',
        })),
        paymentMethod,
        couponCode: appliedCoupon || undefined,
        deliveryNotes: deliveryNotes.trim(),
      };

      const placedOrder = await api.orders.create(orderPayload);
      clearCart();
      onOrderPlaced(placedOrder);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col my-6 max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-amber-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-extrabold text-lg leading-tight">Complete Your Order</h3>
            <p className="text-xs text-white/80 mt-0.5">
              Delivering from <span className="font-bold underline">{restaurantName}</span> ({selectedCity})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2.5 text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-semibold">{error}</div>
            </div>
          )}

          {/* Delivery Details */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-gray-900 text-sm flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>1. Delivery Destination</span>
              </h4>

              {!isCustomerAuthenticated && (
                <button
                  type="button"
                  onClick={onOpenPhoneAuth}
                  className="text-red-600 hover:text-red-700 font-bold text-[11px] underline"
                >
                  Sign in with Phone for quick delivery
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Customer Name</label>
                <div className="flex rounded-xl border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500 overflow-hidden">
                  <div className="pl-3 flex items-center text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nadeem Khan"
                    className="w-full px-3 py-2 text-xs bg-transparent focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mobile Number (SMS Updates)</label>
                <div className="flex rounded-xl border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500 overflow-hidden">
                  <div className="px-2.5 py-2 bg-gray-100 text-gray-700 font-bold border-r border-gray-200 select-none">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    className="w-full px-3 py-2 text-xs bg-transparent focus:outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Complete Street Address ({selectedCity}, UP)
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House/Flat No., Apartment/Street name, Locality"
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nearby Landmark</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Janpath Market / Metro Pillar 42"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Address Label</label>
                <div className="flex space-x-2">
                  {(['Home', 'Work', 'Other'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAddressType(type)}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 border transition-all ${
                        addressType === type
                          ? 'bg-red-50 border-red-500 text-red-700 font-bold'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {type === 'Home' && <Home className="w-3 h-3" />}
                      {type === 'Work' && <Briefcase className="w-3 h-3" />}
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <h4 className="font-extrabold text-gray-900 text-sm flex items-center space-x-1.5">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>2. Payment Option</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* UPI */}
              <div
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-red-600 bg-red-50/50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-gray-900 text-xs">Instant UPI</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">
                  Google Pay, PhonePe, Paytm, BHIM QR
                </p>
              </div>

              {/* Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-red-600 bg-red-50/50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-gray-900 text-xs">Cash on Delivery</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">
                  Pay at doorstep via cash or driver QR
                </p>
              </div>

              {/* Card */}
              <div
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-red-600 bg-red-50/50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-gray-900 text-xs">Debit / Credit Card</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">
                  Visa, Mastercard, RuPay & NetBanking
                </p>
              </div>
            </div>

            {/* UPI simulator prompt */}
            {paymentMethod === 'upi' && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 text-[11px]">UPI VPA Handle:</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded">
                    Zero Extra Surcharge
                  </span>
                </div>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
            <div className="flex justify-between text-gray-600">
              <span>Items Total ({items.length} dishes)</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST & Packaging Charges</span>
              <span>₹{(taxAmount + packagingFee).toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon ({appliedCoupon})</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200 flex justify-between font-black text-gray-900 text-sm">
              <span>Final Amount to Pay</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Placing Your Order...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm & Place Order (₹{totalAmount.toFixed(2)})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
