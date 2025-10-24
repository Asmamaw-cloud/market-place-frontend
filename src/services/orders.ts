import api from './api'
import { Order, CreateOrderRequest, UpdateOrderRequest } from '@/types'

export interface GetOrdersParams {
  page?: number
  limit?: number
  status?: string
  merchantId?: string
  userId?: string
  sortBy?: 'createdAt' | 'totalAmount' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export interface GetOrdersResponse {
  orders: Order[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const ordersService = {
  // Get orders
  async getOrders(params: GetOrdersParams = {}): Promise<GetOrdersResponse> {
    const response = await api.get('/orders', { params })
    return response.data
  },

  // Get single order
  async getOrder(id: string): Promise<Order> {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },

  // Create order from cart
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await api.post('/orders', data)
    return response.data
  },

  // Update order
  async updateOrder(id: string, data: UpdateOrderRequest): Promise<Order> {
    const response = await api.patch(`/orders/${id}`, data)
    return response.data
  },

  // Cancel order
  async cancelOrder(id: string, reason?: string): Promise<Order> {
    const response = await api.post(`/orders/${id}/cancel`, { reason })
    return response.data
  },

  // Update order status
  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const response = await api.patch(`/orders/${id}/status`, { status })
    return response.data
  },

  // Get order items
  async getOrderItems(orderId: string): Promise<any[]> {
    const response = await api.get(`/orders/${orderId}/items`)
    return response.data
  },

  // Get order tracking
  async getOrderTracking(orderId: string): Promise<any> {
    const response = await api.get(`/orders/${orderId}/tracking`)
    return response.data
  },

  // Get order invoice
  async getOrderInvoice(orderId: string): Promise<Blob> {
    const response = await api.get(`/orders/${orderId}/invoice`, {
      responseType: 'blob'
    })
    return response.data
  }
}
