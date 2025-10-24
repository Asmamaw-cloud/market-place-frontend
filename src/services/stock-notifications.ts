import api from './api'
import { StockNotification, CreateStockNotificationRequest, StockNotificationAlert, StockStatus } from '@/types/stock-notifications'

export interface GetStockNotificationsParams {
  page?: number
  limit?: number
  isActive?: boolean
}

export interface GetStockNotificationsResponse {
  notifications: StockNotification[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const stockNotificationsService = {
  // Get user's stock notifications
  async getStockNotifications(params: GetStockNotificationsParams = {}): Promise<GetStockNotificationsResponse> {
    const response = await api.get('/stock-notifications', { params })
    return response.data
  },

  // Get single stock notification
  async getStockNotification(notificationId: string): Promise<StockNotification> {
    const response = await api.get(`/stock-notifications/${notificationId}`)
    return response.data
  },

  // Create stock notification
  async createStockNotification(data: CreateStockNotificationRequest): Promise<StockNotification> {
    const response = await api.post('/stock-notifications', data)
    return response.data
  },

  // Update stock notification
  async updateStockNotification(notificationId: string, data: {
    notificationMethod?: 'EMAIL' | 'SMS' | 'PUSH' | 'ALL'
    isActive?: boolean
  }): Promise<StockNotification> {
    const response = await api.patch(`/stock-notifications/${notificationId}`, data)
    return response.data
  },

  // Delete stock notification
  async deleteStockNotification(notificationId: string): Promise<void> {
    await api.delete(`/stock-notifications/${notificationId}`)
  },

  // Toggle stock notification active status
  async toggleStockNotification(notificationId: string): Promise<StockNotification> {
    const response = await api.patch(`/stock-notifications/${notificationId}/toggle`)
    return response.data
  },

  // Get stock notification alerts
  async getStockNotificationAlerts(params: { page?: number; limit?: number } = {}): Promise<{
    alerts: StockNotificationAlert[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const response = await api.get('/stock-notifications/alerts', { params })
    return response.data
  },

  // Check if product has stock notification
  async checkProductStockNotification(productId: string, skuId: string): Promise<{
    hasNotification: boolean
    notification?: StockNotification
  }> {
    const response = await api.get(`/stock-notifications/check/${productId}/${skuId}`)
    return response.data
  },

  // Get stock status for product
  async getStockStatus(productId: string, skuId: string): Promise<StockStatus> {
    const response = await api.get(`/stock-notifications/stock-status/${productId}/${skuId}`)
    return response.data
  },

  // Bulk create stock notifications
  async bulkCreateStockNotifications(notifications: CreateStockNotificationRequest[]): Promise<{
    created: number
    failed: number
    results: Array<{
      success: boolean
      notification?: StockNotification
      error?: string
    }>
  }> {
    const response = await api.post('/stock-notifications/bulk', { notifications })
    return response.data
  },

  // Get out of stock products
  async getOutOfStockProducts(params: { page?: number; limit?: number } = {}): Promise<{
    products: Array<{
      id: string
      name: string
      slug: string
      images: string[]
      merchant: {
        id: string
        displayName: string
      }
      skus: Array<{
        id: string
        name: string
        unitType: string
        unitIncrement: number
        pricePerCanonicalUnit: number
        currency: string
        active: boolean
        stockQuantity: number
      }>
    }>
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const response = await api.get('/stock-notifications/out-of-stock', { params })
    return response.data
  }
}
