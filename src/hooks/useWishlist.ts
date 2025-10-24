import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import {
  fetchWishlists,
  createWishlist,
  updateWishlist,
  deleteWishlist,
  addToWishlist,
  removeFromWishlist,
  moveWishlistItem,
  updateWishlistItem,
  shareWishlist,
  addToCartFromWishlist,
  checkProductInWishlist,
  clearError,
} from '@/store/slices/wishlistSlice'
import { CreateWishlistRequest, AddToWishlistRequest, ShareWishlistRequest } from '@/types/wishlist'

export function useWishlist() {
  const dispatch = useAppDispatch()
  const { 
    wishlists, 
    currentWishlist,
    isLoading, 
    error 
  } = useAppSelector(state => state.wishlist)

  const loadWishlists = useCallback(() => {
    dispatch(fetchWishlists())
  }, [dispatch])

  useEffect(() => {
    loadWishlists()
  }, [loadWishlists])

  const createWishlistData = useCallback(async (data: CreateWishlistRequest) => {
    try {
      await dispatch(createWishlist(data)).unwrap()
    } catch (error) {
      console.error('Failed to create wishlist:', error)
      throw error
    }
  }, [dispatch])

  const updateWishlistData = useCallback(async (wishlistId: string, data: Partial<CreateWishlistRequest>) => {
    try {
      await dispatch(updateWishlist({ wishlistId, data })).unwrap()
    } catch (error) {
      console.error('Failed to update wishlist:', error)
      throw error
    }
  }, [dispatch])

  const deleteWishlistData = useCallback(async (wishlistId: string) => {
    try {
      await dispatch(deleteWishlist(wishlistId)).unwrap()
    } catch (error) {
      console.error('Failed to delete wishlist:', error)
      throw error
    }
  }, [dispatch])

  const addToWishlistData = useCallback(async (wishlistId: string, data: AddToWishlistRequest) => {
    try {
      await dispatch(addToWishlist({ wishlistId, data })).unwrap()
    } catch (error) {
      console.error('Failed to add to wishlist:', error)
      throw error
    }
  }, [dispatch])

  const removeFromWishlistData = useCallback(async (wishlistId: string, itemId: string) => {
    try {
      await dispatch(removeFromWishlist({ wishlistId, itemId })).unwrap()
    } catch (error) {
      console.error('Failed to remove from wishlist:', error)
      throw error
    }
  }, [dispatch])

  const moveWishlistItemData = useCallback(async (itemId: string, fromWishlistId: string, toWishlistId: string) => {
    try {
      await dispatch(moveWishlistItem({ itemId, fromWishlistId, toWishlistId })).unwrap()
    } catch (error) {
      console.error('Failed to move wishlist item:', error)
      throw error
    }
  }, [dispatch])

  const updateWishlistItemData = useCallback(async (wishlistId: string, itemId: string, data: { notes?: string }) => {
    try {
      await dispatch(updateWishlistItem({ wishlistId, itemId, data })).unwrap()
    } catch (error) {
      console.error('Failed to update wishlist item:', error)
      throw error
    }
  }, [dispatch])

  const shareWishlistData = useCallback(async (data: ShareWishlistRequest) => {
    try {
      const result = await dispatch(shareWishlist(data)).unwrap()
      return result
    } catch (error) {
      console.error('Failed to share wishlist:', error)
      throw error
    }
  }, [dispatch])

  const addToCartFromWishlistData = useCallback(async (wishlistId: string, itemId: string, quantity: number) => {
    try {
      await dispatch(addToCartFromWishlist({ wishlistId, itemId, quantity })).unwrap()
    } catch (error) {
      console.error('Failed to add to cart from wishlist:', error)
      throw error
    }
  }, [dispatch])

  const checkProductInWishlistData = useCallback(async (productId: string) => {
    try {
      const result = await dispatch(checkProductInWishlist(productId)).unwrap()
      return result
    } catch (error) {
      console.error('Failed to check product in wishlist:', error)
      throw error
    }
  }, [dispatch])

  return {
    // State
    wishlists,
    currentWishlist,
    isLoading,
    error,
    // Actions
    loadWishlists,
    createWishlist: createWishlistData,
    updateWishlist: updateWishlistData,
    deleteWishlist: deleteWishlistData,
    addToWishlist: addToWishlistData,
    removeFromWishlist: removeFromWishlistData,
    moveWishlistItem: moveWishlistItemData,
    updateWishlistItem: updateWishlistItemData,
    shareWishlist: shareWishlistData,
    addToCartFromWishlist: addToCartFromWishlistData,
    checkProductInWishlist: checkProductInWishlistData,
    clearError: () => dispatch(clearError()),
  }
}
