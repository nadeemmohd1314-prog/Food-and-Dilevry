import React, { useState, useEffect } from 'react';
import {
  Restaurant,
  MenuItem,
  Order,
  DeliveryPartner,
  Coupon,
  RefundRequest,
  PlatformSettings,
  AdminUser,
  UPCity,
} from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  ShoppingBag,
  Bike,
  Tag,
  DollarSign,
  RotateCcw,
  Settings,
  Users,
  LogOut,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Printer,
  Edit2,
  Trash2,
  ShieldCheck,
  Star,
  MapPin,
  TrendingUp,
  CreditCard,
  Banknote,
  QrCode,
  Upload,
  RefreshCw,
  Eye,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { adminUser, adminLogout, setActiveRole } = useAuth();

  // Navigation
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'restaurants'
    | 'menu'
    | 'orders'
    | 'drivers'
    | 'coupons'
    | 'finance'
    | 'refunds'
    | 'settings'
    | 'team'
  >('overview');

  // Data states
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<DeliveryPartner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [adminList, setAdminList] = useState<AdminUser[]>([]);
  const [financeStats, setFinanceStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Search and filter states
  const [restaurantFilter, setRestaurantFilter] = useState<'all' | 'approved' | 'pending' | 'suspended'>('all');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('All');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('All');
  const [menuDietaryFilter, setMenuDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [driverSearchQuery, setDriverSearchQuery] = useState('');
  const [driverCityFilter, setDriverCityFilter] = useState<string>('All');

  // Modals
  const [showAddRestModal, setShowAddRestModal] = useState(false);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  // Load core data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [restRes, menuRes, ordRes, driverRes, cpnRes, refRes, setRes] = await Promise.all([
        api.restaurants.list({ status: 'all' }),
        api.menu.list(),
        api.orders.list({ status: 'all' }),
        api.drivers.list(),
        api.coupons.list(),
        api.refunds.list(),
        api.settings.get(),
      ]);

      setRestaurants(restRes);
      setMenuItems(menuRes);
      setOrders(ordRes);
      setDrivers(driverRes);
      setCoupons(cpnRes);
      setRefunds(refRes);
      setSettings(setRes);

      api.finance.getStats().then(setFinanceStats).catch(() => {});
      if (adminUser?.role === 'super_admin') {
        api.auth.listAdmins().then(setAdminList).catch(() => {});
      }
    } catch (e) {
      console.error('Error loading admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [adminUser]);

  // -------------------------------------------------------------
  // RESTAURANT ACTIONS
  // -------------------------------------------------------------
  const handleRestaurantStatus = async (id: string, status: 'approved' | 'pending' | 'suspended') => {
    try {
      const updated = await api.restaurants.updateStatus(id, status);
      setRestaurants((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleDeleteRestaurant = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this restaurant and all associated dishes?')) return;
    try {
      await api.restaurants.delete(id);
      setRestaurants((prev) => prev.filter((r) => r.id !== id));
      setMenuItems((prev) => prev.filter((m) => m.restaurantId !== id));
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  // -------------------------------------------------------------
  // MENU ACTIONS
  // -------------------------------------------------------------
  const handleToggleStock = async (id: string, current: boolean) => {
    try {
      const updated = await api.menu.toggleAvailability(id, !current);
      setMenuItems((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!window.confirm('Delete this food item?')) return;
    try {
      await api.menu.delete(id);
      setMenuItems((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  // -------------------------------------------------------------
  // ORDER ACTIONS & DISPATCH
  // -------------------------------------------------------------
  const handleOrderStatus = async (orderId: string, orderStatus: any) => {
    try {
      const updated = await api.orders.updateStatus(orderId, { orderStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    try {
      const updated = await api.orders.assignDriver(orderId, driverId || undefined);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      api.drivers.list().then(setDrivers);
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  // -------------------------------------------------------------
  // DRIVER ACTIONS
  // -------------------------------------------------------------
  const handleDriverStatus = async (driverId: string, status: 'approved' | 'pending' | 'suspended') => {
    try {
      const updated = await api.drivers.updateStatus(driverId, { status });
      setDrivers((prev) => prev.map((d) => (d.id === driverId ? updated : d)));
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  // -------------------------------------------------------------
  // COUPON ACTIONS
  // -------------------------------------------------------------
  const handleToggleCoupon = async (id: string) => {
    try {
      const updated = await api.coupons.toggle(id);
      setCoupons((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm('Delete this promo code?')) return;
    try {
      await api.coupons.delete(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  // -------------------------------------------------------------
  // REFUND ACTIONS
  // -------------------------------------------------------------
  const handleRefundAction = async (id: string, action: 'approve' | 'reject') => {
    const adminNotes = window.prompt(
      action === 'approve'
        ? 'Enter approval / UPI transaction notes:'
        : 'Enter reason for rejecting this refund request:'
    );
    if (adminNotes === null) return;

    try {
      const updated = await api.refunds.action(id, action, adminNotes);
      setRefunds((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  // -------------------------------------------------------------
  // SETTLE PAYOUT
  // -------------------------------------------------------------
  const handleSettlePayout = async (earn: any) => {
    if (!window.confirm(`Settle payout of ₹${earn.payableToRestaurant} to ${earn.restaurantName}?`)) return;
    try {
      await api.finance.settlePayout({
        restaurantId: earn.restaurantId,
        grossSales: earn.grossSales,
        commissionDeducted: earn.commissionDeducted,
        netPayoutAmount: earn.payableToRestaurant,
      });
      alert(`Payout of ₹${earn.payableToRestaurant} processed successfully with UTR reference!`);
      api.finance.getStats().then(setFinanceStats);
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  // -------------------------------------------------------------
  // SAVE SETTINGS
  // -------------------------------------------------------------
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const updated = await api.settings.update(settings);
      setSettings(updated);
      alert('Platform & payment settings updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  // Calculations
  const pendingOrdersCount = orders.filter((o) => ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(o.orderStatus)).length;
  const completedOrdersCount = orders.filter((o) => o.orderStatus === 'delivered').length;
  const totalSales = orders.reduce((sum, o) => (o.orderStatus !== 'cancelled' ? sum + o.totalAmount : sum), 0);
  const totalCommission = orders.reduce((sum, o) => (o.orderStatus !== 'cancelled' ? sum + o.restaurantCommissionAmount : sum), 0);
  const totalNetEarnings = orders.reduce((sum, o) => (o.orderStatus !== 'cancelled' ? sum + o.platformNetEarnings : sum), 0);
  const codVolume = orders.filter((o) => o.paymentMethod === 'cod' && o.orderStatus !== 'cancelled').reduce((sum, o) => sum + o.totalAmount, 0);
  const upiVolume = orders.filter((o) => o.paymentMethod !== 'cod' && o.orderStatus !== 'cancelled').reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingRestaurants = restaurants.filter((r) => r.status === 'pending');
  const pendingRefunds = refunds.filter((r) => r.status === 'pending');

  return (
    <div className="flex flex-col lg:flex-row min-h-[85vh] bg-gray-50/60 rounded-3xl border border-gray-200 overflow-hidden text-xs shadow-xl">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 p-4 sm:p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Logo & Super Admin Profile */}
          <div className="pb-4 border-b border-slate-800 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shadow-md">
                FD
              </div>
              <div>
                <h2 className="font-extrabold text-white text-sm tracking-tight">Food and dilvry</h2>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Admin Control Center
                </span>
              </div>
            </div>

            {/* Authenticated Admin Badge */}
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-white font-bold text-xs truncate">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">{adminUser?.email}</span>
              </div>
              <span className="inline-block bg-red-600/30 text-red-400 border border-red-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                {adminUser?.role.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center space-x-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview & Analytics</span>
              </span>
              {pendingOrdersCount > 0 && (
                <span className="bg-amber-400 text-slate-900 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('restaurants')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'restaurants'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center space-x-2.5">
                <UtensilsCrossed className="w-4 h-4" />
                <span>Restaurants ({restaurants.length})</span>
              </span>
              {pendingRestaurants.length > 0 && (
                <span className="bg-amber-500 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                  {pendingRestaurants.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'menu'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>सामान व डिश (Food Items) ({menuItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center space-x-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>ऑर्डर व डिलीवरी (Orders)</span>
              </span>
              <span className="bg-slate-800 text-slate-300 font-mono text-[10px] px-1.5 py-0.2 rounded">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('drivers')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'drivers'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>डिलीवरी पार्टनर (Fleet) ({drivers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'coupons'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Promo Coupons ({coupons.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('finance')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'finance'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Finance & Payouts</span>
            </button>

            <button
              onClick={() => setActiveTab('refunds')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'refunds'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center space-x-2.5">
                <RotateCcw className="w-4 h-4" />
                <span>Customer Refunds</span>
              </span>
              {pendingRefunds.length > 0 && (
                <span className="bg-red-500 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                  {pendingRefunds.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Payment & Rules Settings</span>
            </button>

            {adminUser?.role === 'super_admin' && (
              <button
                onClick={() => setActiveTab('team')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'team'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Admin Team</span>
              </button>
            )}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setActiveRole('customer')}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] flex items-center justify-center space-x-2 transition-colors"
          >
            <span>&larr; Switch to Customer App</span>
          </button>

          <button
            onClick={adminLogout}
            className="w-full py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-300 font-bold text-[11px] flex items-center justify-center space-x-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 p-5 sm:p-7 overflow-y-auto max-h-[85vh] space-y-6">
        {/* VIEW 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Executive Dashboard</h2>
                <p className="text-xs text-gray-500">Live Uttar Pradesh Food Delivery KPI Metrics</p>
              </div>

              <button
                onClick={loadAllData}
                className="px-3 py-1.5 rounded-xl border border-gray-300 hover:bg-gray-100 font-bold text-gray-700 text-xs flex items-center space-x-1.5 self-start"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Data</span>
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Gross Platform GMV</span>
                <p className="text-2xl font-black text-gray-900">₹{totalSales.toLocaleString()}</p>
                <p className="text-[10px] text-emerald-600 font-bold">Total revenue across all UP cities</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Commission Earned</span>
                <p className="text-2xl font-black text-amber-600">₹{totalCommission.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500 font-medium">Avg ~15% restaurant commission rate</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Platform Net Earnings</span>
                <p className="text-2xl font-black text-emerald-600">₹{totalNetEarnings.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500 font-medium">Net after driver payouts & taxes</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Total Orders</span>
                <p className="text-2xl font-black text-gray-900">{orders.length}</p>
                <p className="text-[10px] text-blue-600 font-bold">{pendingOrdersCount} currently in dispatch</p>
              </div>
            </div>

            {/* COD vs Online UPI Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center space-x-2">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Payment Method Distribution</span>
                </h3>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between font-bold text-xs mb-1">
                      <span>Cash on Delivery (COD)</span>
                      <span>₹{codVolume.toLocaleString()} ({totalSales > 0 ? ((codVolume / totalSales) * 100).toFixed(1) : 0}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2.5 rounded-full"
                        style={{ width: `${totalSales > 0 ? (codVolume / totalSales) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-xs mb-1">
                      <span>UPI & Online Gateways</span>
                      <span>₹{upiVolume.toLocaleString()} ({totalSales > 0 ? ((upiVolume / totalSales) * 100).toFixed(1) : 0}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-red-500 h-2.5 rounded-full"
                        style={{ width: `${totalSales > 0 ? (upiVolume / totalSales) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action alerts */}
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                <h3 className="font-extrabold text-sm text-amber-950 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Pending Administrator Approvals</span>
                </h3>

                <div className="space-y-1.5 text-xs text-amber-900">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/80 border border-amber-200/80">
                    <span>Restaurants Awaiting FSSAI Verification:</span>
                    <span className="font-bold bg-amber-200 px-2 py-0.5 rounded-full text-amber-950">
                      {pendingRestaurants.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/80 border border-amber-200/80">
                    <span>Pending Customer Refund Requests:</span>
                    <span className="font-bold bg-red-200 px-2 py-0.5 rounded-full text-red-950">
                      {pendingRefunds.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/80 border border-amber-200/80">
                    <span>Active Food Delivery Riders:</span>
                    <span className="font-bold bg-emerald-200 px-2 py-0.5 rounded-full text-emerald-950">
                      {drivers.filter((d) => d.status === 'approved').length} Riders
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-gray-900">Recent Customer Orders</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-red-600 font-bold hover:underline"
                >
                  View All Orders &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px]">
                      <th className="py-2">Order #</th>
                      <th>Restaurant</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-gray-50">
                        <td className="py-2.5 font-mono font-bold">{ord.orderNumber}</td>
                        <td className="font-semibold text-gray-800">{ord.restaurantName}</td>
                        <td>{ord.customer.name}</td>
                        <td className="font-black text-gray-900">₹{ord.totalAmount}</td>
                        <td className="uppercase text-[10px] font-bold text-gray-600">{ord.paymentMethod}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            ord.orderStatus === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.orderStatus.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Restaurants Management */}
        {activeTab === 'restaurants' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Restaurant Partners</h2>
                <p className="text-xs text-gray-500">Approve, suspend, manage commission rates and listings</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddRestModal(true)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Restaurant</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-2xl border border-gray-200">
              <span className="font-bold text-gray-500 text-xs">Filter:</span>
              {(['all', 'approved', 'pending', 'suspended'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setRestaurantFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                    restaurantFilter === st
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Restaurant Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restaurants
                .filter((r) => (restaurantFilter === 'all' ? true : r.status === restaurantFilter))
                .map((rest) => (
                  <div
                    key={rest.id}
                    className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-black text-gray-900 text-base">{rest.name}</h3>
                            {rest.pureVeg && (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                Pure Veg
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-amber-800 font-semibold">{rest.city}, UP ({rest.locality})</p>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          rest.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rest.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {rest.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{rest.description}</p>

                      <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 bg-gray-50 rounded-xl text-xs font-medium text-gray-600">
                        <div>FSSAI: <span className="font-mono font-bold text-gray-900">{rest.fssaiLicense}</span></div>
                        <div>Commission: <span className="font-bold text-red-600">{rest.commissionRate}%</span></div>
                        <div>Min Order: <span className="font-bold text-gray-900">₹{rest.minOrderAmount}</span></div>
                        <div>Phone: <span className="font-bold text-gray-900">{rest.phone}</span></div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      {rest.status === 'pending' && (
                        <button
                          onClick={() => handleRestaurantStatus(rest.id, 'approved')}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs"
                        >
                          Approve Partner
                        </button>
                      )}

                      {rest.status === 'approved' && (
                        <button
                          onClick={() => handleRestaurantStatus(rest.id, 'suspended')}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl text-xs border border-amber-200"
                        >
                          Suspend
                        </button>
                      )}

                      {rest.status === 'suspended' && (
                        <button
                          onClick={() => handleRestaurantStatus(rest.id, 'approved')}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs border border-emerald-200"
                        >
                          Reactivate
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteRestaurant(rest.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Restaurant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* VIEW 3: Food & Menu Management */}
        {activeTab === 'menu' && (() => {
          const filteredMenuItems = menuItems.filter((item) => {
            const matchesSearch =
              !menuSearchQuery ||
              item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
              (item.hindiName && item.hindiName.includes(menuSearchQuery)) ||
              (item.category && item.category.toLowerCase().includes(menuSearchQuery.toLowerCase())) ||
              (item.restaurantName && item.restaurantName.toLowerCase().includes(menuSearchQuery.toLowerCase()));

            const matchesCategory =
              menuCategoryFilter === 'All' || item.category === menuCategoryFilter;

            const matchesDietary =
              menuDietaryFilter === 'all' || item.dietary === menuDietaryFilter;

            return matchesSearch && matchesCategory && matchesDietary;
          });

          return (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-red-50 to-amber-50 p-4 rounded-2xl border border-red-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">सामान व डिश लिस्ट (Food Items & Menu)</h2>
                    <span className="bg-red-600 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                      {filteredMenuItems.length} आइटम्स
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5 font-medium">
                    यहाँ से आप नया सामान जोड़ सकते हैं (Add), किसी भी सामान का उपाय/संशोधन कर सकते हैं (Edit), कीमतें बदल सकते हैं और स्टॉक ऑन/ऑफ कर सकते हैं।
                  </p>
                </div>

                <button
                  onClick={() => setShowAddMenuModal(true)}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md transition-all shrink-0 self-start sm:self-center"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ नया सामान जोड़ें (Add Food Item)</span>
                </button>
              </div>

              {/* Filters and Search Bar */}
              <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
                {/* Search */}
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={menuSearchQuery}
                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                    placeholder="सामान या डिश का नाम खोजें (Search dish, category, restaurant)..."
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                  {menuSearchQuery && (
                    <button
                      onClick={() => setMenuSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-gray-600">कैटेगरी:</span>
                  <select
                    value={menuCategoryFilter}
                    onChange={(e) => setMenuCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none"
                  >
                    <option value="All">All Categories (सभी)</option>
                    {['Biryani', 'Mughlai', 'Chaat', 'Mithai', 'North Indian', 'Thali', 'Burgers', 'Beverages', 'Desserts'].map(
                      (cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Veg / Non-Veg Filter */}
                <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setMenuDietaryFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      menuDietaryFilter === 'all'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setMenuDietaryFilter('veg')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      menuDietaryFilter === 'veg'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    Veg 🟢
                  </button>
                  <button
                    onClick={() => setMenuDietaryFilter('non-veg')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      menuDietaryFilter === 'non-veg'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-red-700 hover:bg-red-50'
                    }`}
                  >
                    Non-Veg 🔴
                  </button>
                </div>
              </div>

              {/* Grid of Dishes */}
              {filteredMenuItems.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 space-y-2">
                  <Package className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="font-bold text-gray-700 text-sm">कोई सामान नहीं मिला (No dishes found)</p>
                  <p className="text-xs text-gray-500">ऊपर '+ नया सामान जोड़ें' बटन दबाकर नया सामान जोड़ें।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMenuItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-2.5">
                        <div className="h-36 rounded-xl overflow-hidden bg-gray-100 relative group">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                          />
                          <div className="absolute top-2 left-2 flex items-center space-x-1">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase shadow-xs ${
                                item.dietary === 'veg'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-red-600 text-white'
                              }`}
                            >
                              {item.dietary === 'veg' ? 'Veg' : 'Non-Veg'}
                            </span>
                            <span className="bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              {item.category}
                            </span>
                          </div>

                          <span
                            className={`absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-xs ${
                              item.isAvailable
                                ? 'bg-emerald-500/90 text-white'
                                : 'bg-red-600/90 text-white'
                            }`}
                          >
                            {item.isAvailable ? 'स्टॉक में है' : 'स्टॉक खत्म'}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-gray-900 text-sm leading-snug">{item.name}</h4>
                          {item.hindiName && (
                            <p className="text-xs text-amber-700 font-semibold">{item.hindiName}</p>
                          )}
                          <p className="text-[11px] text-gray-500 mt-0.5 font-medium flex items-center space-x-1">
                            <span>{item.restaurantName || 'Restaurant Dish'}</span>
                          </p>
                          {item.description && (
                            <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 pt-1 border-t border-gray-100">
                          <span className="font-black text-gray-900 text-base">₹{item.price}</span>
                          {item.discountPrice && (
                            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                              ऑफ़र: ₹{item.discountPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stock Toggle & Action Buttons (सामान का उपाय करें / हटाएं) */}
                      <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleStock(item.id, item.isAvailable)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1 ${
                            item.isAvailable
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                              : 'bg-red-100 hover:bg-red-200 text-red-800'
                          }`}
                          title="Click to toggle availability"
                        >
                          <span className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                          <span>{item.isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                        </button>

                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => setEditingMenuItem(item)}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-xl font-bold text-xs flex items-center space-x-1 transition-colors"
                            title="सामान का उपाय करें (बदलें / एडिट करें)"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                            <span>उपाय करें (Edit)</span>
                          </button>

                          <button
                            onClick={() => handleDeleteMenu(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="सामान हटाएं (Delete)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* VIEW 4: Live Orders Dispatch */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Orders & Dispatch</h2>
                <p className="text-xs text-gray-500">Live order status, driver dispatch, and invoice printing</p>
              </div>
            </div>

            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        {ord.orderNumber}
                      </span>
                      <span className="font-extrabold text-gray-800 text-sm">{ord.restaurantName}</span>
                      <span className="text-xs text-gray-400">({ord.city})</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        OTP: {ord.deliveryOtp}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* Customer */}
                    <div className="space-y-0.5">
                      <p className="font-bold text-gray-900">{ord.customer.name}</p>
                      <p className="text-gray-600">{ord.customer.phone}</p>
                      <p className="text-gray-500 line-clamp-1">{ord.customer.deliveryAddress}</p>
                    </div>

                    {/* Items */}
                    <div className="space-y-0.5">
                      <p className="font-bold text-gray-700">Order Items:</p>
                      <p className="text-gray-600 line-clamp-2">
                        {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>
                    </div>

                    {/* Financials */}
                    <div className="space-y-0.5 md:text-right">
                      <p className="font-black text-gray-900 text-sm">Total: ₹{ord.totalAmount}</p>
                      <p className="text-gray-500 uppercase font-semibold text-[10px]">
                        Payment: {ord.paymentMethod} ({ord.paymentStatus})
                      </p>
                    </div>
                  </div>

                  {/* Driver Assignment & Status Controls */}
                  <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-600 text-xs">Assign Delivery Rider:</span>
                      <select
                        value={ord.assignedDriverId || ''}
                        onChange={(e) => handleAssignDriver(ord.id, e.target.value)}
                        className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                      >
                        <option value="">-- Auto / Unassigned --</option>
                        {drivers
                          .filter((d) => d.status === 'approved')
                          .map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.city} - {d.vehicleNumber})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setSelectedOrderForInvoice(ord)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-xs flex items-center space-x-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Receipt / Tax Invoice</span>
                      </button>

                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleOrderStatus(ord.id, e.target.value)}
                        className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 rounded-lg font-bold text-xs focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready_for_pickup">Ready for Pickup</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: Delivery Partners */}
        {activeTab === 'drivers' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Delivery Fleet Partners</h2>
                <p className="text-xs text-gray-500">Approve riders, inspect driving license KYC, view availability</p>
              </div>

              <button
                onClick={() => setShowAddDriverModal(true)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md self-start"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Delivery Rider / नया राइडर जोड़ें</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drivers.map((drv) => (
                <div
                  key={drv.id}
                  className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-gray-900 text-base">{drv.name}</h4>
                      <p className="text-xs text-blue-700 font-bold">{drv.city}, UP</p>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      drv.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {drv.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-gray-50 rounded-xl text-xs font-medium text-gray-600">
                    <div>Vehicle: <span className="font-bold text-gray-900 capitalize">{drv.vehicleType}</span></div>
                    <div>Reg No: <span className="font-bold text-gray-900 font-mono">{drv.vehicleNumber}</span></div>
                    <div>License: <span className="font-mono text-gray-900">{drv.drivingLicense}</span></div>
                    <div>Phone: <span className="font-bold text-gray-900">{drv.phone}</span></div>
                    <div>Deliveries: <span className="font-bold text-gray-900">{drv.completedDeliveries}</span></div>
                    <div>Rating: <span className="font-bold text-amber-500">★ {drv.rating}</span></div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      drv.availability === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      Status: {drv.availability.toUpperCase()}
                    </span>

                    {drv.status === 'pending' ? (
                      <button
                        onClick={() => handleDriverStatus(drv.id, 'approved')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs"
                      >
                        Approve Rider
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDriverStatus(drv.id, drv.status === 'approved' ? 'suspended' : 'approved')}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs"
                      >
                        {drv.status === 'approved' ? 'Suspend' : 'Reactivate'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 6: Coupons */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Coupons & Promotions</h2>
                <p className="text-xs text-gray-500">Discount codes, minimum spend thresholds, and limits</p>
              </div>

              <button
                onClick={() => setShowAddCouponModal(true)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupons.map((cpn) => (
                <div
                  key={cpn.id}
                  className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-xl">
                      {cpn.code}
                    </span>
                    <button
                      onClick={() => handleToggleCoupon(cpn.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        cpn.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {cpn.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <p className="text-xs text-gray-700 font-medium">{cpn.description}</p>

                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-gray-50 rounded-xl text-xs font-semibold text-gray-600">
                    <div>Discount: <span className="font-bold text-gray-900">{cpn.discountType === 'percentage' ? `${cpn.discountValue}%` : `₹${cpn.discountValue}`}</span></div>
                    <div>Min Order: <span className="font-bold text-gray-900">₹{cpn.minOrderValue}</span></div>
                    <div>Redeemed: <span className="font-bold text-gray-900">{cpn.usedCount} times</span></div>
                    <div>Expires: <span className="font-bold text-gray-900">{cpn.expiryDate}</span></div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleDeleteCoupon(cpn.id)}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 7: Finance & Payouts */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Finance & Commission Ledger</h2>
              <p className="text-xs text-gray-500">Automated restaurant commission deduction and bank payout reconciliation</p>
            </div>

            {/* Restaurant Payouts Ledger Table */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-gray-900">Payable to Restaurants</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px]">
                      <th className="py-2">Restaurant</th>
                      <th>City</th>
                      <th>Orders</th>
                      <th>Gross Sales</th>
                      <th>Commission Deducted</th>
                      <th>Payable Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {financeStats?.restaurantEarnings?.map((earn: any) => (
                      <tr key={earn.restaurantId} className="hover:bg-gray-50">
                        <td className="py-3 font-bold text-gray-900">{earn.restaurantName}</td>
                        <td className="text-gray-500">{earn.city}</td>
                        <td className="font-semibold">{earn.orderCount}</td>
                        <td className="font-semibold">₹{earn.grossSales}</td>
                        <td className="text-amber-600 font-bold">₹{earn.commissionDeducted} ({earn.commissionRate}%)</td>
                        <td className="font-black text-emerald-600">₹{earn.payableToRestaurant}</td>
                        <td>
                          <button
                            onClick={() => handleSettlePayout(earn)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-xs"
                          >
                            Settle Payout
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payout History */}
            {financeStats?.payoutHistory?.length > 0 && (
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
                <h3 className="font-extrabold text-sm text-gray-900">Settled Bank Payout Records (NEFT/RTGS)</h3>
                <div className="space-y-2">
                  {financeStats.payoutHistory.map((p: any) => (
                    <div
                      key={p.id}
                      className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-gray-900">{p.restaurantName}</span>
                        <p className="text-[11px] font-mono text-gray-500">Ref: {p.utrNumber || p.transactionRef}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-emerald-600">₹{p.netPayoutAmount}</span>
                        <p className="text-[10px] text-gray-400">Processed {new Date(p.processedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 8: Refunds Management */}
        {activeTab === 'refunds' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Customer Refund Requests</h2>
              <p className="text-xs text-gray-500">Review claims, issue UPI reversals, and verify dispute evidence</p>
            </div>

            <div className="space-y-3">
              {refunds.map((ref) => (
                <div
                  key={ref.id}
                  className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
                        {ref.orderNumber}
                      </span>
                      <span className="ml-2 font-bold text-gray-800">{ref.customerName}</span>
                      <span className="text-xs text-gray-400 ml-1">({ref.customerPhone})</span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      ref.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ref.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ref.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="font-bold text-gray-900">Reason: </span>
                    {ref.reason}
                  </p>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-red-600 text-sm">Claim: ₹{ref.amount}</span>

                    {ref.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRefundAction(ref.id, 'reject')}
                          className="px-3 py-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 font-bold"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleRefundAction(ref.id, 'approve')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                        >
                          Approve UPI Reversal
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-[11px] italic">
                        {ref.adminNotes || 'Audit review complete'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 9: Payment & Platform Settings */}
        {activeTab === 'settings' && settings && (
          <div className="max-w-2xl bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Payment & Platform Controls</h2>
              <p className="text-xs text-gray-500">Configure Cash on Delivery, Payment Gateways, Taxes and Limits</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              {/* Cash on Delivery Configuration */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-sm">Cash on Delivery (COD)</h4>
                    <p className="text-gray-500 text-[11px]">Enable doorstep cash collections across UP</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableCashOnDelivery}
                    onChange={(e) => setSettings({ ...settings, enableCashOnDelivery: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Maximum COD Order Limit in ₹ (Safety Threshold)
                  </label>
                  <input
                    type="number"
                    value={settings.maxCodOrderValue}
                    onChange={(e) => setSettings({ ...settings, maxCodOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Orders exceeding this limit will mandate UPI / Online payment to prevent fraud.
                  </p>
                </div>
              </div>

              {/* Online Payment Gateway Settings */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-sm">Online Payments & UPI Gateway</h4>
                    <p className="text-gray-500 text-[11px]">Secure server integration (Secrets never exposed in client)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableOnlinePayments}
                    onChange={(e) => setSettings({ ...settings, enableOnlinePayments: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Active Gateway Provider</label>
                    <select
                      value={settings.activeGateway}
                      onChange={(e) => setSettings({ ...settings, activeGateway: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold"
                    >
                      <option value="razorpay">Razorpay UPI & Cards</option>
                      <option value="phonepe">PhonePe Payment Gateway</option>
                      <option value="paytm">Paytm UPI All-in-One</option>
                      <option value="stripe">Stripe Payments</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Gateway Environment</label>
                    <select
                      value={settings.onlineGatewayMode}
                      onChange={(e) => setSettings({ ...settings, onlineGatewayMode: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold"
                    >
                      <option value="sandbox">Sandbox / Test Mode</option>
                      <option value="production">Production Live Mode</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* GST & Delivery Charges */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <h4 className="font-extrabold text-gray-900 text-sm">Taxes, Packaging & Delivery Charges</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">GST Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.taxRatePercent}
                      onChange={(e) => setSettings({ ...settings, taxRatePercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Base Delivery Fee (₹)</label>
                    <input
                      type="number"
                      value={settings.baseDeliveryFee}
                      onChange={(e) => setSettings({ ...settings, baseDeliveryFee: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Free Delivery Threshold (₹)</label>
                    <input
                      type="number"
                      value={settings.freeDeliveryThreshold}
                      onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Restaurant Packaging Fee (₹)</label>
                    <input
                      type="number"
                      value={settings.restaurantPackagingFee}
                      onChange={(e) => setSettings({ ...settings, restaurantPackagingFee: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Save Platform Settings
              </button>
            </form>
          </div>
        )}

        {/* VIEW 10: Admin Team */}
        {activeTab === 'team' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Admin Team & Security</h2>
                <p className="text-xs text-gray-500">Super Admin and role-based staff provisioning</p>
              </div>

              <button
                onClick={() => setShowAddAdminModal(true)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Provision Admin</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminList.map((adm) => (
                <div
                  key={adm.id}
                  className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-gray-900 text-sm">{adm.name}</h4>
                      <p className="text-xs text-gray-500 font-mono">{adm.email}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-800">
                      {adm.role.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400">
                    Created: {new Date(adm.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Tax Invoice Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <h3 className="font-black text-gray-900 text-base">Food and dilvry - Tax Invoice</h3>
                <p className="text-[10px] text-gray-500">GSTIN: 09AAACF1234F1Z8 (Uttar Pradesh, India)</p>
              </div>
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="font-bold text-gray-500">Order Ref:</span>
                <p className="font-mono font-bold text-gray-900">{selectedOrderForInvoice.orderNumber}</p>
              </div>
              <div>
                <span className="font-bold text-gray-500">Date:</span>
                <p>{new Date(selectedOrderForInvoice.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-bold text-gray-500">Restaurant:</span>
                <p className="font-bold">{selectedOrderForInvoice.restaurantName}</p>
              </div>
              <div>
                <span className="font-bold text-gray-500">Billed To:</span>
                <p>{selectedOrderForInvoice.customer.name}</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-3 space-y-2">
              <div className="font-bold text-gray-800 pb-1 border-b border-gray-100">Dishes Summary:</div>
              {selectedOrderForInvoice.items.map((i, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{i.quantity}x {i.name}</span>
                  <span className="font-semibold">₹{i.price * i.quantity}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100 space-y-1">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{selectedOrderForInvoice.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>GST (5%)</span>
                  <span>₹{selectedOrderForInvoice.taxAmount}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery Fee</span>
                  <span>₹{selectedOrderForInvoice.deliveryFee}</span>
                </div>
                <div className="flex justify-between font-black text-gray-900 text-sm pt-1 border-t border-gray-200">
                  <span>Total Amount Paid</span>
                  <span>₹{selectedOrderForInvoice.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Restaurant Modal */}
      {showAddRestModal && (
        <AddRestaurantModal
          onClose={() => setShowAddRestModal(false)}
          onAdded={(newR) => {
            setRestaurants((prev) => [newR, ...prev]);
            setShowAddRestModal(false);
          }}
        />
      )}

      {/* Add Food Menu Modal */}
      {showAddMenuModal && (
        <AddMenuModal
          restaurants={restaurants}
          onClose={() => setShowAddMenuModal(false)}
          onAdded={(newM) => {
            setMenuItems((prev) => [newM, ...prev]);
            setShowAddMenuModal(false);
          }}
        />
      )}

      {/* Add Coupon Modal */}
      {showAddCouponModal && (
        <AddCouponModal
          onClose={() => setShowAddCouponModal(false)}
          onAdded={(newC) => {
            setCoupons((prev) => [newC, ...prev]);
            setShowAddCouponModal(false);
          }}
        />
      )}

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <AddAdminModal
          onClose={() => setShowAddAdminModal(false)}
          onAdded={(newA) => {
            setAdminList((prev) => [newA, ...prev]);
            setShowAddAdminModal(false);
          }}
        />
      )}

      {/* Edit Food Menu Modal */}
      {editingMenuItem && (
        <EditMenuModal
          item={editingMenuItem}
          onClose={() => setEditingMenuItem(null)}
          onUpdated={(updatedItem) => {
            setMenuItems((prev) => prev.map((m) => (m.id === updatedItem.id ? updatedItem : m)));
            setEditingMenuItem(null);
          }}
        />
      )}

      {/* Add Delivery Partner Modal */}
      {showAddDriverModal && (
        <AddDriverModal
          onClose={() => setShowAddDriverModal(false)}
          onAdded={(newD) => {
            setDrivers((prev) => [newD, ...prev]);
            setShowAddDriverModal(false);
          }}
        />
      )}
    </div>
  );
};

// -------------------------------------------------------------
// SUB-MODALS (Add Restaurant, Add Menu, Add Coupon, Add Admin)
// -------------------------------------------------------------

const AddRestaurantModal: React.FC<{ onClose: () => void; onAdded: (r: Restaurant) => void }> = ({
  onClose,
  onAdded,
}) => {
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [city, setCity] = useState<UPCity>('Lucknow');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [cuisine, setCuisine] = useState('Awadhi, Mughlai');
  const [fssaiLicense, setFssaiLicense] = useState('');
  const [commissionRate, setCommissionRate] = useState(15);
  const [pureVeg, setPureVeg] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.restaurants.create({
        name,
        tagline,
        city,
        locality,
        address,
        phone,
        cuisine: cuisine.split(',').map((s) => s.trim()),
        fssaiLicense,
        commissionRate,
        pureVeg,
        imageUrl: imageUrl || undefined,
        status: 'approved',
      });
      onAdded(res);
    } catch (err: any) {
      alert(err.message || 'Failed to create restaurant');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4 text-xs my-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <h3 className="font-black text-gray-900 text-base">Add New Restaurant Listing</h3>
          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Restaurant Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Awadh"
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">City in UP</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value as UPCity)}
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
              >
                {['Lucknow', 'Varanasi', 'Kanpur', 'Agra', 'Prayagraj', 'Noida', 'Ghaziabad', 'Bareilly', 'Gorakhpur', 'Aligarh'].map(
                  (c) => (
                    <option key={c} value={c}>{c}</option>
                  )
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Tagline / Specialties</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Famous for Galouti Kebab and Dum Biryani"
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Locality</label>
              <input
                type="text"
                required
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Hazratganj"
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 94150 12345"
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Full Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Shop #, Street, City"
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">FSSAI License</label>
              <input
                type="text"
                value={fssaiLicense}
                onChange={(e) => setFssaiLicense(e.target.value)}
                placeholder="14-digit FSSAI"
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Commission Rate (%)</label>
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Cuisines (Comma-separated)</label>
            <input
              type="text"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Cover Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
            />
          </div>

          <label className="flex items-center space-x-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={pureVeg}
              onChange={(e) => setPureVeg(e.target.checked)}
              className="rounded text-emerald-600"
            />
            <span className="font-bold text-gray-800">Pure Vegetarian Listing</span>
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 bg-red-600 text-white font-bold rounded-xl shadow-md"
            >
              Add Restaurant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const FOOD_PRESET_IMAGES = [
  { name: 'Awadhi Biryani', hindi: 'अवधी बिरयानी', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80' },
  { name: 'Galouti Kebab', hindi: 'गलौटी कबाब', url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80' },
  { name: 'Banarasi Chaat', hindi: 'बनारसी चाट', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
  { name: 'Kulhad Lassi', hindi: 'कुल्हड़ लस्सी', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80' },
  { name: 'Thaggu Laddu', hindi: 'ठग्गू के लड्डू', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80' },
  { name: 'Dal Makhani', hindi: 'दाल मखनी नान', url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80' },
  { name: 'Purvanchal Thali', hindi: 'शाही थाली', url: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80' },
  { name: 'Crispy Burger', hindi: 'बर्गर व फ्राइज़', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80' },
  { name: 'Samosa / Snacks', hindi: 'समोसा नाश्ता', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80' },
  { name: 'Hot Pizza', hindi: 'चीज पिज़्ज़ा', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80' },
  { name: 'Badam Milk', hindi: 'केसरिया दूध', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80' },
  { name: 'Shahi Tukda', hindi: 'शाही टुकड़ा', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80' },
];

const AddMenuModal: React.FC<{
  restaurants: Restaurant[];
  onClose: () => void;
  onAdded: (m: MenuItem) => void;
}> = ({ restaurants, onClose, onAdded }) => {
  const [restaurantId, setRestaurantId] = useState(restaurants[0]?.id || '');
  const [name, setName] = useState('');
  const [hindiName, setHindiName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Biryani');
  const [price, setPrice] = useState(250);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>();
  const [dietary, setDietary] = useState<'veg' | 'non-veg' | 'egg' | 'vegan'>('veg');
  const [imageUrl, setImageUrl] = useState(FOOD_PRESET_IMAGES[0].url);
  const [submitting, setSubmitting] = useState(false);

  // File upload to base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('सामान का नाम डालना अनिवार्य है (Dish name required)');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.menu.create({
        restaurantId,
        name: name.trim(),
        hindiName: hindiName.trim() || undefined,
        description: description.trim() || undefined,
        category,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        dietary,
        imageUrl: imageUrl || FOOD_PRESET_IMAGES[0].url,
        isAvailable: true,
      });
      alert(`सामान "${res.name}" सफलतापूर्वक जोड़ दिया गया और अब ग्राहक ऐप में उपलब्ध है!`);
      onAdded(res);
    } catch (err: any) {
      alert(err.message || 'सामान जोड़ने में विफल (Failed to add dish)');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4 text-xs my-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <div>
            <h3 className="font-black text-gray-900 text-base flex items-center space-x-1.5">
              <span>+ नया सामान जोड़ें (Add Food Item)</span>
            </h3>
            <p className="text-[11px] text-gray-500">एडमिन पैनल से जोड़ा गया सामान तुरंत ग्राहक ऐप में दिखाई देगा</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block font-bold text-gray-800 mb-1">
              रेस्टोरेंट चुनें (Select Restaurant) <span className="text-red-500">*</span>
            </label>
            <select
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white"
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.city})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                सामान का नाम (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Awadhi Dum Biryani"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">सामान का नाम (हिंदी)</label>
              <input
                type="text"
                value={hindiName}
                onChange={(e) => setHindiName(e.target.value)}
                placeholder="उदा. अवधी दम बिरयानी"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-bold text-gray-800 mb-1">कैटेगरी</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white"
              >
                {['Biryani', 'Mughlai', 'Chaat', 'Mithai', 'North Indian', 'Thali', 'Burgers', 'Beverages', 'Desserts'].map(
                  (c) => (
                    <option key={c} value={c}>{c}</option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">
                कीमत ₹ (Price) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">ऑफ़र मूल्य ₹ (Optional)</label>
              <input
                type="number"
                value={discountPrice || ''}
                onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="जैसे 220"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white text-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">शाकाहारी या मांसाहारी (Dietary Type)</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDietary('veg')}
                className={`py-1.5 px-2 rounded-xl font-bold text-xs border transition-all ${
                  dietary === 'veg' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                Veg 🟢 शाकाहारी
              </button>
              <button
                type="button"
                onClick={() => setDietary('non-veg')}
                className={`py-1.5 px-2 rounded-xl font-bold text-xs border transition-all ${
                  dietary === 'non-veg' ? 'bg-red-600 text-white border-red-600 shadow-xs' : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                Non-Veg 🔴 मांसाहारी
              </button>
              <button
                type="button"
                onClick={() => setDietary('vegan')}
                className={`py-1.5 px-2 rounded-xl font-bold text-xs border transition-all ${
                  dietary === 'vegan' ? 'bg-teal-600 text-white border-teal-600 shadow-xs' : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                Vegan 🌿 वीगन
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">सामग्री व विवरण (Description)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ताजा सामग्री, मसाले, सर्विंग स्टाइल..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          {/* Image Selection with 1-Click Presets & Device File Upload */}
          <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-800">फोटो चुनें या अपलोड करें (Food Photo)</label>
              <span className="text-[10px] text-gray-500">1-क्लिक से चुनें या फोन से फोटो अपलोड करें</span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white rounded-xl border border-gray-100">
              {FOOD_PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setImageUrl(preset.url)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center space-x-1 ${
                    imageUrl === preset.url
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  <span>{preset.hindi}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <span className="block text-[10px] font-bold text-gray-500 mb-0.5">डिवाइस से फोटो अपलोड करें:</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full text-[11px] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                />
              </div>

              <div>
                <span className="block text-[10px] font-bold text-gray-500 mb-0.5">या फोटो का लिंक (URL) डालें:</span>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash..."
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Live Preview */}
            {imageUrl && (
              <div className="flex items-center space-x-2 pt-1">
                <span className="text-[10px] font-bold text-gray-500">फोटो प्रिव्यू:</span>
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-12 h-12 rounded-lg object-cover border border-gray-300 shadow-xs"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              {submitting ? 'जोड़ा जा रहा है...' : '✓ सामान जोड़ें (Add Item)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddCouponModal: React.FC<{ onClose: () => void; onAdded: (c: Coupon) => void }> = ({
  onClose,
  onAdded,
}) => {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState(20);
  const [minOrderValue, setMinOrderValue] = useState(199);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | undefined>(100);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.coupons.create({
        code,
        description,
        discountType,
        discountValue,
        minOrderValue,
        maxDiscountAmount,
        expiryDate,
      });
      onAdded(res);
    } catch (err: any) {
      alert(err.message || 'Failed to create coupon');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <h3 className="font-black text-gray-900 text-base">Create Promo Coupon</h3>
          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Coupon Code (e.g. UPTREAT40)</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-mono font-bold uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Offer Description</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Flat ₹40 off on orders above ₹199"
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Discount Value</label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Min Order Value (₹)</label>
              <input
                type="number"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Max Cap in ₹ (Optional)</label>
              <input
                type="number"
                value={maxDiscountAmount || ''}
                onChange={(e) => setMaxDiscountAmount(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="No max cap"
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-red-600 text-white font-bold rounded-xl shadow-md"
            >
              Activate Coupon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddAdminModal: React.FC<{ onClose: () => void; onAdded: (a: AdminUser) => void }> = ({
  onClose,
  onAdded,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'super_admin' | 'operations_manager' | 'finance_support'>('operations_manager');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.auth.registerAdmin({
        name,
        email,
        password,
        role,
      });
      onAdded(res.user);
    } catch (err: any) {
      alert(err.message || 'Failed to provision admin');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <h3 className="font-black text-gray-900 text-base">Provision New Admin Account</h3>
          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Admin Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Operations Executive"
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@fooddilvry.in"
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Temporary Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Assigned Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
            >
              <option value="operations_manager">Operations Manager (Dispatch & Kitchen)</option>
              <option value="finance_support">Finance & Support (Refunds & Payouts)</option>
              <option value="super_admin">Super Admin (Full System Access)</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-red-600 text-white font-bold rounded-xl shadow-md"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditMenuModal: React.FC<{
  item: MenuItem;
  onClose: () => void;
  onUpdated: (updated: MenuItem) => void;
}> = ({ item, onClose, onUpdated }) => {
  const [name, setName] = useState(item.name);
  const [hindiName, setHindiName] = useState(item.hindiName || '');
  const [description, setDescription] = useState(item.description);
  const [category, setCategory] = useState(item.category);
  const [price, setPrice] = useState(item.price);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(item.discountPrice);
  const [dietary, setDietary] = useState(item.dietary);
  const [imageUrl, setImageUrl] = useState(item.imageUrl);
  const [isAvailable, setIsAvailable] = useState(item.isAvailable);
  const [submitting, setSubmitting] = useState(false);

  // File upload to base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('सामान का नाम डालना अनिवार्य है');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await api.menu.update(item.id, {
        name: name.trim(),
        hindiName: hindiName.trim() || undefined,
        description: description.trim() || undefined,
        category,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        dietary,
        imageUrl,
        isAvailable,
      });
      alert(`सामान "${updated.name}" का विवरण सफलतापूर्वक अपडेट हो गया!`);
      onUpdated(updated);
    } catch (err: any) {
      alert(err.message || 'सामान अपडेट करने में विफल (Failed to update dish)');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4 text-xs my-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <div>
            <h3 className="font-black text-gray-900 text-base">सामान का उपाय करें (Edit & Update Dish)</h3>
            <p className="text-[11px] text-gray-500">{item.restaurantName || 'Restaurant Dish'} • आईडी: {item.id}</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                सामान का नाम (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">सामान का नाम (हिंदी)</label>
              <input
                type="text"
                value={hindiName}
                onChange={(e) => setHindiName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-bold text-gray-800 mb-1">कैटेगरी</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white"
              >
                {['Biryani', 'Mughlai', 'Chaat', 'Mithai', 'North Indian', 'Thali', 'Burgers', 'Beverages', 'Desserts'].map(
                  (c) => (
                    <option key={c} value={c}>{c}</option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                कीमत ₹ (Price) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">ऑफ़र मूल्य ₹ (Optional)</label>
              <input
                type="number"
                value={discountPrice || ''}
                onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="वैकल्पिक"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white text-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">शाकाहारी या मांसाहारी (Dietary Type)</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDietary('veg')}
                className={`py-1.5 px-2 rounded-xl font-bold text-xs border transition-all ${
                  dietary === 'veg' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                Veg 🟢 शाकाहारी
              </button>
              <button
                type="button"
                onClick={() => setDietary('non-veg')}
                className={`py-1.5 px-2 rounded-xl font-bold text-xs border transition-all ${
                  dietary === 'non-veg' ? 'bg-red-600 text-white border-red-600 shadow-xs' : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                Non-Veg 🔴 मांसाहारी
              </button>
              <button
                type="button"
                onClick={() => setDietary('vegan')}
                className={`py-1.5 px-2 rounded-xl font-bold text-xs border transition-all ${
                  dietary === 'vegan' ? 'bg-teal-600 text-white border-teal-600 shadow-xs' : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                Vegan 🌿 वीगन
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">सामग्री व विवरण (Description)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          {/* Photo Presets & Device File Upload */}
          <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-800">फोटो बदलें (Change Food Photo)</label>
              <span className="text-[10px] text-gray-500">1-क्लिक से बदलें या नई फोटो अपलोड करें</span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white rounded-xl border border-gray-100">
              {FOOD_PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setImageUrl(preset.url)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center space-x-1 ${
                    imageUrl === preset.url
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  <span>{preset.hindi}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <span className="block text-[10px] font-bold text-gray-500 mb-0.5">नई फोटो अपलोड करें:</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full text-[11px] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                />
              </div>

              <div>
                <span className="block text-[10px] font-bold text-gray-500 mb-0.5">या फोटो का लिंक (URL):</span>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                />
              </div>
            </div>

            {imageUrl && (
              <div className="flex items-center space-x-2 pt-1">
                <span className="text-[10px] font-bold text-gray-500">फोटो प्रिव्यू:</span>
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-12 h-12 rounded-lg object-cover border border-gray-300 shadow-xs"
                />
              </div>
            )}
          </div>

          {/* In-Stock Toggle */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900 text-xs">स्टॉक स्थिति (Stock Availability)</p>
              <p className="text-[11px] text-gray-500">
                {isAvailable ? 'सामान उपलब्ध है और ग्राहक ऑर्डर कर सकते हैं' : 'सामान आउट ऑफ स्टॉक है'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              {submitting ? 'सहेज रहे हैं...' : '✓ बदलाव सहेजें (Save Changes)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddDriverModal: React.FC<{
  onClose: () => void;
  onAdded: (d: DeliveryPartner) => void;
}> = ({ onClose, onAdded }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState<UPCity>('Lucknow');
  const [vehicleType, setVehicleType] = useState<'bike' | 'scooter' | 'electric_cycle'>('bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [drivingLicense, setDrivingLicense] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.drivers.create({
        name,
        phone,
        city,
        vehicleType,
        vehicleNumber,
        drivingLicense,
      });
      const approved = await api.drivers.updateStatus(res.id, { status: 'approved', availability: 'available' });
      onAdded(approved);
    } catch (err: any) {
      alert(err.message || 'Failed to onboard driver');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <div>
            <h3 className="font-black text-gray-900 text-base">Onboard Delivery Partner / नया राइडर जोड़ें</h3>
            <p className="text-[11px] text-gray-500">Fleet addition for Uttar Pradesh cities</p>
          </div>
          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Rider Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sunil Kumar Yadav"
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Mobile Phone (+91)</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 94150 77123"
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Base UP City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value as UPCity)}
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
              >
                {['Lucknow', 'Varanasi', 'Kanpur', 'Agra', 'Prayagraj', 'Noida', 'Ghaziabad', 'Bareilly', 'Gorakhpur', 'Aligarh'].map(
                  (c) => (
                    <option key={c} value={c}>{c}</option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
              >
                <option value="bike">Motorcycle (Bike)</option>
                <option value="scooter">Scooter</option>
                <option value="electric_cycle">Electric Cycle</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Vehicle Number</label>
              <input
                type="text"
                required
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                placeholder="UP-32-XX-0000"
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-mono uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Driving License Number</label>
            <input
              type="text"
              required
              value={drivingLicense}
              onChange={(e) => setDrivingLicense(e.target.value.toUpperCase())}
              placeholder="UP322022000123"
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-mono uppercase"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
            >
              Approve & Onboard Rider
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
