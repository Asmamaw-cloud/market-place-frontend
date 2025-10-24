export interface BulkOrder {
  id: string
  userId: string
  merchantId: string
  items: BulkOrderItem[]
  totalAmount: number // ETB*100
  status: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  notes?: string
  requestedDeliveryDate?: string
  createdAt: string
  updatedAt: string
  merchant: {
    id: string
    displayName: string
    contactInfo: string
  }
}

export interface BulkOrderItem {
  id: string
  productId: string
  skuId: string
  quantity: number
  unitPrice: number // ETB*100
  totalPrice: number // ETB*100
  notes?: string
  product: {
    id: string
    name: string
    images: string[]
    skus: {
      id: string
      name: string
      unitType: string
      unitIncrement: number
      pricePerCanonicalUnit: number
      currency: string
    }[]
  }
}

export interface GroupBuy {
  id: string
  productId: string
  skuId: string
  merchantId: string
  initiatorId: string
  targetQuantity: number
  currentQuantity: number
  unitPrice: number // ETB*100
  discountPercentage: number
  status: 'ACTIVE' | 'FULFILLED' | 'EXPIRED' | 'CANCELLED'
  expiresAt: string
  createdAt: string
  participants: GroupBuyParticipant[]
  product: {
    id: string
    name: string
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
    }[]
  }
}

export interface GroupBuyParticipant {
  id: string
  userId: string
  quantity: number
  totalAmount: number // ETB*100
  status: 'PENDING' | 'PAID' | 'CANCELLED'
  joinedAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export interface CreateBulkOrderRequest {
  merchantId: string
  items: Array<{
    productId: string
    skuId: string
    quantity: number
    notes?: string
  }>
  notes?: string
  requestedDeliveryDate?: string
}

export interface CreateGroupBuyRequest {
  productId: string
  skuId: string
  targetQuantity: number
  discountPercentage: number
  expiresAt: string
}

export interface JoinGroupBuyRequest {
  quantity: number
}

export interface BulkOrderQuote {
  merchantId: string
  items: Array<{
    productId: string
    skuId: string
    quantity: number
    unitPrice: number
    totalPrice: number
    available: boolean
    stockQuantity?: number
  }>
  subtotal: number
  discount: number
  totalAmount: number
  estimatedDelivery: string
  merchant: {
    id: string
    displayName: string
    rating: number
    deliveryTime: string
  }
}

export interface BulkOrderAnalytics {
  totalOrders: number
  totalValue: number
  averageOrderValue: number
  topProducts: Array<{
    productId: string
    productName: string
    totalQuantity: number
    totalValue: number
  }>
  monthlyTrends: Array<{
    month: string
    orders: number
    value: number
  }>
}
