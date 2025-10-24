import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import {
  fetchGiftRegistries,
  createGiftRegistry,
  updateGiftRegistry,
  deleteGiftRegistry,
  shareGiftRegistry,
  addToGiftRegistry,
  removeFromGiftRegistry,
  updateGiftRegistryItem,
  clearError,
} from '@/store/slices/giftRegistrySlice'
import { CreateGiftRegistryRequest, AddToGiftRegistryRequest } from '@/types/gift-registry'

export function useGiftRegistry() {
  const dispatch = useAppDispatch()
  const { 
    registries, 
    currentRegistry,
    isLoading, 
    error 
  } = useAppSelector(state => state.giftRegistry)

  const loadGiftRegistries = useCallback(() => {
    dispatch(fetchGiftRegistries())
  }, [dispatch])

  useEffect(() => {
    loadGiftRegistries()
  }, [loadGiftRegistries])

  const createGiftRegistryData = useCallback(async (data: CreateGiftRegistryRequest) => {
    try {
      await dispatch(createGiftRegistry(data)).unwrap()
    } catch (error) {
      console.error('Failed to create gift registry:', error)
      throw error
    }
  }, [dispatch])

  const updateGiftRegistryData = useCallback(async (registryId: string, data: Partial<CreateGiftRegistryRequest>) => {
    try {
      await dispatch(updateGiftRegistry({ registryId, data })).unwrap()
    } catch (error) {
      console.error('Failed to update gift registry:', error)
      throw error
    }
  }, [dispatch])

  const deleteGiftRegistryData = useCallback(async (registryId: string) => {
    try {
      await dispatch(deleteGiftRegistry(registryId)).unwrap()
    } catch (error) {
      console.error('Failed to delete gift registry:', error)
      throw error
    }
  }, [dispatch])

  const shareGiftRegistryData = useCallback(async (registryId: string, isPublic: boolean) => {
    try {
      const result = await dispatch(shareGiftRegistry({ registryId, isPublic })).unwrap()
      return result
    } catch (error) {
      console.error('Failed to share gift registry:', error)
      throw error
    }
  }, [dispatch])

  const addToGiftRegistryData = useCallback(async (registryId: string, data: AddToGiftRegistryRequest) => {
    try {
      await dispatch(addToGiftRegistry({ registryId, data })).unwrap()
    } catch (error) {
      console.error('Failed to add to gift registry:', error)
      throw error
    }
  }, [dispatch])

  const removeFromGiftRegistryData = useCallback(async (registryId: string, itemId: string) => {
    try {
      await dispatch(removeFromGiftRegistry({ registryId, itemId })).unwrap()
    } catch (error) {
      console.error('Failed to remove from gift registry:', error)
      throw error
    }
  }, [dispatch])

  const updateGiftRegistryItemData = useCallback(async (registryId: string, itemId: string, data: {
    quantity?: number
    priority?: 'HIGH' | 'MEDIUM' | 'LOW'
    notes?: string
  }) => {
    try {
      await dispatch(updateGiftRegistryItem({ registryId, itemId, data })).unwrap()
    } catch (error) {
      console.error('Failed to update gift registry item:', error)
      throw error
    }
  }, [dispatch])

  return {
    // State
    registries,
    currentRegistry,
    isLoading,
    error,
    // Actions
    loadGiftRegistries,
    createGiftRegistry: createGiftRegistryData,
    updateGiftRegistry: updateGiftRegistryData,
    deleteGiftRegistry: deleteGiftRegistryData,
    shareGiftRegistry: shareGiftRegistryData,
    addToGiftRegistry: addToGiftRegistryData,
    removeFromGiftRegistry: removeFromGiftRegistryData,
    updateGiftRegistryItem: updateGiftRegistryItemData,
    clearError: () => dispatch(clearError()),
  }
}
