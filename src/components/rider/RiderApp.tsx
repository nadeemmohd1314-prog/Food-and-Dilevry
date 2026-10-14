import React, { useState, useEffect } from 'react';
import { DeliveryPartner, Order, UPCity } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Bike,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Clock,
  DollarSign,
  Power,
  RefreshCw,
  Plus,
} from 'lucide-react';

export const RiderApp: React.FC = () => {
  const { selectedCity } = useAuth();
  const [drivers, setDrivers] = useState<DeliveryPartner[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [enteredOtp, setEnteredOtp] = useState<Record<string, string>>({});
  const [otpError, setOtpError] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // New Driver Registration
  const [showRegModal, setShowRegModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newVehicle, setNewVehicle] = useState<'bike' | 'scooter' | 'electric_cycle'>('bike');
  const [newVehicleNumber, setNewVehicleNumber] = useState('');
  const [newLicense, setNewLicense] = useState('');
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  useEffect(() => {
    api.drivers.list().then((data) => {
      setDrivers(data);
      if (data.length > 0 && !selectedDriverId) {
        setSelectedDriverId(data[0].id);
      }
    });
  }, []);

  const activeDriver = drivers.find((d) => d.id === selectedDriverId);

  // Fetch orders assigned to this driver or available in this city
  useEffect(() => {
    if (!activeDriver) return;
    setLoading(true);

    api.orders.list({ city: activeDriver.city })
      .then((allOrders) => {
        // Filter orders assigned to this driver OR active orders needing pickup
        const driverOrders = allOrders.filter(
          (o) =>
            o.assignedDriverId === activeDriver.id ||
            (['ready_for_pickup', 'preparing', 'pending'].includes(o.orderStatus) && !o.assignedDriverId)
        );
        setAssignedOrders(driverOrders);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeDriver, selectedDriverId]);

  // Handle Rider Workflow Actions
  const handleRiderAction = async (
    orderId: string,
    action: 'accept_order' | 'picked_up' | 'verify_otp_deliver',
    otp?: string
  ) => {
    if (!activeDriver) return;
    setActionLoading(true);
    setOtpError((prev) => ({ ...prev, [orderId]: '' }));

    try {
      const updated = await api.orders.riderAction(orderId, {
        action,
        driverId: activeDriver.id,
        otp,
      });

      setAssignedOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));

      if (action === 'verify_otp_deliver') {
        alert(`Order ${updated.orderNumber} successfully delivered! OTP verified.`);
        // Refresh driver stats
        api.drivers.list().then(setDrivers);
      }
    } catch (err: any) {
      setOtpError((prev) => ({ ...prev, [orderId]: err.message || 'Action failed' }));
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle online/offline
  const handleToggleDuty = async () => {
    if (!activeDriver) return;
    const newAvail = activeDriver.availability === 'offline' ? 'available' : 'offline';
    try {
      const updated = await api.drivers.updateStatus(activeDriver.id, { availability: newAvail });
      setDrivers((prev) => prev.map((d) => (d.id === activeDriver.id ? updated : d)));
    } catch (e: any) {
      alert(e.message || 'Failed to toggle duty');
    }
  };

  const handleRegisterDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newD = await api.drivers.create({
        name: newName,
        phone: newPhone,
        city: selectedCity,
        vehicleType: newVehicle,
        vehicleNumber: newVehicleNumber,
        drivingLicense: newLicense,
      });
      setDrivers((prev) => [newD, ...prev]);
      setSelectedDriverId(newD.id);
      setRegSuccess(`Rider registration submitted for ${newName}! Awaiting admin KYC approval.`);
      setShowRegModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to register rider');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-red-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Bike className="w-3.5 h-3.5 text-blue-200" />
            <span>Delivery Fleet & Logistics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Delivery Partner App</h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Live order dispatch, turn-by-turn navigation, and secure OTP proof of delivery across Uttar Pradesh.
          </p>
        </div>

        {/* Rider Profile Selector & Duty Toggle */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div>
            <span className="text-white/70 text-xs block font-medium">Logged in Rider:</span>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="mt-1 px-3 py-1.5 bg-white text-gray-900 rounded-xl text-xs font-bold focus:outline-none shadow-md"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.city} - {d.vehicleType.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {activeDriver && (
            <button
              onClick={handleToggleDuty}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all shadow-md self-end sm:self-center ${
                activeDriver.availability === 'offline'
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{activeDriver.availability === 'offline' ? 'Go Online' : 'On Duty (Online)'}</span>
            </button>
          )}

          <button
            onClick={() => setShowRegModal(true)}
            className="text-xs font-bold underline text-white/90 hover:text-white px-1 self-center"
          >
            + Join Fleet
          </button>
        </div>
      </div>

      {regSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{regSuccess}</span>
        </div>
      )}

      {/* Driver Stats */}
      {activeDriver && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
            <p className="text-xs text-gray-500 font-semibold">Today's Earnings</p>
            <p className="font-black text-xl text-emerald-600 mt-1">₹{activeDriver.todayEarnings || 0}</p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
            <p className="text-xs text-gray-500 font-semibold">Total Completed</p>
            <p className="font-black text-xl text-gray-900 mt-1">{activeDriver.completedDeliveries} Orders</p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
            <p className="text-xs text-gray-500 font-semibold">Customer Rating</p>
            <p className="font-black text-xl text-amber-500 mt-1">★ {activeDriver.rating}</p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
            <p className="text-xs text-gray-500 font-semibold">Vehicle & City</p>
            <p className="font-bold text-sm text-gray-900 mt-1 capitalize">
              {activeDriver.vehicleNumber} ({activeDriver.city})
            </p>
          </div>
        </div>
      )}

      {/* Assigned Orders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-gray-900">
            Available & Assigned Deliveries ({assignedOrders.length})
          </h3>
          <span className="text-xs text-gray-500">Real-time UP Dispatch Queue</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading rider tasks...</div>
        ) : assignedOrders.length === 0 ? (
          <div className="p-12 text-center bg-gray-50 rounded-2xl border border-gray-200">
            <Bike className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="font-bold text-gray-800 text-sm">No active tasks</h4>
            <p className="text-xs text-gray-500 mt-1">Stay online! New customer orders will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedOrders.map((ord) => {
              const isAssignedToMe = ord.assignedDriverId === activeDriver?.id;
              return (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="font-mono text-xs font-black text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        {ord.orderNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        ord.orderStatus === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Pickup Restaurant */}
                    <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs">
                      <div className="font-bold text-amber-950 flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-700" />
                        <span>Pickup: {ord.restaurantName}</span>
                      </div>
                      <p className="text-gray-600 text-[11px] mt-0.5 ml-5">City: {ord.city}</p>
                    </div>

                    {/* Delivery Customer Destination */}
                    <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80 text-xs">
                      <div className="font-bold text-blue-950 flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-700" />
                        <span>Drop to: {ord.customer.name}</span>
                      </div>
                      <p className="text-gray-700 text-[11px] mt-0.5 ml-5">{ord.customer.deliveryAddress}</p>
                      <p className="text-gray-500 text-[10px] mt-0.5 ml-5">Phone: {ord.customer.phone}</p>
                    </div>

                    {/* Payment Info */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-semibold text-gray-600">
                        Payment: <span className="font-bold text-gray-900 uppercase">{ord.paymentMethod}</span>
                      </span>
                      <span className="font-black text-gray-900">
                        {ord.paymentMethod === 'cod' ? `Collect ₹${ord.totalAmount}` : 'Paid Online'}
                      </span>
                    </div>
                  </div>

                  {/* Rider Action Buttons */}
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    {/* Step 1: Claim order */}
                    {!isAssignedToMe && (
                      <button
                        onClick={() => handleRiderAction(ord.id, 'accept_order')}
                        disabled={actionLoading}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                      >
                        Accept This Delivery Task
                      </button>
                    )}

                    {/* Step 2: Pick up from restaurant */}
                    {isAssignedToMe && ord.orderStatus === 'preparing' && (
                      <button
                        onClick={() => handleRiderAction(ord.id, 'picked_up')}
                        disabled={actionLoading}
                        className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                      >
                        Food Picked Up & Start Navigation
                      </button>
                    )}

                    {/* Step 3: Verify OTP and Deliver */}
                    {isAssignedToMe && ord.orderStatus === 'out_for_delivery' && (
                      <div className="p-3 bg-red-50 rounded-xl border border-red-200 space-y-2">
                        <div className="font-bold text-red-900 text-xs flex items-center space-x-1.5">
                          <ShieldCheck className="w-4 h-4 text-red-600" />
                          <span>Enter Customer's 4-Digit Delivery OTP:</span>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            value={enteredOtp[ord.id] || ''}
                            onChange={(e) =>
                              setEnteredOtp((prev) => ({ ...prev, [ord.id]: e.target.value.replace(/\D/g, '') }))
                            }
                            placeholder="e.g. 4892"
                            className="flex-1 px-3 py-2 text-center text-sm font-mono font-bold bg-white border border-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          <button
                            onClick={() => handleRiderAction(ord.id, 'verify_otp_deliver', enteredOtp[ord.id])}
                            disabled={actionLoading || (enteredOtp[ord.id] || '').length < 4}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                          >
                            Verify & Deliver
                          </button>
                        </div>

                        {otpError[ord.id] && (
                          <p className="text-[11px] text-red-600 font-bold">{otpError[ord.id]}</p>
                        )}
                      </div>
                    )}

                    {ord.orderStatus === 'delivered' && (
                      <div className="text-center py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                        ✓ Delivery Completed (Earned ₹{ord.driverEarnings || 40})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Driver Onboarding Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4 text-xs">
            <h3 className="font-extrabold text-base text-gray-900">Join Uttar Pradesh Delivery Fleet</h3>
            <form onSubmit={handleRegisterDriver} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 94150 99881"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Vehicle Type</label>
                  <select
                    value={newVehicle}
                    onChange={(e) => setNewVehicle(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
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
                    value={newVehicleNumber}
                    onChange={(e) => setNewVehicleNumber(e.target.value)}
                    placeholder="UP-32-AB-1234"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Driving License Number</label>
                <input
                  type="text"
                  required
                  value={newLicense}
                  onChange={(e) => setNewLicense(e.target.value)}
                  placeholder="DL-UP-XXXXX"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono uppercase"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
