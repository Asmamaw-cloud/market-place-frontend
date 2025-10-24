export interface StockNotification {
  id: string
  userId: string
  productId: string
  skuId: string
  isActive: boolean
  notificationMethod: 'EMAIL' | 'SMS' | 'PUSH' | 'ALL'
  createdAt: string
  updatedAt: string
  notifiedAt?: string
  product: {
    id: string
    name: string
    slug: string
    images: string[]
    merchant: {
      id: string
      displayName: string
    }
    skus: {
      id: string
      name: string
      unitType: string
      unitIncrement: number
      pricePerCanonicalUnit: number
      currency: string
      active: boolean
      stockQuantity?: number
    }[]
  }
}

export interface CreateStockNotificationRequest {
  productId: string
  skuId: string
  notificationMethod: 'EMAIL' | 'SMS' | 'PUSH' | 'ALL'
}

export interface StockNotificationAlert {
  id: string
  notificationId: string
  productId: string
  skuId: string
  message: string
  sentAt: string
  status: 'SENT' | 'FAILED' | 'PENDING'
  method: 'EMAIL' | 'SMS' | 'PUSH'
}

export interface StockStatus {
  productId: string
  skuId: string
  isInStock: boolean
  stockQuantity: number
  lastUpdated: string
}
