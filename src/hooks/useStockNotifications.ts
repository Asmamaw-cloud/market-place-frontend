import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import {
  fetchStockNotifications,
  createStockNotification,
  updateStockNotification,
  deleteStockNotification,
  toggleStockNotification,
  checkProductStockNotification,
  getStockStatus,
  clearError,
} from '@/store/slices/stockNotificationsSlice'
import { CreateStockNotificationRequest } from '@/types/stock-notifications'

export function useStockNotifications() {
  const dispatch = useAppDispatch()
  const { 
    notifications, 
    isLoading, 
    error 
  } = useAppSelector(state => state.stockNotifications)

  const loadStockNotifications = useCallback(() => {
    dispatch(fetchStockNotifications())
  }, [dispatch])

  useEffect(() => {
    loadStockNotifications()
  }, [loadStockNotifications])

  const createStockNotificationData = useCallback(async (data: CreateStockNotificationRequest) => {
    try {
      await dispatch(createStockNotification(data)).unwrap()
    } catch (error) {
      console.error('Failed to create stock notification:', error)
      throw error
    }
  }, [dispatch])

  const updateStockNotificationData = useCallback(async (notificationId: string, data: {
    notificationMethod?: 'EMAIL' | 'SMS' | 'PUSH' | 'ALL'
    isActive?: boolean
  }) => {
    try {
      await dispatch(updateStockNotification({ notificationId, data })).unwrap()
    } catch (error) {
      console.error('Failed to update stock notification:', error)
      throw error
    }
  }, [dispatch])

  const deleteStockNotificationData = useCallback(async (notificationId: string) => {
    try {
      await dispatch(deleteStockNotification(notificationId)).unwrap()
    } catch (error) {
      console.error('Failed to delete stock notification:', error)
      throw error
    }
  }, [dispatch])

  const toggleStockNotificationData = useCallback(async (notificationId: string) => {
    try {
      await dispatch(toggleStockNotification(notificationId)).unwrap()
    } catch (error) {
      console.error('Failed to toggle stock notification:', error)
      throw error
    }
  }, [dispatch])

  const checkProductStockNotificationData = useCallback(async (productId: string, skuId: string) => {
    try {
      const result = await dispatch(checkProductStockNotification({ productId, skuId })).unwrap()
      return result
    } catch (error) {
      console.error('Failed to check product stock notification:', error)
      throw error
    }
  }, [dispatch])

  const getStockStatusData = useCallback(async (productId: string, skuId: string) => {
    try {
      const result = await dispatch(getStockStatus({ productId, skuId })).unwrap()
      return result
    } catch (error) {
      console.error('Failed to get stock status:', error)
      throw error
    }
  }, [dispatch])

  return {
    // State
    notifications,
    isLoading,
    error,
    // Actions
    loadStockNotifications,
    createStockNotification: createStockNotificationData,
    updateStockNotification: updateStockNotificationData,
    deleteStockNotification: deleteStockNotificationData,
    toggleStockNotification: toggleStockNotificationData,
    checkProductStockNotification: checkProductStockNotificationData,
    getStockStatus: getStockStatusData,
    clearError: () => dispatch(clearError()),
  }
}
