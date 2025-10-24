export interface GiftRegistry {
  id: string
  userId: string
  name: string
  description?: string
  eventType: 'BIRTHDAY' | 'WEDDING' | 'BABY_SHOWER' | 'ANNIVERSARY' | 'HOLIDAY' | 'OTHER'
  eventDate: string
  isPublic: boolean
  shareCode?: string
  shareUrl?: string
  createdAt: string
  updatedAt: string
  items: GiftRegistryItem[]
  totalItems: number
  purchasedItems: number
  totalValue: number
  purchasedValue: number
}

export interface GiftRegistryItem {
  id: string
  registryId: string
  productId: string
  skuId: string
  quantity: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  notes?: string
  isPurchased: boolean
  purchasedBy?: string
  purchasedAt?: string
  createdAt: string
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

export interface CreateGiftRegistryRequest {
  name: string
  description?: string
  eventType: 'BIRTHDAY' | 'WEDDING' | 'BABY_SHOWER' | 'ANNIVERSARY' | 'HOLIDAY' | 'OTHER'
  eventDate: string
  isPublic?: boolean
}

export interface AddToGiftRegistryRequest {
  productId: string
  skuId: string
  quantity: number
  priority?: 'HIGH' | 'MEDIUM' | 'LOW'
  notes?: string
}

export interface GiftWrapOption {
  id: string
  name: string
  description: string
  price: number // ETB*100
  image: string
  isAvailable: boolean
}

export interface GiftMessage {
  id: string
  orderId: string
  message: string
  fromName: string
  toName: string
  isPrivate: boolean
  createdAt: string
}

export interface CreateGiftMessageRequest {
  orderId: string
  message: string
  fromName: string
  toName: string
  isPrivate?: boolean
}
