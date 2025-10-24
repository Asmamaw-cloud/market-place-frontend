import api from './api'
import { User, LoginResponse } from '@/types'

export interface RequestOTPRequest {
  email: string
}

export interface VerifyOTPRequest {
  email: string
  otp: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export const authService = {
  // Request OTP
  async requestOTP(data: RequestOTPRequest): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/auth/request-otp', data)
    return response.data
  },

  // Verify OTP and get tokens
  async verifyOTP(data: VerifyOTPRequest): Promise<LoginResponse & { user: User; success: boolean; message: string }> {
    const response = await api.post('/auth/verify-otp', data)
    return response.data
  },

  // Refresh access token
  async refreshToken(data: RefreshTokenRequest): Promise<{ accessToken: string }> {
    const response = await api.post('/auth/refresh', data)
    return response.data
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile')
    return response.data
  },

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch('/auth/profile', data)
    return response.data
  },

  // Logout
  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  // Revoke token
  async revokeToken(): Promise<void> {
    await api.post('/auth/revoke')
  }
}
