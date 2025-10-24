import api from './api'
import { Payment, CreatePaymentRequest, PaymentMethod } from '@/types'

export interface GetPaymentsParams {
  page?: number
  limit?: number
  status?: string
  method?: PaymentMethod
  orderId?: string
  sortBy?: 'createdAt' | 'amount'
  sortOrder?: 'asc' | 'desc'
}

export interface GetPaymentsResponse {
  payments: Payment[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const paymentsService = {
  // Get payments
  async getPayments(params: GetPaymentsParams = {}): Promise<GetPaymentsResponse> {
    const response = await api.get('/payments', { params })
    return response.data
  },

  // Get single payment
  async getPayment(id: string): Promise<Payment> {
    const response = await api.get(`/payments/${id}`)
    return response.data
  },

  // Create payment
  async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    const response = await api.post('/payments', data)
    return response.data
  },

  // Initiate payment
  async initiatePayment(orderId: string, method: PaymentMethod, data?: any): Promise<Payment> {
    const response = await api.post('/payments/initiate', {
      orderId,
      method,
      ...data
    })
    return response.data
  },

  // Capture payment
  async capturePayment(paymentId: string, data?: any): Promise<Payment> {
    const response = await api.post(`/payments/${paymentId}/capture`, data)
    return response.data
  },

  // Refund payment
  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<Payment> {
    const response = await api.post(`/payments/${paymentId}/refund`, {
      amount,
      reason
    })
    return response.data
  },

  // Cancel payment
  async cancelPayment(paymentId: string, reason?: string): Promise<Payment> {
    const response = await api.post(`/payments/${paymentId}/cancel`, { reason })
    return response.data
  },

  // Get payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await api.get('/payments/methods')
    return response.data
  },

  // Verify payment (for webhooks)
  async verifyPayment(paymentId: string, data: any): Promise<Payment> {
    const response = await api.post(`/payments/${paymentId}/verify`, data)
    return response.data
  },

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<{ status: string }> {
    const response = await api.get(`/payments/${paymentId}/status`)
    return response.data
  }
}
