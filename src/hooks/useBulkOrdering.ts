import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import {
  fetchBulkOrders,
  createBulkOrder,
  updateBulkOrder,
  deleteBulkOrder,
  fetchGroupBuys,
  createGroupBuy,
  joinGroupBuy,
  getBulkOrderQuote,
  clearError,
} from '@/store/slices/bulkOrderingSlice'

export function useBulkOrdering() {
  const dispatch = useAppDispatch()
  const { 
    bulkOrders, 
    groupBuys, 
    quotes,
    isLoading, 
    error 
  } = useAppSelector(state => state.bulkOrdering)

  const loadBulkOrderData = useCallback(() => {
    dispatch(fetchBulkOrders())
    dispatch(fetchGroupBuys())
  }, [dispatch])

  useEffect(() => {
    loadBulkOrderData()
  }, [loadBulkOrderData])

  const createBulkOrderData = useCallback(async (data: any) => {
    try {
      await dispatch(createBulkOrder(data)).unwrap()
    } catch (error) {
      console.error('Failed to create bulk order:', error)
      throw error
    }
  }, [dispatch])

  const updateBulkOrderData = useCallback(async (orderId: string, data: any) => {
    try {
      await dispatch(updateBulkOrder({ orderId, data })).unwrap()
    } catch (error) {
      console.error('Failed to update bulk order:', error)
      throw error
    }
  }, [dispatch])

  const deleteBulkOrderData = useCallback(async (orderId: string) => {
    try {
      await dispatch(deleteBulkOrder(orderId)).unwrap()
    } catch (error) {
      console.error('Failed to delete bulk order:', error)
      throw error
    }
  }, [dispatch])

  const getBulkOrdersData = useCallback(async () => {
    try {
      const result = await dispatch(fetchBulkOrders()).unwrap()
      return result
    } catch (error) {
      console.error('Failed to get bulk orders:', error)
      throw error
    }
  }, [dispatch])

  const getGroupBuysData = useCallback(async () => {
    try {
      const result = await dispatch(fetchGroupBuys()).unwrap()
      return result
    } catch (error) {
      console.error('Failed to get group buys:', error)
      throw error
    }
  }, [dispatch])

  const createGroupBuyData = useCallback(async (data: any) => {
    try {
      const result = await dispatch(createGroupBuy(data)).unwrap()
      return result
    } catch (error) {
      console.error('Failed to create group buy:', error)
      throw error
    }
  }, [dispatch])

  const joinGroupBuyData = useCallback(async (groupBuyId: string, data: any) => {
    try {
      await dispatch(joinGroupBuy({ groupBuyId, data })).unwrap()
    } catch (error) {
      console.error('Failed to join group buy:', error)
      throw error
    }
  }, [dispatch])

  const getBulkOrderQuoteData = useCallback(async (data: any) => {
    try {
      const result = await dispatch(getBulkOrderQuote(data)).unwrap()
      return result
    } catch (error) {
      console.error('Failed to get bulk order quote:', error)
      throw error
    }
  }, [dispatch])

  return {
    // State
    bulkOrders,
    groupBuys,
    quotes,
    isLoading,
    error,
    // Actions
    loadBulkOrderData,
    createBulkOrder: createBulkOrderData,
    updateBulkOrder: updateBulkOrderData,
    deleteBulkOrder: deleteBulkOrderData,
    getBulkOrders: getBulkOrdersData,
    getGroupBuys: getGroupBuysData,
    createGroupBuy: createGroupBuyData,
    joinGroupBuy: joinGroupBuyData,
    getBulkOrderQuote: getBulkOrderQuoteData,
    clearError: () => dispatch(clearError()),
  }
}
