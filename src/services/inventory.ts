import api from './api'

export const inventoryService = {
  // Mock service - would be implemented with real API calls
  async getInventoryLots(): Promise<any[]> {
    return []
  },

  async createInventoryLot(data: any): Promise<any> {
    return { lot: data }
  },

  async updateInventoryLot(lotId: string, data: any): Promise<any> {
    return { lotId, data }
  },

  async deleteInventoryLot(lotId: string): Promise<void> {
    return
  },

  async getInventoryMovements(): Promise<any[]> {
    return []
  },

  async getInventoryLocations(): Promise<any[]> {
    return []
  },

  async getInventoryAnalytics(): Promise<any> {
    return { analytics: {} }
  },

  async getStockAlerts(): Promise<any[]> {
    return []
  }
}
