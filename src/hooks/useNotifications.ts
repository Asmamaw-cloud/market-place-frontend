'use client'

import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import { 
  markAsRead, 
  markAllAsRead, 
  addNotification,
  clearAllNotifications
} from '@/store/slices/notificationsSlice'
import { notificationsApi } from '@/services'

export function useNotifications() {
  const dispatch = useAppDispatch()
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error 
  } = useAppSelector(state => state.notifications)

  // Load notifications on mount
  useEffect(() => {
    loadNotifications()
  }, [])

  // Note: Real-time notifications via Pusher can be added later if needed
  // For now, notifications are fetched via API

  const loadNotifications = useCallback(async (params?: {
    page?: number
    limit?: number
    type?: string
    read?: boolean
  }) => {
    try {
      const response = await notificationsApi.getNotifications(params || {})
      // For now, just add some mock notifications
      // In a real app, you'd dispatch an action to update the store
      console.log('Loaded notifications:', response)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }, [])

  const markNotificationAsRead = useCallback(async (id: string) => {
    try {
      dispatch(markAsRead(id))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw error
    }
  }, [dispatch])

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      dispatch(markAllAsRead())
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      throw error
    }
  }, [dispatch])

  const deleteNotificationById = useCallback(async (id: string) => {
    try {
      // For now, just remove from local state
      // In a real app, you'd call the API and then dispatch an action
      console.log('Delete notification:', id)
    } catch (error) {
      console.error('Failed to delete notification:', error)
      throw error
    }
  }, [])

  const getUnreadCount = useCallback(async () => {
    try {
      const response = await notificationsApi.getUnreadCount()
      return response.count
    } catch (error) {
      console.error('Failed to get unread count:', error)
      return 0
    }
  }, [])

  const createNotification = useCallback(async (data: {
    title: string
    message: string
    type: 'order' | 'message' | 'payment' | 'shipment' | 'general'
    userId?: string
    orderId?: string
    productId?: string
  }) => {
    try {
      // For now, just dispatch the notification to the store
      // In a real app, this would call an API endpoint
      dispatch(addNotification({
        id: Date.now().toString(),
        title: data.title,
        message: data.message,
        type: data.type,
        read: false,
        createdAt: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Failed to create notification:', error)
      throw error
    }
  }, [dispatch])

  const clearAllNotificationsData = useCallback(async () => {
    try {
      dispatch(clearAllNotifications())
    } catch (error) {
      console.error('Failed to clear all notifications:', error)
      throw error
    }
  }, [dispatch])

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    error,
    
    // Actions
    loadNotifications,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    deleteNotification: deleteNotificationById,
    clearAllNotifications: clearAllNotificationsData,
    getUnreadCount,
    createNotification,
    
    // Computed
    hasUnread: unreadCount > 0,
    recentNotifications: notifications.slice(0, 5)
  }
}
