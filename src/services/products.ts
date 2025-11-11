import api from '@/lib/api'
import { Product, Sku, CreateProductRequest, UpdateProductRequest } from '@/types'

export interface GetProductsParams {
  page?: number
  limit?: number
  category?: string
  search?: string
  merchantId?: string
  isActive?: boolean
  sortBy?: 'name' | 'createdAt' | 'price'
  sortOrder?: 'asc' | 'desc'
}

export interface GetProductsResponse {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const productsService = {
  // Get products with filters
  async getProducts(params: GetProductsParams & { merchant?: string } = {}): Promise<GetProductsResponse> {
    try {
      // If merchant is 'current', use the /me endpoint for authenticated merchant
      if (params.merchant === 'current') {
        const { merchant, ...restParams } = params
        console.log('[productsService] Fetching products for current merchant with params:', restParams)
        try {
          const response = await api.get('/products/me', { params: restParams })
          console.log('[productsService] Response received:', {
            status: response.status,
            hasData: !!response.data,
            hasDataData: !!response.data?.data,
            productsCount: response.data?.products?.length || response.data?.data?.products?.length || 0,
            responseKeys: Object.keys(response.data || {}),
            responseData: response.data
          })
          // Backend returns: { products: [], total: number, page: number, limit: number, totalPages: number }
          // After axios: response.data = { products: [], ... }
          const result = response.data.data || response.data
          if (!result.products && Array.isArray(result)) {
            // Handle case where backend returns array directly
            return { products: result, total: result.length, page: 1, limit: result.length, totalPages: 1 }
          }
          return result
        } catch (error: any) {
          console.error('[productsService] Error calling /products/me:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
          })
          // If 404, provide helpful error message
          if (error.response?.status === 404) {
            if (error.response?.data?.message?.includes('Route /products/me should match')) {
              throw new Error('Backend route registration issue. Please restart the backend server.')
            }
            throw new Error('Products endpoint not found. Please ensure you are logged in as a merchant.')
          }
          throw error
        }
      }
      // Otherwise use regular endpoint with merchantId
      const { merchant, merchantId, ...restParams } = params
      const response = await api.get('/products', { 
        params: { ...restParams, merchantId: merchantId || (merchant !== 'current' ? merchant : undefined) }
      })
      return response.data.data || response.data
    } catch (error: any) {
      console.error('[productsService] Error fetching products:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      throw error
    }
  },

  // Get single product
  async getProduct(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`)
    return response.data.data || response.data
  },

  // Create product
  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await api.post('/products', data)
    return response.data.data || response.data
  },

  // Update product
  async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
    const response = await api.patch(`/products/${id}`, data)
    return response.data.data || response.data
  },

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`)
  },

  // Get product SKUs
  async getProductSkus(productId: string): Promise<Sku[]> {
    const response = await api.get(`/products/${productId}/skus`)
    return response.data.data || response.data
  },

  // Create product SKU
  async createProductSku(productId: string, data: Partial<Sku>): Promise<Sku> {
    const response = await api.post(`/products/${productId}/skus`, data)
    return response.data.data || response.data
  },

  // Update product SKU
  async updateProductSku(productId: string, skuId: string, data: Partial<Sku>): Promise<Sku> {
    const response = await api.patch(`/products/${productId}/skus/${skuId}`, data)
    return response.data.data || response.data
  },

  // Delete product SKU
  async deleteProductSku(productId: string, skuId: string): Promise<void> {
    await api.delete(`/products/${productId}/skus/${skuId}`)
  },

  // Search products
  async searchProducts(query: string, params: Omit<GetProductsParams, 'search'> = {}): Promise<GetProductsResponse> {
    const response = await api.get('/products/search', { 
      params: { ...params, q: query } 
    })
    return response.data.data || response.data
  },

  // Get product reviews
  async getProductReviews(productId: string, params: { page?: number; limit?: number } = {}): Promise<any> {
    const response = await api.get(`/products/${productId}/reviews`, { params })
    return response.data.data || response.data
  },

  // Get product Q&A
  async getProductQnA(productId: string, params: { page?: number; limit?: number } = {}): Promise<any> {
    const response = await api.get(`/products/${productId}/qna`, { params })
    return response.data.data || response.data
  }
}
