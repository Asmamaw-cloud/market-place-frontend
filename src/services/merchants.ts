import api from './api'
import { Merchant, CreateMerchantRequest, UpdateMerchantRequest } from '@/types'

export interface GetMerchantsParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  isVerified?: boolean
  lat?: number
  lon?: number
  radius?: number
  sortBy?: 'name' | 'createdAt' | 'rating'
  sortOrder?: 'asc' | 'desc'
}

export interface GetMerchantsResponse {
  merchants: Merchant[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const merchantsService = {
  // Get merchants
  async getMerchants(params: GetMerchantsParams = {}): Promise<GetMerchantsResponse> {
    const response = await api.get('/merchants', { params })
    return response.data
  },

  // Get single merchant
  async getMerchant(id: string): Promise<Merchant> {
    const response = await api.get(`/merchants/${id}`)
    // Handle different response structures from TransformInterceptor
    return response.data.data || response.data
  },

  // Get current merchant (for authenticated merchant)
  async getCurrentMerchant(): Promise<Merchant> {
    const response = await api.get('/merchants/me')
    console.log('Raw API response:', response)
    console.log('Response.data:', response.data)
    // TransformInterceptor wraps in { data }, axios unwraps one level
    // So: response.data = { data: merchantObject }
    const merchantData = response.data.data || response.data
    console.log('Extracted merchant data:', merchantData)
    return merchantData
  },

  // Create merchant
  async createMerchant(data: CreateMerchantRequest): Promise<Merchant> {
    const response = await api.post('/merchants', data)
    return response.data
  },

  // Update merchant
  async updateMerchant(id: string, data: UpdateMerchantRequest): Promise<Merchant> {
    const response = await api.patch(`/merchants/${id}`, data)
    return response.data
  },

  // Delete merchant
  async deleteMerchant(id: string): Promise<void> {
    await api.delete(`/merchants/${id}`)
  },

  // Search nearby merchants
  async searchNearbyMerchants(lat: number, lon: number, radius: number = 10): Promise<Merchant[]> {
    const response = await api.get('/merchants/nearby', {
      params: { lat, lon, radius }
    })
    return response.data
  },

  // Get merchant products
  async getMerchantProducts(merchantId: string, params: any = {}): Promise<any> {
    const response = await api.get(`/merchants/${merchantId}/products`, { params })
    return response.data
  },

  // Get merchant orders
  async getMerchantOrders(merchantId: string, params: any = {}): Promise<any> {
    const response = await api.get(`/merchants/${merchantId}/orders`, { params })
    return response.data
  },

  // Get merchant summary
  async getMerchantSummary(merchantId: string): Promise<any> {
    const response = await api.get(`/merchants/${merchantId}/summary`)
    return response.data
  },

  // Approve merchant
  async approveMerchant(id: string): Promise<Merchant> {
    const response = await api.post(`/merchants/${id}/approve`)
    return response.data
  },

  // Reject merchant
  async rejectMerchant(id: string, reason?: string): Promise<Merchant> {
    const response = await api.post(`/merchants/${id}/reject`, { reason })
    return response.data
  }
}
