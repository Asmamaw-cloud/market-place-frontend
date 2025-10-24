import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import {
  fetchProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories,
  setSearchQuery,
  setFilters,
  setPagination,
  clearError,
} from '@/store/slices/productsSlice'

export const useProducts = () => {
  const dispatch = useAppDispatch()
  const {
    products,
    categories,
    currentProduct,
    searchQuery,
    filters,
    pagination,
    isLoading,
    error,
  } = useAppSelector(state => state.products)

  const loadProducts = useCallback(
    (params: {
      q?: string
      category?: string
      merchant?: string
      page?: number
      limit?: number
      minPrice?: number
      maxPrice?: number
      unitType?: string
      rating?: number
    } = {}) => {
      return dispatch(fetchProducts(params))
    },
    [dispatch]
  )

  const loadProduct = useCallback(
    (id: string) => {
      return dispatch(fetchProduct(id))
    },
    [dispatch]
  )

  const loadCategories = useCallback(() => {
    return dispatch(fetchCategories())
  }, [dispatch])

  const setSearchQueryAction = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query))
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

  const createProductData = useCallback(async (productData: any) => {
    try {
      const response = await dispatch(createProduct(productData)).unwrap()
      loadProducts() // Refresh the list after creation
      return response
    } catch (error) {
      console.error('Failed to create product:', error)
      throw error
    }
  }, [dispatch, loadProducts])

  const updateProductData = useCallback(async (id: string, productData: any) => {
    try {
      const response = await dispatch(updateProduct({ id, data: productData })).unwrap()
      loadProduct(id) // Refresh the current product
      return response
    } catch (error) {
      console.error(`Failed to update product ${id}:`, error)
      throw error
    }
  }, [dispatch, loadProduct])

  const deleteProductData = useCallback(async (id: string) => {
    try {
      await dispatch(deleteProduct(id)).unwrap()
      loadProducts() // Refresh the list after deletion
    } catch (error) {
      console.error(`Failed to delete product ${id}:`, error)
      throw error
    }
  }, [dispatch, loadProducts])

  // Load categories on mount
  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return {
    products,
    categories,
    currentProduct,
    searchQuery,
    filters,
    pagination,
    isLoading,
    error,
    loadProducts,
    fetchProducts: loadProducts,
    loadProduct,
    createProduct: createProductData,
    updateProduct: updateProductData,
    deleteProduct: deleteProductData,
    loadCategories,
    setSearchQuery: setSearchQueryAction,
    setFilters: setFiltersAction,
    setPagination: setPaginationAction,
    clearError: clearErrorAction,
  }
}
