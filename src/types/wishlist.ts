export interface WishlistItem {
  id: string
  userId: string
  productId: string
  skuId: string
  addedAt: string
  notes?: string
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

export interface Wishlist {
  id: string
  userId: string
  name: string
  description?: string
  isPublic: boolean
  shareCode?: string
  items: WishlistItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateWishlistRequest {
  name: string
  description?: string
  isPublic?: boolean
}

export interface AddToWishlistRequest {
  productId: string
  skuId: string
  notes?: string
}

export interface ShareWishlistRequest {
  wishlistId: string
  isPublic: boolean
}
