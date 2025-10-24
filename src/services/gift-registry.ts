import api from './api'
import { GiftRegistry, GiftRegistryItem, CreateGiftRegistryRequest, AddToGiftRegistryRequest, GiftWrapOption, GiftMessage, CreateGiftMessageRequest } from '@/types/gift-registry'

export interface GetGiftRegistriesParams {
  page?: number
  limit?: number
  eventType?: string
  isPublic?: boolean
}

export interface GetGiftRegistriesResponse {
  registries: GiftRegistry[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const giftRegistryService = {
  // Get user's gift registries
  async getGiftRegistries(params: GetGiftRegistriesParams = {}): Promise<GetGiftRegistriesResponse> {
    const response = await api.get('/gift-registries', { params })
    return response.data
  },

  // Get single gift registry
  async getGiftRegistry(registryId: string): Promise<GiftRegistry> {
    const response = await api.get(`/gift-registries/${registryId}`)
    return response.data
  },

  // Get public gift registry by share code
  async getPublicGiftRegistry(shareCode: string): Promise<GiftRegistry> {
    const response = await api.get(`/gift-registries/public/${shareCode}`)
    return response.data
  },

  // Create gift registry
  async createGiftRegistry(data: CreateGiftRegistryRequest): Promise<GiftRegistry> {
    const response = await api.post('/gift-registries', data)
    return response.data
  },

  // Update gift registry
  async updateGiftRegistry(registryId: string, data: Partial<CreateGiftRegistryRequest>): Promise<GiftRegistry> {
    const response = await api.patch(`/gift-registries/${registryId}`, data)
    return response.data
  },

  // Delete gift registry
  async deleteGiftRegistry(registryId: string): Promise<void> {
    await api.delete(`/gift-registries/${registryId}`)
  },

  // Share gift registry
  async shareGiftRegistry(registryId: string, isPublic: boolean): Promise<{ shareCode: string; shareUrl: string }> {
    const response = await api.post(`/gift-registries/${registryId}/share`, { isPublic })
    return response.data
  },

  // Add item to gift registry
  async addToGiftRegistry(registryId: string, data: AddToGiftRegistryRequest): Promise<GiftRegistryItem> {
    const response = await api.post(`/gift-registries/${registryId}/items`, data)
    return response.data
  },

  // Update gift registry item
  async updateGiftRegistryItem(registryId: string, itemId: string, data: {
    quantity?: number
    priority?: 'HIGH' | 'MEDIUM' | 'LOW'
    notes?: string
  }): Promise<GiftRegistryItem> {
    const response = await api.patch(`/gift-registries/${registryId}/items/${itemId}`, data)
    return response.data
  },

  // Remove item from gift registry
  async removeFromGiftRegistry(registryId: string, itemId: string): Promise<void> {
    await api.delete(`/gift-registries/${registryId}/items/${itemId}`)
  },

  // Mark item as purchased
  async markItemAsPurchased(registryId: string, itemId: string, purchasedBy: string): Promise<GiftRegistryItem> {
    const response = await api.post(`/gift-registries/${registryId}/items/${itemId}/purchase`, {
      purchasedBy
    })
    return response.data
  },

  // Get gift wrap options
  async getGiftWrapOptions(): Promise<GiftWrapOption[]> {
    const response = await api.get('/gift-registries/gift-wrap-options')
    return response.data
  },

  // Create gift message
  async createGiftMessage(data: CreateGiftMessageRequest): Promise<GiftMessage> {
    const response = await api.post('/gift-registries/gift-messages', data)
    return response.data
  },

  // Get gift messages for order
  async getGiftMessages(orderId: string): Promise<GiftMessage[]> {
    const response = await api.get(`/gift-registries/gift-messages/order/${orderId}`)
    return response.data
  },

  // Search public gift registries
  async searchPublicGiftRegistries(params: {
    query?: string
    eventType?: string
    page?: number
    limit?: number
  }): Promise<GetGiftRegistriesResponse> {
    const response = await api.get('/gift-registries/search', { params })
    return response.data
  },

  // Get gift registry analytics
  async getGiftRegistryAnalytics(registryId: string): Promise<{
    totalViews: number
    totalPurchases: number
    totalValue: number
    purchasedValue: number
    completionRate: number
    topPurchasers: Array<{
      name: string
      totalPurchased: number
      itemCount: number
    }>
  }> {
    const response = await api.get(`/gift-registries/${registryId}/analytics`)
    return response.data
  }
}
