import api from './api'
import { CartItem, AddToCartRequest, UpdateCartItemRequest } from '@/types'

export interface GetCartResponse {
  items: CartItem[]
  totalAmount: number
  totalItems: number
}

export const cartService = {
  // Get cart
  async getCart(): Promise<GetCartResponse> {
    const response = await api.get('/cart')
    return response.data
  },

  // Add item to cart
  async addToCart(data: AddToCartRequest): Promise<CartItem> {
    const response = await api.post('/cart/items', data)
    return response.data
  },

  // Update cart item
  async updateCartItem(itemId: string, data: UpdateCartItemRequest): Promise<CartItem> {
    const response = await api.patch(`/cart/items/${itemId}`, data)
    return response.data
  },

  // Remove item from cart
  async removeFromCart(itemId: string): Promise<void> {
    await api.delete(`/cart/items/${itemId}`)
  },

  // Clear cart
  async clearCart(): Promise<void> {
    await api.delete('/cart')
  },

  // Get cart count
  async getCartCount(): Promise<{ count: number }> {
    const response = await api.get('/cart/count')
    return response.data
  }
}
