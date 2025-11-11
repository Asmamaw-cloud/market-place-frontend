import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Product, Category } from '@/types'
import { productsService } from '@/services'
import { categoriesApi } from '@/lib/api'

interface ProductsState {
  products: Product[]
  categories: Category[]
  currentProduct: Product | null
  searchQuery: string
  filters: {
    category?: string
    merchant?: string
    minPrice?: number
    maxPrice?: number
    unitType?: string
    rating?: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  isLoading: boolean
  error: string | null
}

const initialState: ProductsState = {
  products: [],
  categories: [],
  currentProduct: null,
  searchQuery: '',
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: {
    q?: string
    category?: string
    merchant?: string
    page?: number
    limit?: number
    minPrice?: number
    maxPrice?: number
    unitType?: string
  } = {}, { rejectWithValue }) => {
    try {
      // Convert q to search for the service
      const serviceParams: any = {
        ...params,
        search: params.q
      }
      delete serviceParams.q
      delete serviceParams.merchant
      
      // Add merchantId if merchant is provided
      if (params.merchant && params.merchant !== 'current') {
        serviceParams.merchantId = params.merchant
      }
      
      const response = await productsService.getProducts(serviceParams)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products')
    }
  }
)

export const fetchProduct = createAsyncThunk(
  'products/fetchProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await productsService.getProduct(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product')
    }
  }
)

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoriesApi.list()
      return response.data.data || response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories')
    }
  }
)

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await productsService.createProduct(data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product')
    }
  }
)

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await productsService.updateProduct(id, data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product')
    }
  }
)

export const addSku = createAsyncThunk(
  'products/addSku',
  async ({ productId, data }: { productId: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await productsService.createProductSku(productId, data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add SKU')
    }
  }
)

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      await productsService.deleteProduct(productId)
      return productId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product')
    }
  }
)

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<ProductsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    },
    setPagination: (state, action: PayloadAction<Partial<ProductsState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null
    },
    // Optimistic updates
    addProductOptimistic: (state, action: PayloadAction<Product>) => {
      state.products.unshift(action.payload)
    },
    updateProductOptimistic: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id)
      if (index !== -1) {
        state.products[index] = action.payload
      }
      if (state.currentProduct?.id === action.payload.id) {
        state.currentProduct = action.payload
      }
    },
    removeProductOptimistic: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.id !== action.payload)
      if (state.currentProduct?.id === action.payload) {
        state.currentProduct = null
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = action.payload.products || []
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 20,
          total: action.payload.total || 0,
          hasMore: (action.payload.page || 1) * (action.payload.limit || 20) < (action.payload.total || 0),
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false
        const errorMessage = action.payload as string || action.error?.message || 'Failed to fetch products'
        console.error('[productsSlice] fetchProducts rejected:', {
          payload: action.payload,
          error: action.error,
          message: errorMessage
        })
        state.error = errorMessage
      })
      
      // Fetch Product
      .addCase(fetchProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentProduct = action.payload
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories = action.payload.data || action.payload || []
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.products.unshift(action.payload)
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false
        const product = action.payload
        const index = state.products.findIndex(p => p.id === product.id)
        if (index !== -1) {
          state.products[index] = product
        }
        if (state.currentProduct?.id === product.id) {
          state.currentProduct = product
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Add SKU
      .addCase(addSku.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addSku.fulfilled, (state, action) => {
        state.isLoading = false
        // Update the product with new SKU
        const sku = action.payload
        const productIndex = state.products.findIndex(p => p.id === sku.productId)
        if (productIndex !== -1) {
          const product = state.products[productIndex]
          if (product) {
            if (!product.skus) {
              product.skus = []
            }
            product.skus.push(sku)
          }
        }
        if (state.currentProduct?.id === sku.productId) {
          if (!state.currentProduct?.skus) {
            state.currentProduct!.skus = []
          }
          state.currentProduct!.skus.push(sku)
        }
      })
      .addCase(addSku.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = state.products.filter(p => p.id !== action.payload)
        if (state.currentProduct?.id === action.payload) {
          state.currentProduct = null
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const {
  clearError,
  setSearchQuery,
  setFilters,
  clearFilters,
  setPagination,
  clearCurrentProduct,
  addProductOptimistic,
  updateProductOptimistic,
  removeProductOptimistic,
} = productsSlice.actions

export default productsSlice.reducer
