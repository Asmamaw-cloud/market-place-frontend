export interface PriceAlert {
  id: string
  userId: string
  productId: string
  skuId: string
  currentPrice: number // ETB*100
  targetPrice: number // ETB*100
  isActive: boolean
  alertType: 'PRICE_DROP' | 'PRICE_RISE' | 'BOTH'
  notificationMethod: 'EMAIL' | 'SMS' | 'PUSH' | 'ALL'
  createdAt: string
  updatedAt: string
  triggeredAt?: string
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
    }[]
  }
}

export interface CreatePriceAlertRequest {
  productId: string
  skuId: string
  targetPrice: number
  alertType: 'PRICE_DROP' | 'PRICE_RISE' | 'BOTH'
  notificationMethod: 'EMAIL' | 'SMS' | 'PUSH' | 'ALL'
}

export interface UpdatePriceAlertRequest {
  targetPrice?: number
  alertType?: 'PRICE_DROP' | 'PRICE_RISE' | 'BOTH'
  notificationMethod?: 'EMAIL' | 'SMS' | 'PUSH' | 'ALL'
  isActive?: boolean
}

export interface PriceAlertNotification {
  id: string
  alertId: string
  productId: string
  oldPrice: number
  newPrice: number
  priceChange: number
  priceChangePercent: number
  message: string
  sentAt: string
  status: 'SENT' | 'FAILED' | 'PENDING'
}
