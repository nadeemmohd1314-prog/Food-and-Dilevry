import React, { useState, useEffect } from 'react';
import { Restaurant, MenuItem, DietaryTag } from '../../types';
import { useCart } from '../../context/CartContext';
import { translations } from '../../translations';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Star,
  Clock,
  ShieldCheck,
  Plus,
  Minus,
  Sparkles,
  Info,
} from 'lucide-react';

interface RestaurantMenuModalProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RestaurantMenuModal: React.FC<RestaurantMenuModalProps> = ({
  restaurant,
  isOpen,
  onClose,
}) => {
  const { language } = useAuth();
  const { items: cartItems, addItem, updateQuantity } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const t = translations[language];

  useEffect(() => {
    if (restaurant && isOpen) {
      setLoading(true);
      fetch(`/api/menu?restaurantId=${restaurant.id}`)
        .then((res) => res.json())
        .then((data) => {
          setMenuItems(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [restaurant, isOpen]);

  if (!isOpen || !restaurant) return null;

  const categories = ['All', ...Array.from(new Set(menuItems.map((m) => m.category)))];

  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (vegOnly && item.dietary !== 'veg' && item.dietary !== 'vegan') return false;
    return true;
  });

  const getDietaryIcon = (dietary: DietaryTag) => {
    if (dietary === 'veg' || dietary === 'vegan') {
      return (
        <span className="inline-flex items-center justify-center w-4 h-4 border border-emerald-600 rounded-xs p-0.5" title="Pure Veg">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-4 h-4 border border-red-600 rounded-xs p-0.5" title="Non-Veg">
        <span className="w-2 h-2 rounded-full bg-red-600"></span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Banner Image & Close */}
        <div className="relative h-48 sm:h-60 w-full overflow-hidden bg-gray-900 shrink-0">
          <img
            src={restaurant.bannerUrl || restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Restaurant Quick Info over Banner */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center space-x-2 mb-1">
              {restaurant.pureVeg && (
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Pure Veg
                </span>
              )}
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {restaurant.city}, UP
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">{restaurant.name}</h2>
            <p className="text-xs text-gray-200 mt-0.5 line-clamp-1">{restaurant.tagline || restaurant.cuisine.join(' • ')}</p>

            <div className="flex items-center space-x-4 mt-2 text-xs font-medium text-gray-200">
              <span className="flex items-center space-x-1 bg-emerald-700/80 px-2 py-0.5 rounded-lg text-white font-bold">
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>{restaurant.rating}</span>
                <span className="text-[10px] text-white/80">({restaurant.ratingCount})</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{restaurant.deliveryTimeMins} mins</span>
              </span>
              <span className="flex items-center space-x-1 text-white/90">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>FSSAI: {restaurant.fssaiLicense}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3 bg-gray-50/70 overflow-x-auto shrink-0">
          <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 select-none shrink-0 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-gray-200">
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
              <span>Veg Only</span>
            </span>
          </label>
        </div>

        {/* Menu Items List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading authentic menu items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No dishes found matching your current filter.
            </div>
          ) : (
            filteredItems.map((item) => {
              const inCart = cartItems.find((i) => i.menuItemId === item.id);
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 transition-all flex items-start justify-between gap-4 shadow-xs"
                >
                  <div className="flex-1 pr-2">
                    <div className="flex items-center space-x-2 mb-1">
                      {getDietaryIcon(item.dietary)}
                      {item.isBestseller && (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                          <Sparkles className="w-2.5 h-2.5 text-amber-700" />
                          <span>Bestseller</span>
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 text-base leading-snug">
                      {item.name}
                    </h4>
                    {item.hindiName && (
                      <p className="text-xs text-amber-700 font-medium">{item.hindiName}</p>
                    )}
                    <div className="flex items-center space-x-2 mt-1.5">
                      <span className="font-extrabold text-gray-900 text-sm">
                        ₹{item.discountPrice || item.price}
                      </span>
                      {item.discountPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{item.price}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Image & Add/Quantity Button */}
                  <div className="relative w-28 sm:w-32 flex flex-col items-center shrink-0">
                    <div className="w-28 sm:w-32 h-24 rounded-2xl overflow-hidden bg-gray-100 shadow-xs border border-gray-100">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="mt-2 w-full">
                      {!item.isAvailable ? (
                        <div className="text-center py-1 bg-gray-100 text-gray-400 text-xs font-bold rounded-xl">
                          Sold Out
                        </div>
                      ) : inCart ? (
                        <div className="flex items-center justify-between bg-red-600 text-white rounded-xl px-2 py-1 shadow-md">
                          <button
                            onClick={() => updateQuantity(item.id, inCart.quantity - 1)}
                            className="p-1 hover:bg-white/20 rounded-md transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-xs">{inCart.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, inCart.quantity + 1)}
                            className="p-1 hover:bg-white/20 rounded-md transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addItem(item, restaurant.id, restaurant.name)}
                          className="w-full py-1.5 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-500 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1"
                        >
                          <span>{t.addToCart}</span>
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
