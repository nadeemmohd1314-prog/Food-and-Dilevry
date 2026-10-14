import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../translations';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  Trash2,
  CheckCircle2,
  Percent,
} from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const { language } = useAuth();
  const {
    restaurantName,
    items,
    itemCount,
    subtotal,
    deliveryFee,
    packagingFee,
    taxAmount,
    discountAmount,
    totalAmount,
    appliedCoupon,
    couponError,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    applyCouponCode,
    removeCoupon,
    clearCart,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [applying, setApplying] = useState(false);

  const t = translations[language];

  if (!isCartOpen) return null;

  const popularCoupons = [
    { code: 'UPFOOD50', desc: '50% OFF up to ₹100' },
    { code: 'LUCKNOWTREAT', desc: 'Flat ₹60 OFF above ₹350' },
    { code: 'FIRSTBITE', desc: 'Flat ₹40 OFF above ₹150' },
  ];

  const handleApply = async (codeToApply: string) => {
    setApplying(true);
    await applyCouponCode(codeToApply);
    setApplying(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-tight">
                {language === 'hi' ? 'आपकी थाली' : 'My Food Cart'}
              </h3>
              <p className="text-xs text-gray-500 truncate max-w-[220px]">
                {restaurantName || 'Food and dilvry'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {itemCount > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-gray-400 hover:text-red-600 p-1.5 transition-colors"
                title="Clear Cart"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h4 className="font-bold text-gray-900 text-lg">{t.cartEmpty}</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">{t.cartEmptySub}</p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="mt-6 px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors"
            >
              Explore Restaurants
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {/* Items List */}
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.menuItemId}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-100"
                >
                  <div className="flex-1 pr-3">
                    <p className="text-xs font-bold text-gray-900 leading-snug">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">₹{item.price}</p>
                  </div>

                  <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-xs">
                    <button
                      onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                      className="text-gray-600 hover:text-red-600 p-0.5"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      className="text-gray-600 hover:text-red-600 p-0.5"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-xs font-bold text-gray-900 w-16 text-right">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupons Section */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                <Tag className="w-4 h-4 text-amber-700" />
                <span>{t.applyCoupon}</span>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-300 text-emerald-800 text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold">{appliedCoupon}</span> applied! (Saved ₹{discountAmount})
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-red-600 hover:text-red-700 font-bold text-xs"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE (e.g. UPFOOD50)"
                    className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-gray-200 rounded-xl uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    onClick={() => handleApply(inputCoupon)}
                    disabled={applying || !inputCoupon.trim()}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-red-600 font-medium">{couponError}</p>
              )}

              {/* Popular quick coupon pills */}
              {!appliedCoupon && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {popularCoupons.map((cpn) => (
                    <button
                      key={cpn.code}
                      onClick={() => {
                        setInputCoupon(cpn.code);
                        handleApply(cpn.code);
                      }}
                      className="px-2 py-1 bg-white hover:bg-amber-100/70 border border-amber-200 rounded-lg text-[10px] font-bold text-amber-900 transition-colors flex items-center space-x-1"
                    >
                      <Percent className="w-2.5 h-2.5 text-amber-600" />
                      <span>{cpn.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bill Details */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
              <div className="font-bold text-gray-900 pb-1 border-b border-gray-200 text-xs">
                {t.billDetails}
              </div>

              <div className="flex justify-between text-gray-600">
                <span>{t.itemTotal}</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span className="flex items-center space-x-1">
                  <span>{t.deliveryPartnerFee}</span>
                  {subtotal >= 299 && (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                      FREE above ₹299
                    </span>
                  )}
                </span>
                <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>{t.packagingCharges}</span>
                <span>₹{packagingFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>{t.govtTaxesAndCharges}</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>{t.couponDiscount}</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-black text-gray-900">
                <span>{t.toPay}</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Checkout Button */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-white shrink-0">
            <button
              onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
              }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-between"
            >
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-white/80">Total to pay</div>
                <div className="text-base font-black">₹{totalAmount.toFixed(2)}</div>
              </div>

              <div className="flex items-center space-x-1.5 text-sm font-bold">
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
