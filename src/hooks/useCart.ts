import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import {
  fetchCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearError,
  clearCart,
  addItemOptimistic,
  removeItemOptimistic,
  updateItemOptimistic,
} from '@/store/slices/cartSlice'

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
      return dispatch(addToCart({ skuId, quantity }))
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

  const clearCartItems = useCallback(() => {
    dispatch(clearCart())
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

  // Load cart on mount if authenticated
  useEffect(() => {
    loadCart()
  }, [loadCart])

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
