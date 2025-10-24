import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import {
  fetchOrders,
  fetchOrder,
  createOrder,
  updateOrderStatus,
  setFilters,
  setPagination,
  clearError,
} from '@/store/slices/ordersSlice'

export const useOrders = () => {
  const dispatch = useAppDispatch()
  const {
    orders,
    currentOrder,
    filters,
    pagination,
    isLoading,
    error,
  } = useAppSelector(state => state.orders)

  const loadOrders = useCallback(
    (params: {
      status?: string
      page?: number
      limit?: number
    } = {}) => {
      return dispatch(fetchOrders(params))
    },
    [dispatch]
  )

  const loadOrder = useCallback(
    (id: string) => {
      return dispatch(fetchOrder(id))
    },
    [dispatch]
  )

  const createOrderAction = useCallback(
    (data: { addressId: string; paymentProvider: string }) => {
      return dispatch(createOrder(data))
    },
    [dispatch]
  )

  const updateOrder = useCallback(
    (id: string, status: string) => {
      return dispatch(updateOrderStatus({ id, status }))
    },
    [dispatch]
  )

  const setFiltersAction = useCallback(
    (newFilters: Partial<typeof filters>) => {
      dispatch(setFilters(newFilters))
    },
    [dispatch]
  )

  const setPaginationAction = useCallback(
    (newPagination: Partial<typeof pagination>) => {
      dispatch(setPagination(newPagination))
    },
    [dispatch]
  )

  const clearErrorAction = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  return {
    orders,
    currentOrder,
    filters,
    pagination,
    isLoading,
    error,
    loadOrders,
    fetchOrders: loadOrders,
    loadOrder,
    createOrder: createOrderAction,
    updateOrder,
    setFilters: setFiltersAction,
    setPagination: setPaginationAction,
    clearError: clearErrorAction,
  }
}
