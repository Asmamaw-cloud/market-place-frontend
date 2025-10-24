import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import {
  fetchPriceAlerts,
  createPriceAlert,
  updatePriceAlert,
  deletePriceAlert,
  togglePriceAlert,
  checkProductPriceAlert,
  getPriceHistory,
  clearError,
} from '@/store/slices/priceAlertsSlice'
import { CreatePriceAlertRequest, UpdatePriceAlertRequest } from '@/types/price-alerts'

export function usePriceAlerts() {
  const dispatch = useAppDispatch()
  const { 
    alerts, 
    isLoading, 
    error 
  } = useAppSelector(state => state.priceAlerts)

  const loadPriceAlerts = useCallback(() => {
    dispatch(fetchPriceAlerts())
  }, [dispatch])

  useEffect(() => {
    loadPriceAlerts()
  }, [loadPriceAlerts])

  const createPriceAlertData = useCallback(async (data: CreatePriceAlertRequest) => {
    try {
      await dispatch(createPriceAlert(data)).unwrap()
    } catch (error) {
      console.error('Failed to create price alert:', error)
      throw error
    }
  }, [dispatch])

  const updatePriceAlertData = useCallback(async (alertId: string, data: UpdatePriceAlertRequest) => {
    try {
      await dispatch(updatePriceAlert({ alertId, data })).unwrap()
    } catch (error) {
      console.error('Failed to update price alert:', error)
      throw error
    }
  }, [dispatch])

  const deletePriceAlertData = useCallback(async (alertId: string) => {
    try {
      await dispatch(deletePriceAlert(alertId)).unwrap()
    } catch (error) {
      console.error('Failed to delete price alert:', error)
      throw error
    }
  }, [dispatch])

  const togglePriceAlertData = useCallback(async (alertId: string) => {
    try {
      await dispatch(togglePriceAlert(alertId)).unwrap()
    } catch (error) {
      console.error('Failed to toggle price alert:', error)
      throw error
    }
  }, [dispatch])

  const checkProductPriceAlertData = useCallback(async (productId: string, skuId: string) => {
    try {
      const result = await dispatch(checkProductPriceAlert({ productId, skuId })).unwrap()
      return result
    } catch (error) {
      console.error('Failed to check product price alert:', error)
      throw error
    }
  }, [dispatch])

  const getPriceHistoryData = useCallback(async (productId: string, skuId: string, days: number = 30) => {
    try {
      const result = await dispatch(getPriceHistory({ productId, skuId, days })).unwrap()
      return result
    } catch (error) {
      console.error('Failed to get price history:', error)
      throw error
    }
  }, [dispatch])

  return {
    // State
    alerts,
    isLoading,
    error,
    // Actions
    loadPriceAlerts,
    createPriceAlert: createPriceAlertData,
    updatePriceAlert: updatePriceAlertData,
    deletePriceAlert: deletePriceAlertData,
    togglePriceAlert: togglePriceAlertData,
    checkProductPriceAlert: checkProductPriceAlertData,
    getPriceHistory: getPriceHistoryData,
    clearError: () => dispatch(clearError()),
  }
}
