import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/Header';
import { CustomerApp } from './components/customer/CustomerApp';
import { RestaurantMenuModal } from './components/customer/RestaurantMenuModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { OrderTrackingModal } from './components/customer/OrderTrackingModal';
import { OrderHistoryModal } from './components/customer/OrderHistoryModal';
import { CustomerSupportModal } from './components/customer/CustomerSupportModal';
import { PhoneAuthModal } from './components/PhoneAuthModal';
import { RestaurantPortal } from './components/restaurant/RestaurantPortal';
import { RiderApp } from './components/rider/RiderApp';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { Restaurant, Order } from './types';
import { Shield, Lock } from 'lucide-react';

const MainApp: React.FC = () => {
  const { activeRole, setActiveRole, isAdminAuthenticated } = useAuth();
  const { setIsCartOpen } = useCart();

  // Modals state
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPhoneAuthOpen, setIsPhoneAuthOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportOrderId, setSupportOrderId] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col selection:bg-red-500 selection:text-white">
      {/* Universal Header with Navigation, City Selector, and Role Portal Switcher */}
      <Header
        onOpenPhoneAuth={() => setIsPhoneAuthOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenOrderHistory={() => setIsOrderHistoryOpen(true)}
        onOpenSupport={() => {
          setSupportOrderId('');
          setIsSupportOpen(true);
        }}
      />

      {/* Main Module Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* CUSTOMER PORTAL */}
        {activeRole === 'customer' && (
          <CustomerApp
            onSelectRestaurant={(rest) => setSelectedRestaurant(rest)}
          />
        )}

        {/* RESTAURANT PARTNER PORTAL */}
        {activeRole === 'restaurant_partner' && <RestaurantPortal />}

        {/* DELIVERY PARTNER (RIDER) PORTAL */}
        {activeRole === 'delivery_partner' && <RiderApp />}

        {/* ADMIN CONTROL CENTER */}
        {activeRole === 'admin' && (
          isAdminAuthenticated ? (
            <AdminDashboard />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-gray-200 text-center max-w-md mx-auto shadow-sm my-12 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="font-black text-xl text-gray-900">Admin Authentication Required</h3>
              <p className="text-xs text-gray-500">
                The Food and dilvry Admin Control Center is protected by server-side authorization. Please sign in with your Super Admin account (<span className="font-mono font-bold text-gray-800">nadeemmohd1314@gmail.com</span>) to proceed.
              </p>
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
              >
                Sign In to Admin Portal
              </button>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-xs text-gray-500 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium">
            &copy; {new Date().getFullYear()} Food and dilvry • Uttar Pradesh, India. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-[11px] font-semibold text-gray-600">
            <span>Lucknow • Varanasi • Kanpur • Agra • Prayagraj • Noida</span>
            <button
              onClick={() => {
                if (isAdminAuthenticated) {
                  setActiveRole('admin');
                } else {
                  setIsAdminLoginOpen(true);
                }
              }}
              className="text-red-600 hover:underline font-bold"
            >
              Admin Login
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Modals */}
      <RestaurantMenuModal
        restaurant={selectedRestaurant}
        isOpen={Boolean(selectedRestaurant)}
        onClose={() => setSelectedRestaurant(null)}
      />

      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={(order) => {
          setActiveTrackingOrder(order);
        }}
        onOpenPhoneAuth={() => setIsPhoneAuthOpen(true)}
      />

      <OrderTrackingModal
        order={activeTrackingOrder}
        isOpen={Boolean(activeTrackingOrder)}
        onClose={() => setActiveTrackingOrder(null)}
        onOpenSupport={(ordId) => {
          setSupportOrderId(ordId);
          setIsSupportOpen(true);
        }}
      />

      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        onSelectOrder={(ord) => setActiveTrackingOrder(ord)}
      />

      <CustomerSupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        defaultOrderId={supportOrderId}
      />

      <PhoneAuthModal
        isOpen={isPhoneAuthOpen}
        onClose={() => setIsPhoneAuthOpen(false)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
