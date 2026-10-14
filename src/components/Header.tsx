import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { translations } from '../translations';
import { UPCity, UserRole } from '../types';
import {
  MapPin,
  ShoppingBag,
  User,
  Shield,
  UtensilsCrossed,
  Bike,
  Globe,
  ChevronDown,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onOpenPhoneAuth: () => void;
  onOpenAdminLogin: () => void;
  onOpenOrderHistory: () => void;
  onOpenSupport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPhoneAuth,
  onOpenAdminLogin,
  onOpenOrderHistory,
  onOpenSupport,
}) => {
  const {
    activeRole,
    setActiveRole,
    language,
    setLanguage,
    selectedCity,
    setSelectedCity,
    adminUser,
    isAdminAuthenticated,
    adminLogout,
    customerUser,
    isCustomerAuthenticated,
    customerSignOut,
  } = useAuth();

  const { itemCount, totalAmount, setIsCartOpen } = useCart();
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const t = translations[language];

  const upCities: UPCity[] = [
    'Lucknow',
    'Varanasi',
    'Kanpur',
    'Agra',
    'Prayagraj',
    'Noida',
    'Ghaziabad',
    'Bareilly',
    'Gorakhpur',
    'Aligarh',
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & City Selector */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setActiveRole('customer')}
              className="flex items-center space-x-2.5 text-left group focus:outline-none"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 via-amber-500 to-orange-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-xl tracking-tight bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
                    Food and dilvry
                  </span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    UP
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium hidden sm:block">
                  {language === 'hi' ? 'स्वाद उत्तर प्रदेश का' : 'Taste of Uttar Pradesh'}
                </p>
              </div>
            </button>

            {/* City Selector */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white text-xs font-semibold text-gray-700 transition-all hover:border-gray-300"
              >
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>{selectedCity}, UP</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {cityDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Select UP City
                  </div>
                  {upCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-red-50 hover:text-red-700 transition-colors ${
                        selectedCity === city ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700'
                      }`}
                    >
                      <span>{city}</span>
                      {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Module Navigation Pills */}
          <div className="hidden lg:flex items-center space-x-1 p-1 bg-gray-100/80 rounded-2xl border border-gray-200/60">
            <button
              onClick={() => setActiveRole('customer')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeRole === 'customer'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-red-600" />
              <span>{t.customerPortal}</span>
            </button>

            <button
              onClick={() => setActiveRole('restaurant_partner')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeRole === 'restaurant_partner'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.restaurantPortal}</span>
            </button>

            <button
              onClick={() => setActiveRole('delivery_partner')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeRole === 'delivery_partner'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Bike className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.riderPortal}</span>
            </button>

            <button
              onClick={() => {
                if (isAdminAuthenticated) {
                  setActiveRole('admin');
                } else {
                  onOpenAdminLogin();
                }
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeRole === 'admin'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-gray-700 hover:text-red-600 hover:bg-white/50'
              }`}
            >
              <Shield className={`w-3.5 h-3.5 ${activeRole === 'admin' ? 'text-white' : 'text-red-600'}`} />
              <span>{t.adminDashboard}</span>
              {isAdminAuthenticated && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>
          </div>

          {/* Right Action Icons: Language, Cart, Profile */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              title="Switch Language / भाषा बदलें"
            >
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Cart Button (for Customer view) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white rounded-xl font-semibold text-xs shadow-md hover:shadow-lg transition-all duration-200"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">
                {itemCount > 0 ? `₹${totalAmount}` : t.viewCart}
              </span>
              {itemCount > 0 && (
                <span className="bg-white text-red-600 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Customer User Account */}
            {isCustomerAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-gray-50 text-xs font-medium text-gray-800 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                    {customerUser?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[80px] truncate hidden sm:inline">
                    {customerUser?.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-xs text-gray-900">{customerUser?.name}</p>
                      <p className="text-[11px] text-gray-500">{customerUser?.phoneNumber}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenOrderHistory();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {t.orderHistory}
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenSupport();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {t.support}
                    </button>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          customerSignOut();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenPhoneAuth}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                <User className="w-3.5 h-3.5 text-gray-500" />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}

            {/* Mobile Module Menu Toggle */}
            <div className="lg:hidden relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                  <button
                    onClick={() => {
                      setActiveRole('customer');
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center space-x-2"
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5 text-red-600" />
                    <span>Customer App</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveRole('restaurant_partner');
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-amber-50 hover:text-amber-600 flex items-center space-x-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Restaurant Partner</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveRole('delivery_partner');
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2"
                  >
                    <Bike className="w-3.5 h-3.5 text-blue-600" />
                    <span>Delivery Partner</span>
                  </button>
                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      if (isAdminAuthenticated) {
                        setActiveRole('admin');
                      } else {
                        onOpenAdminLogin();
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center space-x-2 border-t border-gray-100"
                  >
                    <Shield className="w-3.5 h-3.5 text-red-600" />
                    <span>Admin Dashboard</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
