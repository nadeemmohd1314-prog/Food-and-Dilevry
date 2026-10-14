import {
  Restaurant,
  MenuItem,
  Order,
  DeliveryPartner,
  Coupon,
  RefundRequest,
  PlatformSettings,
  AdminUser,
} from '../types';

const TOKEN_KEY = 'food_dilvry_token';
const ADMIN_USER_KEY = 'food_dilvry_admin_user';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  },
  getStoredUser: (): AdminUser | null => {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setStoredUser: (user: AdminUser) => {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  },
};

function getHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = tokenStorage.get();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    login: async (email: string, password: string) => {
      const data = await request<{ token: string; user: AdminUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      tokenStorage.set(data.token);
      tokenStorage.setStoredUser(data.user);
      return data;
    },
    me: () => request<{ user: AdminUser | null }>('/api/auth/me'),
    logout: async () => {
      try {
        await request('/api/auth/logout', { method: 'POST' });
      } finally {
        tokenStorage.remove();
      }
    },
    registerAdmin: (payload: { email: string; password: string; name: string; role: string; bootstrapKey?: string }) =>
      request<{ success: boolean; user: AdminUser }>('/api/auth/register-admin', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    listAdmins: () => request<AdminUser[]>('/api/auth/admins'),
    updateAdmin: (id: string, updates: Partial<AdminUser>) =>
      request<AdminUser>(`/api/auth/admins/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    deleteAdmin: (id: string) =>
      request<{ success: boolean }>(`/api/auth/admins/${id}`, {
        method: 'DELETE',
      }),
  },

  // Restaurants
  restaurants: {
    list: (params: { status?: string; city?: string; search?: string; pureVeg?: boolean } = {}) => {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.city) query.set('city', params.city);
      if (params.search) query.set('search', params.search);
      if (params.pureVeg) query.set('pureVeg', 'true');
      return request<Restaurant[]>(`/api/restaurants?${query.toString()}`);
    },
    get: (id: string) => request<Restaurant>(`/api/restaurants/${id}`),
    create: (data: Partial<Restaurant>) =>
      request<Restaurant>('/api/restaurants', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Restaurant>) =>
      request<Restaurant>(`/api/restaurants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: 'approved' | 'pending' | 'suspended') =>
      request<Restaurant>(`/api/restaurants/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/restaurants/${id}`, {
        method: 'DELETE',
      }),
  },

  // Menu Items
  menu: {
    list: (params: { restaurantId?: string; category?: string; dietary?: string; search?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.restaurantId) query.set('restaurantId', params.restaurantId);
      if (params.category) query.set('category', params.category);
      if (params.dietary) query.set('dietary', params.dietary);
      if (params.search) query.set('search', params.search);
      return request<MenuItem[]>(`/api/menu?${query.toString()}`);
    },
    create: (data: Partial<MenuItem>) =>
      request<MenuItem>('/api/menu', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<MenuItem>) =>
      request<MenuItem>(`/api/menu/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    toggleAvailability: (id: string, isAvailable?: boolean) =>
      request<MenuItem>(`/api/menu/${id}/availability`, {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable }),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/menu/${id}`, {
        method: 'DELETE',
      }),
  },

  // Orders
  orders: {
    list: (params: { status?: string; restaurantId?: string; city?: string; search?: string; customerPhone?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.restaurantId) query.set('restaurantId', params.restaurantId);
      if (params.city) query.set('city', params.city);
      if (params.search) query.set('search', params.search);
      if (params.customerPhone) query.set('customerPhone', params.customerPhone);
      return request<Order[]>(`/api/orders?${query.toString()}`);
    },
    create: (data: any) =>
      request<Order>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, statusData: { orderStatus: string; cancellationReason?: string; paymentStatus?: string }) =>
      request<Order>(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(statusData),
      }),
    assignDriver: (id: string, driverId?: string) =>
      request<Order>(`/api/orders/${id}/assign-driver`, {
        method: 'PATCH',
        body: JSON.stringify({ driverId }),
      }),
    riderAction: (id: string, actionData: { action: 'accept_order' | 'picked_up' | 'verify_otp_deliver'; driverId?: string; otp?: string }) =>
      request<Order>(`/api/orders/${id}/rider-action`, {
        method: 'PATCH',
        body: JSON.stringify(actionData),
      }),
    rate: (id: string, ratingData: { rating: number; reviewComment?: string }) =>
      request<{ success: boolean; order: Order }>(`/api/orders/${id}/rate`, {
        method: 'POST',
        body: JSON.stringify(ratingData),
      }),
  },

  // Drivers
  drivers: {
    list: (city?: string) => {
      const query = city ? `?city=${encodeURIComponent(city)}` : '';
      return request<DeliveryPartner[]>(`/api/drivers${query}`);
    },
    create: (data: Partial<DeliveryPartner>) =>
      request<DeliveryPartner>('/api/drivers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, statusData: { status?: string; availability?: string }) =>
      request<DeliveryPartner>(`/api/drivers/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(statusData),
      }),
    update: (id: string, data: Partial<DeliveryPartner>) =>
      request<DeliveryPartner>(`/api/drivers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Coupons
  coupons: {
    list: () => request<Coupon[]>('/api/coupons'),
    validate: (code: string, cartTotal: number) =>
      request<{ valid: boolean; code: string; description: string; discountAmount: number }>('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, cartTotal }),
      }),
    create: (data: Partial<Coupon>) =>
      request<Coupon>('/api/coupons', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    toggle: (id: string) =>
      request<Coupon>(`/api/coupons/${id}/toggle`, {
        method: 'PATCH',
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/coupons/${id}`, {
        method: 'DELETE',
      }),
  },

  // Finance & Stats
  finance: {
    getStats: () =>
      request<{
        kpis: {
          totalOrders: number;
          completedOrdersCount: number;
          pendingOrdersCount: number;
          cancelledOrdersCount: number;
          activeRestaurantsCount: number;
          activeDriversCount: number;
          totalGrossSales: number;
          totalCommissionEarned: number;
          totalPlatformEarnings: number;
          codVolume: number;
          upiVolume: number;
        };
        restaurantEarnings: any[];
        payoutHistory: any[];
      }>('/api/finance/stats'),
    settlePayout: (payoutData: any) =>
      request<any>('/api/finance/payouts', {
        method: 'POST',
        body: JSON.stringify(payoutData),
      }),
  },

  // Refunds
  refunds: {
    list: () => request<RefundRequest[]>('/api/refunds'),
    request: (data: { orderId: string; reason: string; amount?: number }) =>
      request<RefundRequest>('/api/refunds', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    action: (id: string, action: 'approve' | 'reject', adminNotes?: string) =>
      request<RefundRequest>(`/api/refunds/${id}/action`, {
        method: 'PATCH',
        body: JSON.stringify({ action, adminNotes }),
      }),
  },

  // Settings
  settings: {
    get: () => request<PlatformSettings>('/api/settings'),
    update: (settings: Partial<PlatformSettings>) =>
      request<PlatformSettings>('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      }),
  },

  // Image Upload
  upload: (dataUrl: string) =>
    request<{ url: string }>('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ dataUrl }),
    }),

  // System Status
  systemStatus: () => request<any>('/api/system/status'),
};
