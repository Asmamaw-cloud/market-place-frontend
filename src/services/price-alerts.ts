import api from './api'
import { PriceAlert, CreatePriceAlertRequest, UpdatePriceAlertRequest, PriceAlertNotification } from '@/types/price-alerts'

export interface GetPriceAlertsParams {
  page?: number
  limit?: number
  isActive?: boolean
  alertType?: string
}

export interface GetPriceAlertsResponse {
  alerts: PriceAlert[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const priceAlertsService = {
  // Get user's price alerts
  async getPriceAlerts(params: GetPriceAlertsParams = {}): Promise<GetPriceAlertsResponse> {
    const response = await api.get('/price-alerts', { params })
    return response.data
  },

  // Get single price alert
  async getPriceAlert(alertId: string): Promise<PriceAlert> {
    const response = await api.get(`/price-alerts/${alertId}`)
    return response.data
  },

  // Create price alert
  async createPriceAlert(data: CreatePriceAlertRequest): Promise<PriceAlert> {
    const response = await api.post('/price-alerts', data)
    return response.data
  },

  // Update price alert
  async updatePriceAlert(alertId: string, data: UpdatePriceAlertRequest): Promise<PriceAlert> {
    const response = await api.patch(`/price-alerts/${alertId}`, data)
    return response.data
  },

  // Delete price alert
  async deletePriceAlert(alertId: string): Promise<void> {
    await api.delete(`/price-alerts/${alertId}`)
  },

  // Toggle price alert active status
  async togglePriceAlert(alertId: string): Promise<PriceAlert> {
    const response = await api.patch(`/price-alerts/${alertId}/toggle`)
    return response.data
  },

  // Get price alert notifications
  async getPriceAlertNotifications(params: { page?: number; limit?: number } = {}): Promise<{
    notifications: PriceAlertNotification[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const response = await api.get('/price-alerts/notifications', { params })
    return response.data
  },

  // Check if product has price alert
  async checkProductPriceAlert(productId: string, skuId: string): Promise<{
    hasAlert: boolean
    alert?: PriceAlert
  }> {
    const response = await api.get(`/price-alerts/check/${productId}/${skuId}`)
    return response.data
  },

  // Get price history for product
  async getPriceHistory(productId: string, skuId: string, days: number = 30): Promise<{
    prices: Array<{
      price: number
      date: string
      change?: number
      changePercent?: number
    }>
  }> {
    const response = await api.get(`/price-alerts/price-history/${productId}/${skuId}`, {
      params: { days }
    })
    return response.data
  },

  // Bulk create price alerts
  async bulkCreatePriceAlerts(alerts: CreatePriceAlertRequest[]): Promise<{
    created: number
    failed: number
    results: Array<{
      success: boolean
      alert?: PriceAlert
      error?: string
    }>
  }> {
    const response = await api.post('/price-alerts/bulk', { alerts })
    return response.data
  }
}
