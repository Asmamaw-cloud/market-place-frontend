import api from './api'
import { Review, CreateReviewRequest, UpdateReviewRequest } from '@/types'

export interface GetReviewsParams {
  page?: number
  limit?: number
  productId?: string
  userId?: string
  rating?: number
  sortBy?: 'createdAt' | 'rating' | 'helpful'
  sortOrder?: 'asc' | 'desc'
}

export interface GetReviewsResponse {
  reviews: Review[]
  total: number
  page: number
  limit: number
  totalPages: number
  averageRating: number
  ratingDistribution: { [key: number]: number }
}

export const reviewsService = {
  // Get reviews
  async getReviews(params: GetReviewsParams = {}): Promise<GetReviewsResponse> {
    const response = await api.get('/reviews', { params })
    return response.data
  },

  // Get single review
  async getReview(id: string): Promise<Review> {
    const response = await api.get(`/reviews/${id}`)
    return response.data
  },

  // Create review
  async createReview(data: CreateReviewRequest): Promise<Review> {
    const response = await api.post('/reviews', data)
    return response.data
  },

  // Update review
  async updateReview(id: string, data: UpdateReviewRequest): Promise<Review> {
    const response = await api.patch(`/reviews/${id}`, data)
    return response.data
  },

  // Delete review
  async deleteReview(id: string): Promise<void> {
    await api.delete(`/reviews/${id}`)
  },

  // Vote on review (helpful/not helpful)
  async voteReview(id: string, helpful: boolean): Promise<Review> {
    const response = await api.post(`/reviews/${id}/vote`, { helpful })
    return response.data
  },

  // Get product reviews
  async getProductReviews(productId: string, params: Omit<GetReviewsParams, 'productId'> = {}): Promise<GetReviewsResponse> {
    const response = await api.get(`/products/${productId}/reviews`, { params })
    return response.data
  },

  // Get user reviews
  async getUserReviews(userId?: string, params: Omit<GetReviewsParams, 'userId'> = {}): Promise<GetReviewsResponse> {
    const response = await api.get('/reviews/my', { params })
    return response.data
  },

  // Report review
  async reportReview(id: string, reason: string, description?: string): Promise<void> {
    await api.post(`/reviews/${id}/report`, { reason, description })
  }
}
