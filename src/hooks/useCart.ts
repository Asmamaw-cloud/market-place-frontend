import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import {
  fetchCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearError,
  clearCart,
  clearCartAsync,
  addItemOptimistic,
  removeItemOptimistic,
  updateItemOptimistic,
  incrementTotalItemsOptimistic,
} from '@/store/slices/cartSlice'

// Module-level flag to track if cart has been loaded (shared across all useCart instances)
let cartLoadInitiated = false

export const useCart = () => {
  const dispatch = useAppDispatch()
  const { items, totalItems, totalAmount, isLoading, error } = useAppSelector(
    state => state.cart
  )

  const loadCart = useCallback(() => {
    return dispatch(fetchCart())
  }, [dispatch])

  const addItem = useCallback(
    (skuId: string, quantity: number) => {
      // Optimistically bump the navbar cart count if it's a new product
      // Pass skuId so we can check if product already exists
      dispatch(incrementTotalItemsOptimistic(skuId))
      return dispatch(addToCart({ skuId, quantity }))
        .unwrap()
        .then(() => {
          // Sync authoritative cart from server and notify other tabs
          dispatch(fetchCart())
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem('cart:sync', String(Date.now()))
            }
          } catch {}
        })
        .catch((err) => {
          // On failure, re-fetch to revert optimistic state to server truth
          dispatch(fetchCart())
          throw err
        })
    },
    [dispatch]
  )

  const removeItem = useCallback(
    (itemId: string) => {
      return dispatch(removeFromCart(itemId))
    },
    [dispatch]
  )

  const updateItem = useCallback(
    (itemId: string, quantity: number) => {
      return dispatch(updateCartItem({ itemId, quantity }))
    },
    [dispatch]
  )

  const clearCartItems = useCallback(async () => {
    // Call the async thunk to clear cart from database
    await dispatch(clearCartAsync()).unwrap()
    // Also clear local state immediately for instant UI feedback
    dispatch(clearCart())
    // Reset the load flag so cart can be reloaded after clearing
    cartLoadInitiated = false
  }, [dispatch])

  const clearErrorState = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  // Optimistic updates
  const addItemOptimisticUpdate = useCallback(
    (item: any) => {
      dispatch(addItemOptimistic(item))
    },
    [dispatch]
  )

  const removeItemOptimisticUpdate = useCallback(
    (itemId: string) => {
      dispatch(removeItemOptimistic(itemId))
    },
    [dispatch]
  )

  const updateItemOptimisticUpdate = useCallback(
    (itemId: string, quantity: number) => {
      dispatch(updateItemOptimistic({ itemId, quantity }))
    },
    [dispatch]
  )

  // Load cart on mount and listen for cross-tab cart sync
  // Use module-level flag to prevent infinite loops - only load once globally
  useEffect(() => {
    // Only load once globally across all useCart instances
    // Set flag BEFORE dispatching to make it atomic and prevent race conditions
    if (!cartLoadInitiated) {
      cartLoadInitiated = true
      dispatch(fetchCart()).catch(() => {
        // If fetch fails, reset flag so we can retry
        cartLoadInitiated = false
      })
    }
    
    const onStorage = (e: StorageEvent) => {
      // Only reload on storage events from other tabs (not our own)
      // This handles cross-tab synchronization
      if (e.key === 'cart:sync' && e.newValue) {
        dispatch(fetchCart())
      }
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage)
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - only run once per component mount

  const getItemQuantity = useCallback(
    (skuId: string) => {
      const item = items.find(item => item.skuId === skuId)
      return item ? item.quantity : 0
    },
    [items]
  )

  const getItemById = useCallback(
    (itemId: string) => {
      return items.find(item => item.id === itemId)
    },
    [items]
  )

  const isEmpty = items.length === 0

  return {
    items,
    totalItems,
    totalAmount,
    isLoading,
    error,
    isEmpty,
    loadCart,
    addItem,
    removeItem,
    updateItem,
    clearCart: clearCartItems,
    clearError: clearErrorState,
    addItemOptimistic: addItemOptimisticUpdate,
    removeItemOptimistic: removeItemOptimisticUpdate,
    updateItemOptimistic: updateItemOptimisticUpdate,
    getItemQuantity,
    getItemById,
  }
}
