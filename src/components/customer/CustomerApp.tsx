import React, { useState, useEffect } from 'react';
import { Restaurant } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../translations';
import {
  Search,
  Star,
  Clock,
  MapPin,
  Sparkles,
  Filter,
  CheckCircle2,
  UtensilsCrossed,
} from 'lucide-react';

interface CustomerAppProps {
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export const CustomerApp: React.FC<CustomerAppProps> = ({ onSelectRestaurant }) => {
  const { selectedCity, language } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [pureVegOnly, setPureVegOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const t = translations[language];

  const cuisines = [
    { label: 'All', icon: '🍽️' },
    { label: 'Biryani', icon: '🍚' },
    { label: 'Mughlai', icon: '🍗' },
    { label: 'Chaat', icon: '🍲' },
    { label: 'Mithai', icon: '🥮' },
    { label: 'North Indian', icon: '🍛' },
    { label: 'Thali', icon: '🍱' },
    { label: 'Burgers', icon: '🍔' },
    { label: 'Beverages', icon: '🥤' },
  ];

  useEffect(() => {
    setLoading(true);
    api.restaurants.list({
      city: selectedCity,
      search: searchQuery || undefined,
      pureVeg: pureVegOnly || undefined,
    })
      .then((data) => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedCity, searchQuery, pureVegOnly]);

  const filteredRestaurants = restaurants.filter((r) => {
    if (selectedCuisine !== 'All' && !r.cuisine.some((c) => c.toLowerCase().includes(selectedCuisine.toLowerCase()))) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner with Authentic UP Gastronomy */}
      <section className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-red-700 via-amber-600 to-orange-600 text-white p-6 sm:p-10">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:24px_24px]"></div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>{selectedCity}, Uttar Pradesh</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {language === 'hi'
              ? 'स्वाद उत्तर प्रदेश का, आपके घर तक'
              : 'Taste of Uttar Pradesh Delivered Hot & Fresh'}
          </h1>

          <p className="text-sm sm:text-base text-amber-100/90 leading-relaxed max-w-xl font-medium">
            Explore legendary Awadhi Dum Biryanis from Lucknow, piping hot Banarasi Tamatar Chaats from Varanasi, pure desi ghee Mithais from Kanpur, and gourmet Mughlai curries from Agra.
          </p>

          {/* Search Bar inside Hero */}
          <div className="pt-2">
            <div className="relative flex items-center bg-white rounded-2xl shadow-lg overflow-hidden p-1.5 focus-within:ring-3 focus-within:ring-amber-300">
              <div className="pl-3.5 text-gray-400">
                <Search className="w-5 h-5 text-red-600" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full px-3 py-2.5 text-sm text-gray-900 bg-transparent focus:outline-none font-medium placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="pr-3 text-xs text-gray-400 hover:text-gray-600 font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cuisine Filter Pills */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">
            Popular Cuisines in {selectedCity}
          </h2>

          <label className="flex items-center space-x-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors shadow-xs">
            <input
              type="checkbox"
              checked={pureVegOnly}
              onChange={(e) => setPureVegOnly(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
              <span>{t.pureVegToggle}</span>
            </span>
          </label>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {cuisines.map((c) => (
            <button
              key={c.label}
              onClick={() => setSelectedCuisine(c.label)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                selectedCuisine === c.label
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20 scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            Top Restaurants in {selectedCity} ({filteredRestaurants.length})
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            All partners verified with FSSAI hygiene standards
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="rounded-3xl bg-gray-100 animate-pulse h-72"></div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="p-12 text-center bg-gray-50 rounded-3xl border border-gray-200">
            <UtensilsCrossed className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">No restaurants match your filters</h3>
            <p className="text-xs text-gray-500 mt-1">Try clearing the cuisine filter or searching another city in UP.</p>
            <button
              onClick={() => {
                setSelectedCuisine('All');
                setSearchQuery('');
                setPureVegOnly(false);
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((rest) => (
              <div
                key={rest.id}
                onClick={() => onSelectRestaurant(rest)}
                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-red-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Image Container */}
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                  <img
                    src={rest.imageUrl}
                    alt={rest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                  {/* Veg / Pure Veg Badge */}
                  {rest.pureVeg && (
                    <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                      Pure Veg
                    </div>
                  )}

                  {/* Rating Tag */}
                  <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-black text-gray-900 shadow-md">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{rest.rating}</span>
                    <span className="text-[10px] text-gray-500 font-medium">({rest.ratingCount})</span>
                  </div>

                  {/* Delivery Time */}
                  <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{rest.deliveryTimeMins} mins</span>
                  </div>
                </div>

                {/* Restaurant Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 group-hover:text-red-600 transition-colors leading-snug">
                      {rest.name}
                    </h3>
                    <p className="text-xs text-amber-800 font-semibold mt-0.5">{rest.locality}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{rest.cuisine.join(' • ')}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-600">
                    <span>Min order ₹{rest.minOrderAmount}</span>
                    <span className="text-red-600 font-bold group-hover:underline flex items-center space-x-1">
                      <span>View Menu</span>
                      <span>&rarr;</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
