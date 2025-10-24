import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { PriceAlert, CreatePriceAlertRequest, UpdatePriceAlertRequest } from '@/types/price-alerts'
import { priceAlertsService } from '@/services/price-alerts'

interface PriceAlertsState {
  alerts: PriceAlert[]
  isLoading: boolean
  error: string | null
}

const initialState: PriceAlertsState = {
  alerts: [],
  isLoading: false,
  error: null,
}

// Async Thunks
export const fetchPriceAlerts = createAsyncThunk(
  'priceAlerts/fetchPriceAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await priceAlertsService.getPriceAlerts()
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch price alerts')
    }
  }
)

export const createPriceAlert = createAsyncThunk(
  'priceAlerts/createPriceAlert',
  async (data: CreatePriceAlertRequest, { rejectWithValue }) => {
    try {
      const response = await priceAlertsService.createPriceAlert(data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create price alert')
    }
  }
)

export const updatePriceAlert = createAsyncThunk(
  'priceAlerts/updatePriceAlert',
  async (data: { alertId: string; data: UpdatePriceAlertRequest }, { rejectWithValue }) => {
    try {
      const response = await priceAlertsService.updatePriceAlert(data.alertId, data.data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update price alert')
    }
  }
)

export const deletePriceAlert = createAsyncThunk(
  'priceAlerts/deletePriceAlert',
  async (alertId: string, { rejectWithValue }) => {
    try {
      await priceAlertsService.deletePriceAlert(alertId)
      return alertId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete price alert')
    }
  }
)

export const togglePriceAlert = createAsyncThunk(
  'priceAlerts/togglePriceAlert',
  async (alertId: string, { rejectWithValue }) => {
    try {
      const response = await priceAlertsService.togglePriceAlert(alertId)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle price alert')
    }
  }
)

export const checkProductPriceAlert = createAsyncThunk(
  'priceAlerts/checkProductPriceAlert',
  async (data: { productId: string; skuId: string }, { rejectWithValue }) => {
    try {
      const response = await priceAlertsService.checkProductPriceAlert(data.productId, data.skuId)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check product price alert')
    }
  }
)

export const getPriceHistory = createAsyncThunk(
  'priceAlerts/getPriceHistory',
  async (data: { productId: string; skuId: string; days: number }, { rejectWithValue }) => {
    try {
      const response = await priceAlertsService.getPriceHistory(data.productId, data.skuId, data.days)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get price history')
    }
  }
)

const priceAlertsSlice = createSlice({
  name: 'priceAlerts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch Price Alerts
    builder
      .addCase(fetchPriceAlerts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPriceAlerts.fulfilled, (state, action) => {
        state.isLoading = false
        state.alerts = action.payload.alerts || []
      })
      .addCase(fetchPriceAlerts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Create Price Alert
      .addCase(createPriceAlert.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPriceAlert.fulfilled, (state, action) => {
        state.isLoading = false
        state.alerts.unshift(action.payload)
      })
      .addCase(createPriceAlert.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Price Alert
      .addCase(updatePriceAlert.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updatePriceAlert.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.alerts.findIndex(alert => alert.id === action.payload.id)
        if (index !== -1) {
          state.alerts[index] = action.payload
        }
      })
      .addCase(updatePriceAlert.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete Price Alert
      .addCase(deletePriceAlert.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deletePriceAlert.fulfilled, (state, action) => {
        state.isLoading = false
        state.alerts = state.alerts.filter(alert => alert.id !== action.payload)
      })
      .addCase(deletePriceAlert.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Toggle Price Alert
      .addCase(togglePriceAlert.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(togglePriceAlert.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.alerts.findIndex(alert => alert.id === action.payload.id)
        if (index !== -1) {
          state.alerts[index] = action.payload
        }
      })
      .addCase(togglePriceAlert.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = priceAlertsSlice.actions
export default priceAlertsSlice.reducer
