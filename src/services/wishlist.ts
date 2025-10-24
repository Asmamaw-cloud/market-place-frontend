import api from './api'
import { Wishlist, WishlistItem, CreateWishlistRequest, AddToWishlistRequest, ShareWishlistRequest } from '@/types/wishlist'

export interface GetWishlistsParams {
  page?: number
  limit?: number
  isPublic?: boolean
}

export interface GetWishlistItemsParams {
  wishlistId: string
  page?: number
  limit?: number
}

export interface GetWishlistsResponse {
  wishlists: Wishlist[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface GetWishlistItemsResponse {
  items: WishlistItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const wishlistService = {
  // Get user's wishlists
  async getWishlists(params: GetWishlistsParams = {}): Promise<GetWishlistsResponse> {
    const response = await api.get('/wishlists', { params })
    return response.data
  },

  // Get single wishlist
  async getWishlist(wishlistId: string): Promise<Wishlist> {
    const response = await api.get(`/wishlists/${wishlistId}`)
    return response.data
  },

  // Get public wishlist by share code
  async getPublicWishlist(shareCode: string): Promise<Wishlist> {
    const response = await api.get(`/wishlists/public/${shareCode}`)
    return response.data
  },

  // Create new wishlist
  async createWishlist(data: CreateWishlistRequest): Promise<Wishlist> {
    const response = await api.post('/wishlists', data)
    return response.data
  },

  // Update wishlist
  async updateWishlist(wishlistId: string, data: Partial<CreateWishlistRequest>): Promise<Wishlist> {
    const response = await api.patch(`/wishlists/${wishlistId}`, data)
    return response.data
  },

  // Delete wishlist
  async deleteWishlist(wishlistId: string): Promise<void> {
    await api.delete(`/wishlists/${wishlistId}`)
  },

  // Share wishlist
  async shareWishlist(data: ShareWishlistRequest): Promise<{ shareCode: string; shareUrl: string }> {
    const response = await api.post('/wishlists/share', data)
    return response.data
  },

  // Add item to wishlist
  async addToWishlist(wishlistId: string, data: AddToWishlistRequest): Promise<WishlistItem> {
    const response = await api.post(`/wishlists/${wishlistId}/items`, data)
    return response.data
  },

  // Remove item from wishlist
  async removeFromWishlist(wishlistId: string, itemId: string): Promise<void> {
    await api.delete(`/wishlists/${wishlistId}/items/${itemId}`)
  },

  // Move item between wishlists
  async moveWishlistItem(itemId: string, fromWishlistId: string, toWishlistId: string): Promise<void> {
    await api.post(`/wishlists/${fromWishlistId}/items/${itemId}/move`, {
      toWishlistId
    })
  },

  // Update wishlist item
  async updateWishlistItem(wishlistId: string, itemId: string, data: { notes?: string }): Promise<WishlistItem> {
    const response = await api.patch(`/wishlists/${wishlistId}/items/${itemId}`, data)
    return response.data
  },

  // Get wishlist items
  async getWishlistItems(params: GetWishlistItemsParams): Promise<GetWishlistItemsResponse> {
    const response = await api.get(`/wishlists/${params.wishlistId}/items`, {
      params: { page: params.page, limit: params.limit }
    })
    return response.data
  },

  // Add item to cart from wishlist
  async addToCartFromWishlist(wishlistId: string, itemId: string, quantity: number): Promise<void> {
    await api.post(`/wishlists/${wishlistId}/items/${itemId}/add-to-cart`, {
      quantity
    })
  },

  // Check if product is in any wishlist
  async checkProductInWishlist(productId: string): Promise<{ inWishlist: boolean; wishlistIds: string[] }> {
    const response = await api.get(`/wishlists/check-product/${productId}`)
    return response.data
  }
}
