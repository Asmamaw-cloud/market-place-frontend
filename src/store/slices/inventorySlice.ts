import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

interface InventoryState {
  lots: any[]
  movements: any[]
  locations: any[]
  analytics: any
  alerts: any[]
  isLoading: boolean
  error: string | null
}

const initialState: InventoryState = {
  lots: [],
  movements: [],
  locations: [],
  analytics: null,
  alerts: [],
  isLoading: false,
  error: null,
}

// Mock async thunks
export const fetchInventoryLots = createAsyncThunk(
  'inventory/fetchInventoryLots',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { lots: [] }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch inventory lots')
    }
  }
)

export const fetchInventoryMovements = createAsyncThunk(
  'inventory/fetchInventoryMovements',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { movements: [] }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch inventory movements')
    }
  }
)

export const fetchInventoryLocations = createAsyncThunk(
  'inventory/fetchInventoryLocations',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { locations: [] }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch inventory locations')
    }
  }
)

export const loadInventoryAnalytics = createAsyncThunk(
  'inventory/loadInventoryAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { analytics: {} }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load inventory analytics')
    }
  }
)

export const loadStockAlerts = createAsyncThunk(
  'inventory/loadStockAlerts',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { alerts: [] }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load stock alerts')
    }
  }
)

export const createInventoryLot = createAsyncThunk(
  'inventory/createInventoryLot',
  async (data: any, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { lot: data }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create inventory lot')
    }
  }
)

export const updateInventoryLot = createAsyncThunk(
  'inventory/updateInventoryLot',
  async (data: { lotId: string; data: any }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { lotId: data.lotId, data: data.data }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update inventory lot')
    }
  }
)

export const deleteInventoryLot = createAsyncThunk(
  'inventory/deleteInventoryLot',
  async (lotId: string, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return lotId
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete inventory lot')
    }
  }
)

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryLots.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchInventoryLots.fulfilled, (state, action) => {
        state.isLoading = false
        state.lots = action.payload.lots || []
      })
      .addCase(fetchInventoryLots.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchInventoryMovements.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchInventoryMovements.fulfilled, (state, action) => {
        state.isLoading = false
        state.movements = action.payload.movements || []
      })
      .addCase(fetchInventoryMovements.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchInventoryLocations.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchInventoryLocations.fulfilled, (state, action) => {
        state.isLoading = false
        state.locations = action.payload.locations || []
      })
      .addCase(fetchInventoryLocations.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(loadInventoryAnalytics.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadInventoryAnalytics.fulfilled, (state, action) => {
        state.isLoading = false
        state.analytics = action.payload.analytics
      })
      .addCase(loadInventoryAnalytics.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(loadStockAlerts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadStockAlerts.fulfilled, (state, action) => {
        state.isLoading = false
        state.alerts = action.payload.alerts || []
      })
      .addCase(loadStockAlerts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = inventorySlice.actions
export default inventorySlice.reducer
