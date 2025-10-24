import api from './api'
import { Notification } from '@/types'

export interface GetNotificationsParams {
  page?: number
  limit?: number
  type?: string
  read?: boolean
  sortBy?: 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface GetNotificationsResponse {
  notifications: Notification[]
  total: number
  page: number
  limit: number
  totalPages: number
  unreadCount: number
}

export const notificationsService = {
  // Get notifications
  async getNotifications(params: GetNotificationsParams = {}): Promise<GetNotificationsResponse> {
    const response = await api.get('/notifications', { params })
    return response.data
  },

  // Get single notification
  async getNotification(id: string): Promise<Notification> {
    const response = await api.get(`/notifications/${id}`)
    return response.data
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<Notification> {
    const response = await api.patch(`/notifications/${id}/read`)
    return response.data
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/read-all')
  },

  // Delete notification
  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`)
  },

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    await api.delete('/notifications')
  },

  // Get unread count
  async getUnreadCount(): Promise<{ count: number }> {
    const response = await api.get('/notifications/unread-count')
    return response.data
  },

  // Update notification preferences
  async updatePreferences(preferences: any): Promise<any> {
    const response = await api.patch('/notifications/preferences', preferences)
    return response.data
  },

  // Get notification preferences
  async getPreferences(): Promise<any> {
    const response = await api.get('/notifications/preferences')
    return response.data
  }
}
