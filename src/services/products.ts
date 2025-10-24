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
  async getProducts(params: GetProductsParams = {}): Promise<GetProductsResponse> {
    const response = await api.get('/products', { params })
    return response.data.data || response.data
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
