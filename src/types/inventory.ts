export interface InventoryLot {
  id: string
  merchantId: string
  skuId: string
  quantity: number // in canonical units (e.g., kg)
  expiry?: string
  locationId?: string
  batchNumber?: string
  supplier?: string
  costPrice?: number // ETB*100
  createdAt: string
  updatedAt: string
  sku: {
    id: string
    name: string
    unitType: string
    unitIncrement: number
    product: {
      id: string
      name: string
      images: string[]
    }
  }
  location?: {
    id: string
    name: string
    address: string
  }
}

export interface InventoryMovement {
  id: string
  lotId: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER' | 'EXPIRED' | 'DAMAGED'
  quantity: number
  reason?: string
  reference?: string // Order ID, Transfer ID, etc.
  createdAt: string
  createdBy: string
  lot: InventoryLot
}

export interface InventoryLocation {
  id: string
  merchantId: string
  name: string
  address: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateInventoryLotRequest {
  skuId: string
  quantity: number
  expiry?: string
  locationId?: string
  batchNumber?: string
  supplier?: string
  costPrice?: number
}

export interface UpdateInventoryLotRequest {
  quantity?: number
  expiry?: string
  locationId?: string
  batchNumber?: string
  supplier?: string
  costPrice?: number
}

export interface CreateInventoryMovementRequest {
  lotId: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER' | 'EXPIRED' | 'DAMAGED'
  quantity: number
  reason?: string
  reference?: string
}

export interface InventoryAnalytics {
  totalValue: number
  totalQuantity: number
  lowStockItems: number
  expiredItems: number
  expiringSoonItems: number
  topSellingItems: Array<{
    skuId: string
    productName: string
    quantitySold: number
    revenue: number
  }>
  stockMovements: Array<{
    date: string
    in: number
    out: number
    net: number
  }>
  locationSummary: Array<{
    locationId: string
    locationName: string
    totalValue: number
    totalQuantity: number
  }>
}

export interface StockAlert {
  id: string
  skuId: string
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRING_SOON' | 'EXPIRED'
  message: string
  isRead: boolean
  createdAt: string
  sku: {
    id: string
    name: string
    unitType: string
    product: {
      id: string
      name: string
      images: string[]
    }
  }
}
