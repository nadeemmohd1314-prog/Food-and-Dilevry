import React, { useState, useEffect } from 'react';
import { Restaurant, Order, MenuItem, UPCity } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Package,
  Power,
  Sparkles,
} from 'lucide-react';

export const RestaurantPortal: React.FC = () => {
  const { selectedCity } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestId, setSelectedRestId] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'register'>('orders');
  const [loading, setLoading] = useState(false);

  // New Restaurant Registration Form state
  const [regName, setRegName] = useState('');
  const [regCity, setRegCity] = useState<UPCity>(selectedCity);
  const [regLocality, setRegLocality] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regFssai, setRegFssai] = useState('');
  const [regCuisine, setRegCuisine] = useState('Awadhi, Mughlai, Biryani');
  const [regPureVeg, setRegPureVeg] = useState(false);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Load all restaurants
  useEffect(() => {
    api.restaurants.list({ status: 'all' }).then((data) => {
      setRestaurants(data);
      if (data.length > 0 && !selectedRestId) {
        setSelectedRestId(data[0].id);
      }
    });
  }, []);

  // Load orders & menu for active restaurant
  useEffect(() => {
    if (!selectedRestId) return;
    setLoading(true);

    Promise.all([
      api.orders.list({ restaurantId: selectedRestId }),
      api.menu.list({ restaurantId: selectedRestId }),
    ])
      .then(([ordList, menuList]) => {
        setOrders(ordList);
        setMenuItems(menuList);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedRestId]);

  const activeRest = restaurants.find((r) => r.id === selectedRestId);

  // Order status actions
  const handleUpdateOrderStatus = async (orderId: string, newStatus: any) => {
    try {
      const updated = await api.orders.updateStatus(orderId, { orderStatus: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (e: any) {
      alert(e.message || 'Failed to update order status');
    }
  };

  // Toggle dish stock availability
  const handleToggleDishStock = async (itemId: string, current: boolean) => {
    try {
      const updated = await api.menu.toggleAvailability(itemId, !current);
      setMenuItems((prev) => prev.map((m) => (m.id === itemId ? updated : m)));
    } catch (e: any) {
      alert(e.message || 'Failed to toggle availability');
    }
  };

  // Submit Partner Registration
  const handleRegisterPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegSuccess(null);
    try {
      const newRest = await api.restaurants.create({
        name: regName,
        city: regCity,
        locality: regLocality,
        address: regAddress,
        phone: regPhone,
        fssaiLicense: regFssai || `FSSAI-${Date.now()}`,
        cuisine: regCuisine.split(',').map((s) => s.trim()),
        pureVeg: regPureVeg,
        minOrderAmount: 200,
        commissionRate: 15,
        status: 'pending', // Starts as pending for Admin review
      });
      setRegSuccess(`Registration submitted for "${regName}"! Status is PENDING APPROVAL. The Food and dilvry Admin team will verify your FSSAI license.`);
      setRestaurants((prev) => [newRest, ...prev]);
      setRegName('');
      setRegLocality('');
      setRegAddress('');
      setRegPhone('');
      setRegFssai('');
    } catch (err: any) {
      alert(err.message || 'Failed to register restaurant.');
    }
  };

  const kitchenOrders = orders.filter((o) => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled');
  const completedOrders = orders.filter((o) => o.orderStatus === 'delivered');
  const totalSales = orders.reduce((sum, o) => (o.orderStatus !== 'cancelled' ? sum + o.subtotal : sum), 0);
  const netEarnings = activeRest ? totalSales * (1 - (activeRest.commissionRate || 15) / 100) : totalSales * 0.85;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-200" />
            <span>Kitchen & Partner Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Restaurant Partner Portal</h1>
          <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-xl">
            Live Kitchen Display System (KDS), dish availability toggles, order prep times, and UP sales analytics.
          </p>
        </div>

        {/* Restaurant Selector */}
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-xs font-medium">
            <span className="text-white/70 block">Managing Restaurant:</span>
            <span className="font-bold text-white text-sm">{activeRest?.name || 'Select Restaurant'}</span>
          </div>

          <select
            value={selectedRestId}
            onChange={(e) => setSelectedRestId(e.target.value)}
            className="px-3 py-2 bg-white text-gray-900 rounded-xl text-xs font-bold focus:outline-none shadow-md"
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.city}) - {r.status.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Live Kitchen Orders ({kitchenOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'menu'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Menu & Stock Control ({menuItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('register')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'register'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Register New Restaurant</span>
        </button>
      </div>

      {/* TAB 1: Live Kitchen Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                {kitchenOrders.length}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Orders in Kitchen</p>
                <p className="font-extrabold text-gray-900 text-sm">Active Queue</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                {completedOrders.length}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Completed Orders</p>
                <p className="font-extrabold text-gray-900 text-sm">Delivered Hot</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                ₹
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Payable to Kitchen (Net)</p>
                <p className="font-extrabold text-gray-900 text-sm">₹{netEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Orders list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900">Incoming Kitchen Tickets</h3>
              <span className="text-xs text-gray-500">Auto-syncing every few seconds</span>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400 text-sm">Loading tickets...</div>
            ) : kitchenOrders.length === 0 ? (
              <div className="p-10 text-center bg-gray-50 rounded-2xl border border-gray-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-gray-800 text-sm">All caught up!</h4>
                <p className="text-xs text-gray-500 mt-1">No active kitchen orders waiting right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {kitchenOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <span className="font-mono text-xs font-black text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize bg-amber-100 text-amber-800">
                          {ord.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="pt-2">
                        <p className="text-xs text-gray-500">
                          Customer: <span className="font-bold text-gray-800">{ord.customer.name}</span> ({ord.customer.phone})
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Delivery: <span className="font-medium text-gray-700">{ord.customer.deliveryAddress}</span>
                        </p>
                      </div>

                      <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1.5 text-xs">
                        <div className="font-bold text-gray-800 text-[11px] uppercase tracking-wider">
                          Ticket Items:
                        </div>
                        {ord.items.map((i, idx) => (
                          <div key={idx} className="flex justify-between font-semibold text-gray-900">
                            <span>
                              {i.quantity}x {i.name}
                            </span>
                            <span>₹{i.price * i.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {ord.customer.deliveryNotes && (
                        <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg mt-2 font-medium">
                          Note: "{ord.customer.deliveryNotes}"
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      {ord.orderStatus === 'pending' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'accepted')}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
                        >
                          Accept Ticket
                        </button>
                      )}

                      {(ord.orderStatus === 'accepted' || ord.orderStatus === 'pending') && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'preparing')}
                          className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors"
                        >
                          Start Cooking
                        </button>
                      )}

                      {ord.orderStatus === 'preparing' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'ready_for_pickup')}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
                        >
                          Mark Food Ready
                        </button>
                      )}

                      {ord.orderStatus === 'ready_for_pickup' && (
                        <span className="text-xs text-blue-700 font-bold bg-blue-50 px-3 py-1.5 rounded-xl w-full text-center">
                          Waiting for Rider Pickup ({ord.assignedDriverName || 'Auto Dispatching'})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Menu & Stock Control */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-gray-900">
              Menu Items for {activeRest?.name}
            </h3>
            <span className="text-xs text-gray-500">Toggle "In Stock" to update customer app immediately</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-gray-200 bg-white shadow-xs flex items-center justify-between gap-3"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-xs truncate">{item.name}</h4>
                  <p className="text-[11px] text-gray-500">{item.category}</p>
                  <p className="text-xs font-extrabold text-gray-900 mt-1">₹{item.price}</p>
                </div>

                <button
                  onClick={() => handleToggleDishStock(item.id, item.isAvailable)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    item.isAvailable
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {item.isAvailable ? 'In Stock' : 'Sold Out'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Register New Restaurant */}
      {activeTab === 'register' && (
        <div className="max-w-2xl bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5 text-xs">
          <div>
            <h3 className="font-extrabold text-lg text-gray-900">
              Partner with Food and dilvry in Uttar Pradesh
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">
              Grow your dine-in and delivery reach across Lucknow, Varanasi, Kanpur, Agra, and more.
            </p>
          </div>

          {regSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{regSuccess}</span>
            </div>
          )}

          <form onSubmit={handleRegisterPartner} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Restaurant Name</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Royal Dastarkhwan"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">City in UP</label>
                <select
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value as UPCity)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 font-bold"
                >
                  {['Lucknow', 'Varanasi', 'Kanpur', 'Agra', 'Prayagraj', 'Noida', 'Ghaziabad', 'Bareilly', 'Gorakhpur', 'Aligarh'].map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Locality / Landmark</label>
                <input
                  type="text"
                  required
                  value={regLocality}
                  onChange={(e) => setRegLocality(e.target.value)}
                  placeholder="e.g. Hazratganj / Civil Lines"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 94150 12345"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Full Street Address</label>
              <textarea
                required
                rows={2}
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
                placeholder="Shop number, commercial complex, street name..."
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">FSSAI License Number</label>
                <input
                  type="text"
                  value={regFssai}
                  onChange={(e) => setRegFssai(e.target.value)}
                  placeholder="14-digit FSSAI Number"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Cuisines (Comma separated)</label>
                <input
                  type="text"
                  value={regCuisine}
                  onChange={(e) => setRegCuisine(e.target.value)}
                  placeholder="Awadhi, Mughlai, Biryani"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <label className="flex items-center space-x-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={regPureVeg}
                onChange={(e) => setRegPureVeg(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span className="font-semibold text-gray-800 text-xs">
                Pure Vegetarian Restaurant (100% Satvik / Shuddh Shakahari)
              </span>
            </label>

            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
            >
              Submit Partner Onboarding
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
