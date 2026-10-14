export type Language = 'en' | 'hi';

export type UserRole = 'customer' | 'restaurant_partner' | 'delivery_partner' | 'admin';

export type AdminRole = 'super_admin' | 'operations_manager' | 'finance_support';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: string;
  lastLogin?: string;
  active: boolean;
}

export type UPCity =
  | 'Lucknow'
  | 'Varanasi'
  | 'Kanpur'
  | 'Agra'
  | 'Prayagraj'
  | 'Noida'
  | 'Ghaziabad'
  | 'Bareilly'
  | 'Gorakhpur'
  | 'Aligarh';

export type RestaurantStatus = 'approved' | 'pending' | 'suspended';

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  description: string;
  city: UPCity;
  locality: string;
  cuisine: string[];
  address: string;
  phone: string;
  email: string;
  fssaiLicense: string;
  rating: number;
  ratingCount: number;
  deliveryTimeMins: string;
  minOrderAmount: number; // in INR ₹
  commissionRate: number; // percentage, e.g. 15%
  status: RestaurantStatus;
  isOpen: boolean;
  featured: boolean;
  pureVeg: boolean;
  imageUrl: string;
  bannerUrl: string;
  createdAt: string;
}

export type DietaryTag = 'veg' | 'non-veg' | 'egg' | 'vegan';

export interface MenuItem {
  id: string;
  restaurantId: string;
  restaurantName?: string;
  name: string;
  hindiName?: string;
  description: string;
  category: string;
  price: number; // in INR ₹
  discountPrice?: number; // in INR ₹
  dietary: DietaryTag;
  imageUrl: string;
  isAvailable: boolean;
  preparationTimeMins: number;
  isBestseller?: boolean;
  createdAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'upi' | 'card' | 'netbanking';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  dietary?: DietaryTag;
  specialInstructions?: string;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  email?: string;
  city: UPCity;
  deliveryAddress: string;
  addressType?: 'Home' | 'Work' | 'Other';
  landmark?: string;
  deliveryNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName: string;
  city: UPCity;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  discountAmount: number;
  packagingFee: number;
  totalAmount: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryOtp: string; // 4-digit code for secure proof of delivery
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  restaurantCommissionAmount: number;
  platformNetEarnings: number;
  driverEarnings: number;
  rating?: number;
  reviewComment?: string;
  createdAt: string;
  updatedAt: string;
  cancellationReason?: string;
}

export type DriverStatus = 'approved' | 'pending' | 'suspended';
export type DriverAvailability = 'available' | 'busy' | 'offline';

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: UPCity;
  vehicleType: 'bike' | 'scooter' | 'electric_cycle' | 'van';
  vehicleNumber: string;
  drivingLicense: string;
  rating: number;
  status: DriverStatus;
  availability: DriverAvailability;
  activeOrdersCount: number;
  completedDeliveries: number;
  todayEarnings: number;
  joinedDate: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  hindiDescription?: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export type RefundStatus = 'pending' | 'approved' | 'rejected';

export interface RefundRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  requestedAt: string;
  processedAt?: string;
  adminNotes?: string;
  refundMethod: 'upi_reversal' | 'original_payment' | 'wallet_credit';
}

export interface RestaurantPayout {
  id: string;
  restaurantId: string;
  restaurantName: string;
  periodStart: string;
  periodEnd: string;
  grossSales: number;
  commissionDeducted: number;
  netPayoutAmount: number;
  status: 'pending' | 'processed';
  processedAt?: string;
  utrNumber?: string;
}

export interface PlatformSettings {
  enableCashOnDelivery: boolean;
  maxCodOrderValue: number; // e.g., ₹2000
  enableOnlinePayments: boolean;
  onlineGatewayMode: 'sandbox' | 'production';
  activeGateway: 'razorpay' | 'phonepe' | 'paytm' | 'stripe';
  taxRatePercent: number; // GST 5% on restaurant orders
  baseDeliveryFee: number; // e.g., ₹30
  freeDeliveryThreshold: number; // e.g., ₹299
  restaurantPackagingFee: number; // e.g., ₹15
  defaultCommissionPercent: number; // e.g., 15%
  driverPerDeliveryFee: number; // e.g., ₹40
}
