import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import {
  fetchInventoryLots,
  createInventoryLot,
  updateInventoryLot,
  deleteInventoryLot,
  fetchInventoryMovements,
  fetchInventoryLocations,
  loadInventoryAnalytics,
  loadStockAlerts,
  clearError,
} from '@/store/slices/inventorySlice'

export function useInventory() {
  const dispatch = useAppDispatch()
  const { 
    lots, 
    movements, 
    locations, 
    analytics,
    alerts,
    isLoading, 
    error 
  } = useAppSelector(state => state.inventory)

  const loadInventoryLots = useCallback(() => {
    dispatch(fetchInventoryLots())
  }, [dispatch])

  const loadInventoryMovements = useCallback(() => {
    dispatch(fetchInventoryMovements())
  }, [dispatch])

  const loadInventoryLocations = useCallback(() => {
    dispatch(fetchInventoryLocations())
  }, [dispatch])

  const loadInventoryAnalyticsData = useCallback(async () => {
    try {
      const result = await dispatch(loadInventoryAnalytics()).unwrap()
      return result
    } catch (error) {
      console.error('Failed to load inventory analytics:', error)
      throw error
    }
  }, [dispatch])

  const loadStockAlertsData = useCallback(async () => {
    try {
      const result = await dispatch(loadStockAlerts()).unwrap()
      return result
    } catch (error) {
      console.error('Failed to load stock alerts:', error)
      throw error
    }
  }, [dispatch])

  const createInventoryLotData = useCallback(async (data: any) => {
    try {
      await dispatch(createInventoryLot(data)).unwrap()
    } catch (error) {
      console.error('Failed to create inventory lot:', error)
      throw error
    }
  }, [dispatch])

  const updateInventoryLotData = useCallback(async (lotId: string, data: any) => {
    try {
      await dispatch(updateInventoryLot({ lotId, data })).unwrap()
    } catch (error) {
      console.error('Failed to update inventory lot:', error)
      throw error
    }
  }, [dispatch])

  const deleteInventoryLotData = useCallback(async (lotId: string) => {
    try {
      await dispatch(deleteInventoryLot(lotId)).unwrap()
    } catch (error) {
      console.error('Failed to delete inventory lot:', error)
      throw error
    }
  }, [dispatch])

  return {
    // State
    lots,
    movements,
    locations,
    analytics,
    alerts,
    isLoading,
    error,
    // Actions
    loadInventoryLots,
    loadInventoryMovements,
    loadInventoryLocations,
    loadInventoryAnalytics: loadInventoryAnalyticsData,
    loadStockAlerts: loadStockAlertsData,
    createInventoryLot: createInventoryLotData,
    updateInventoryLot: updateInventoryLotData,
    deleteInventoryLot: deleteInventoryLotData,
    clearError: () => dispatch(clearError()),
  }
}
