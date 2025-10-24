'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import { 
  fetchMerchants, 
  fetchMerchant, 
  createMerchant,
  updateMerchant, 
  deleteMerchant,
  approveMerchant,
  rejectMerchant
} from '@/store/slices/merchantsSlice'
import { merchantsApi } from '@/services'

export function useMerchants() {
  const dispatch = useAppDispatch()
  const { 
    merchants, 
    currentMerchant, 
    isLoading, 
    error,
    pagination 
  } = useAppSelector(state => state.merchants)

  const loadMerchants = useCallback(async (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    lat?: number
    lon?: number
    radiusKm?: number
  }) => {
    try {
      await dispatch(fetchMerchants(params || {})).unwrap()
    } catch (error) {
      console.error('Failed to load merchants:', error)
    }
  }, [dispatch])

  const loadMerchantById = useCallback(async (id: string) => {
    try {
      await dispatch(fetchMerchant(id)).unwrap()
    } catch (error) {
      console.error('Failed to load merchant:', error)
    }
  }, [dispatch])

  const createMerchantData = useCallback(async (data: any) => {
    try {
      await dispatch(createMerchant(data)).unwrap()
    } catch (error) {
      console.error('Failed to create merchant:', error)
      throw error
    }
  }, [dispatch])

  const updateMerchantData = useCallback(async (id: string, data: any) => {
    try {
      await dispatch(updateMerchant({ id, data })).unwrap()
    } catch (error) {
      console.error('Failed to update merchant:', error)
      throw error
    }
  }, [dispatch])

  const deleteMerchantData = useCallback(async (id: string) => {
    try {
      await dispatch(deleteMerchant(id)).unwrap()
    } catch (error) {
      console.error('Failed to delete merchant:', error)
      throw error
    }
  }, [dispatch])

  const approveMerchantData = useCallback(async (id: string) => {
    try {
      await dispatch(approveMerchant(id)).unwrap()
    } catch (error) {
      console.error('Failed to approve merchant:', error)
      throw error
    }
  }, [dispatch])

  const rejectMerchantData = useCallback(async (id: string, reason?: string) => {
    try {
      await dispatch(rejectMerchant({ merchantId: id, reason })).unwrap()
    } catch (error) {
      console.error('Failed to reject merchant:', error)
      throw error
    }
  }, [dispatch])

  const getMerchantStats = useCallback(async (merchantId: string) => {
    try {
      const response = await merchantsApi.getMerchantSummary(merchantId)
      return response
    } catch (error) {
      console.error('Failed to get merchant stats:', error)
      throw error
    }
  }, [])

  const searchNearbyMerchants = useCallback(async (params: {
    latitude: number
    longitude: number
    radius?: number
    category?: string
  }) => {
    try {
      const response = await merchantsApi.searchNearbyMerchants(params.latitude, params.longitude, params.radius)
      return response
    } catch (error) {
      console.error('Failed to search nearby merchants:', error)
      throw error
    }
  }, [])

  return {
    // State
    merchants,
    currentMerchant,
    isLoading,
    error,
    pagination,
    
    // Actions
    loadMerchants,
    fetchMerchants: loadMerchants,
    loadMerchantById,
    createMerchant: createMerchantData,
    updateMerchant: updateMerchantData,
    deleteMerchant: deleteMerchantData,
    approveMerchant: approveMerchantData,
    rejectMerchant: rejectMerchantData,
    getMerchantStats,
    searchNearbyMerchants,
    
    // Computed
    totalMerchants: pagination?.total || 0,
    hasMore: pagination ? pagination.hasMore : false
  }
}
