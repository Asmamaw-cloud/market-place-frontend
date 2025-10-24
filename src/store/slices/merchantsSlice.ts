import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Merchant } from '@/types'
import { merchantsApi } from '@/lib/api'
import { merchantsService } from '@/services'

interface MerchantsState {
  merchants: Merchant[]
  currentMerchant: Merchant | null
  nearbyMerchants: Merchant[]
  filters: {
    lat?: number
    lon?: number
    radiusKm?: number
    search?: string
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

const initialState: MerchantsState = {
  merchants: [],
  currentMerchant: null,
  nearbyMerchants: [],
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
export const fetchMerchants = createAsyncThunk(
  'merchants/fetchMerchants',
  async (params: {
    lat?: number
    lon?: number
    radiusKm?: number
    search?: string
    page?: number
    limit?: number
  } = {}, { rejectWithValue }) => {
    try {
      const response = await merchantsApi.list(params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch merchants')
    }
  }
)

export const fetchMerchant = createAsyncThunk(
  'merchants/fetchMerchant',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await merchantsApi.get(id)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch merchant')
    }
  }
)

export const fetchNearbyMerchants = createAsyncThunk(
  'merchants/fetchNearbyMerchants',
  async ({ lat, lon, radiusKm }: { lat: number; lon: number; radiusKm?: number }, { rejectWithValue }) => {
    try {
      const response = await merchantsApi.nearby(lat, lon, radiusKm)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch nearby merchants')
    }
  }
)

export const createMerchant = createAsyncThunk(
  'merchants/createMerchant',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await merchantsApi.create(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create merchant')
    }
  }
)

export const updateMerchant = createAsyncThunk(
  'merchants/updateMerchant',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await merchantsApi.update(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update merchant')
    }
  }
)

export const fetchMerchantProfile = createAsyncThunk(
  'merchants/fetchMerchantProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await merchantsApi.me()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch merchant profile')
    }
  }
)

export const fetchMerchantSummary = createAsyncThunk(
  'merchants/fetchMerchantSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await merchantsApi.summary()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch merchant summary')
    }
  }
)

const merchantsSlice = createSlice({
  name: 'merchants',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action: PayloadAction<Partial<MerchantsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    },
    setPagination: (state, action: PayloadAction<Partial<MerchantsState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    clearCurrentMerchant: (state) => {
      state.currentMerchant = null
    },
    clearNearbyMerchants: (state) => {
      state.nearbyMerchants = []
    },
    // Optimistic updates
    addMerchantOptimistic: (state, action: PayloadAction<Merchant>) => {
      state.merchants.unshift(action.payload)
    },
    updateMerchantOptimistic: (state, action: PayloadAction<Merchant>) => {
      const index = state.merchants.findIndex(m => m.id === action.payload.id)
      if (index !== -1) {
        state.merchants[index] = action.payload
      }
      if (state.currentMerchant?.id === action.payload.id) {
        state.currentMerchant = action.payload
      }
    },
    removeMerchantOptimistic: (state, action: PayloadAction<string>) => {
      state.merchants = state.merchants.filter(m => m.id !== action.payload)
      if (state.currentMerchant?.id === action.payload) {
        state.currentMerchant = null
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Merchants
      .addCase(fetchMerchants.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMerchants.fulfilled, (state, action) => {
        state.isLoading = false
        state.merchants = action.payload.data?.merchants || action.payload.data || []
        state.pagination = {
          page: action.payload.data?.pagination?.page || 1,
          limit: action.payload.data?.pagination?.limit || 20,
          total: action.payload.data?.pagination?.total || 0,
          hasMore: action.payload.data?.pagination?.hasMore || false,
        }
      })
      .addCase(fetchMerchants.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Fetch Merchant
      .addCase(fetchMerchant.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMerchant.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentMerchant = action.payload.data
      })
      .addCase(fetchMerchant.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Fetch Nearby Merchants
      .addCase(fetchNearbyMerchants.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchNearbyMerchants.fulfilled, (state, action) => {
        state.isLoading = false
        state.nearbyMerchants = action.payload.data || []
      })
      .addCase(fetchNearbyMerchants.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Create Merchant
      .addCase(createMerchant.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createMerchant.fulfilled, (state, action) => {
        state.isLoading = false
        state.merchants.unshift(action.payload.data)
        state.currentMerchant = action.payload.data
      })
      .addCase(createMerchant.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Update Merchant
      .addCase(updateMerchant.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateMerchant.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.merchants.findIndex(m => m.id === action.payload.data.id)
        if (index !== -1) {
          state.merchants[index] = action.payload.data
        }
        if (state.currentMerchant?.id === action.payload.data.id) {
          state.currentMerchant = action.payload.data
        }
      })
      .addCase(updateMerchant.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Fetch Merchant Profile
      .addCase(fetchMerchantProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMerchantProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentMerchant = action.payload.data
      })
      .addCase(fetchMerchantProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Fetch Merchant Summary
      .addCase(fetchMerchantSummary.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMerchantSummary.fulfilled, (state, action) => {
        state.isLoading = false
        // Handle summary data as needed
      })
      .addCase(fetchMerchantSummary.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const {
  clearError,
  setFilters,
  clearFilters,
  setPagination,
  clearCurrentMerchant,
  clearNearbyMerchants,
  addMerchantOptimistic,
  updateMerchantOptimistic,
  removeMerchantOptimistic,
} = merchantsSlice.actions

// Additional async thunks for merchant management
export const approveMerchant = createAsyncThunk(
  'merchants/approveMerchant',
  async (merchantId: string, { rejectWithValue }) => {
    try {
      const response = await merchantsService.approveMerchant(merchantId)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve merchant')
    }
  }
)

export const rejectMerchant = createAsyncThunk(
  'merchants/rejectMerchant',
  async ({ merchantId, reason }: { merchantId: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await merchantsService.rejectMerchant(merchantId, reason)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject merchant')
    }
  }
)

export const deleteMerchant = createAsyncThunk(
  'merchants/deleteMerchant',
  async (merchantId: string, { rejectWithValue }) => {
    try {
      await merchantsService.deleteMerchant(merchantId)
      return merchantId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete merchant')
    }
  }
)

export default merchantsSlice.reducer
