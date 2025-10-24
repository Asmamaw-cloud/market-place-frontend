import api from './api'
import { Address, CreateAddressRequest, UpdateAddressRequest } from '@/types'

export const addressesService = {
  // Get user addresses
  async getAddresses(): Promise<Address[]> {
    const response = await api.get('/addresses')
    return response.data
  },

  // Get single address
  async getAddress(id: string): Promise<Address> {
    const response = await api.get(`/addresses/${id}`)
    return response.data
  },

  // Create address
  async createAddress(data: CreateAddressRequest): Promise<Address> {
    const response = await api.post('/addresses', data)
    return response.data
  },

  // Update address
  async updateAddress(id: string, data: UpdateAddressRequest): Promise<Address> {
    const response = await api.patch(`/addresses/${id}`, data)
    return response.data
  },

  // Delete address
  async deleteAddress(id: string): Promise<void> {
    await api.delete(`/addresses/${id}`)
  },

  // Set default address
  async setDefaultAddress(id: string): Promise<Address> {
    const response = await api.post(`/addresses/${id}/default`)
    return response.data
  },

  // Get default address
  async getDefaultAddress(): Promise<Address | null> {
    const response = await api.get('/addresses/default')
    return response.data
  }
}
