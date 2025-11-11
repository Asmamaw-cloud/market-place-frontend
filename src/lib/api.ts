import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for HTTP-only cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Sending request with token:', token.substring(0, 20) + '...');
      } else {
        console.log('No token found in localStorage');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If token expired and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { access_token } = refreshResponse.data;
        
        // Store new token
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', access_token);
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, only redirect to login if on a protected route
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          const currentPath = window.location.pathname;
          // Public routes that don't require authentication
          const publicRoutes = ['/', '/login', '/signup', '/register', '/products', '/merchants'];
          const isPublicRoute = publicRoutes.some(route => currentPath === route || currentPath.startsWith(route + '/'));
          
          // Only redirect to login if not already on a public route
          if (!isPublicRoute) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Generic API methods
export const apiClient = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.get(url, config),
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.post(url, data, config),
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.put(url, data, config),
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.patch(url, data, config),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.delete(url, config),
};

// Auth API
export const authApi = {
  requestOtp: (email: string) =>
    apiClient.post('/auth/request-otp', { email }),
  
  verifyOtp: (email: string, code: string) =>
    apiClient.post('/auth/verify-otp', { email, code }),
  
  refresh: () =>
    apiClient.post('/auth/refresh'),
  
  revoke: () =>
    apiClient.post('/auth/revoke'),
};

// Products API
export const productsApi = {
  list: (params?: { q?: string; category?: string; merchant?: string; page?: number; limit?: number }) =>
    apiClient.get('/products', { params }),
  
  get: (id: string) =>
    apiClient.get(`/products/${id}`),
  
  create: (data: any) =>
    apiClient.post('/products', data),
  
  update: (id: string, data: any) =>
    apiClient.put(`/products/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete(`/products/${id}`),
  
  addSku: (productId: string, data: any) =>
    apiClient.post(`/products/${productId}/skus`, data),
};

// Cart API
export const cartApi = {
  get: () =>
    apiClient.get('/cart'),
  
  addItem: (data: { skuId: string; quantity: number }) =>
    apiClient.post('/cart/items', data),
  
  removeItem: (itemId: string) =>
    apiClient.delete(`/cart/items/${itemId}`),
  
  updateItem: (itemId: string, data: { quantity: number }) =>
    apiClient.patch(`/cart/items/${itemId}`, data),
  
  clear: () =>
    apiClient.delete('/cart'),
};

// Orders API
export const ordersApi = {
  list: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get('/orders', { params }),
  
  get: (id: string) =>
    apiClient.get(`/orders/${id}`),
  
  createFromCart: (data: { addressId: string; paymentProvider: string }) =>
    apiClient.post('/orders/create-from-cart', data),
  
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/orders/${id}/status`, { status }),
};

// Merchants API
export const merchantsApi = {
  list: (params?: { lat?: number; lon?: number; radiusKm?: number; search?: string }) =>
    apiClient.get('/merchants', { params }),
  
  get: (id: string) =>
    apiClient.get(`/merchants/${id}`),
  
  create: (data: any) =>
    apiClient.post('/merchants', data),
  
  update: (data: any) =>
    apiClient.post('/merchants/update', data),
  
  me: () =>
    apiClient.get('/merchants/me'),
  
  nearby: (lat: number, lon: number, radiusKm?: number) =>
    apiClient.get('/merchants/nearby', { params: { lat, lon, radiusKm } }),
  
  summary: () =>
    apiClient.get('/merchants/summary'),
};

// Payments API
export const paymentsApi = {
  initiate: (paymentId: string, provider: string) =>
    apiClient.post('/payments/initiate', { paymentId, provider }),
  
  capture: (paymentId: string) =>
    apiClient.post('/payments/capture', { paymentId }),
};

// Reviews API
export const reviewsApi = {
  list: (productId: string) =>
    apiClient.get(`/reviews/product/${productId}`),
  
  create: (productId: string, data: { rating: number; comment?: string; images?: string[] }) =>
    apiClient.post(`/reviews/product/${productId}`, data),
};

// Q&A API
export const qnaApi = {
  list: (productId: string) =>
    apiClient.get(`/qna/product/${productId}`),
  
  ask: (productId: string, question: string) =>
    apiClient.post(`/qna/product/${productId}`, { question }),
  
  answer: (qnaId: string, answer: string) =>
    apiClient.post(`/qna/${qnaId}/answer`, { answer }),
};

// Addresses API
export const addressesApi = {
  list: () =>
    apiClient.get('/addresses'),
  
  get: (id: string) =>
    apiClient.get(`/addresses/${id}`),
  
  create: (data: any) =>
    apiClient.post('/addresses', data),
  
  update: (id: string, data: any) =>
    apiClient.put(`/addresses/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete(`/addresses/${id}`),
};

// Shipments API
export const shipmentsApi = {
  list: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get('/shipments', { params }),
  
  get: (id: string) =>
    apiClient.get(`/shipments/${id}`),
  
  create: (data: any) =>
    apiClient.post('/shipments', data),
  
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/shipments/${id}/status`, { status }),
  
  verifyOtp: (id: string, otp: string) =>
    apiClient.post(`/shipments/${id}/verify-otp`, { otp }),
};

// Users API
export const usersApi = {
  getProfile: () =>
    apiClient.get('/users/profile'),
  
  updateProfile: (data: any) =>
    apiClient.put('/users/profile', data),
};

// Categories API
export const categoriesApi = {
  list: () =>
    apiClient.get('/catalog/categories'),
  
  get: (id: string) =>
    apiClient.get(`/catalog/categories/${id}`),
  
  create: (data: any) =>
    apiClient.post('/catalog/categories', data),
  
  update: (id: string, data: any) =>
    apiClient.put(`/catalog/categories/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete(`/catalog/categories/${id}`),
};

// Chat API
export const chatApi = {
  getConversations: () =>
    apiClient.get('/chat/conversations'),
  
  createConversation: (merchantId: string) =>
    apiClient.post('/chat/conversations', { merchantId }),
  
  getMessages: (conversationId: string) =>
    apiClient.get(`/chat/conversations/${conversationId}/messages`),
  
  sendMessage: (conversationId: string, data: { content?: string; type?: 'TEXT' | 'SIGNAL'; attachments?: string[] }) =>
    apiClient.post(`/chat/conversations/${conversationId}/messages`, data),
  
  markAsRead: (conversationId: string, messageId: string) =>
    apiClient.post(`/chat/conversations/${conversationId}/read`, { messageId }),
};

// Health API
export const healthApi = {
  check: () =>
    apiClient.get('/health'),
  
  metrics: () =>
    apiClient.get('/metrics'),
};

export default api;
