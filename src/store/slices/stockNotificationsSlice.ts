import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { StockNotification, CreateStockNotificationRequest } from '@/types/stock-notifications'
import { stockNotificationsService } from '@/services/stock-notifications'

interface StockNotificationsState {
  notifications: StockNotification[]
  isLoading: boolean
  error: string | null
}

const initialState: StockNotificationsState = {
  notifications: [],
  isLoading: false,
  error: null,
}

// Async Thunks
export const fetchStockNotifications = createAsyncThunk(
  'stockNotifications/fetchStockNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await stockNotificationsService.getStockNotifications()
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stock notifications')
    }
  }
)

export const createStockNotification = createAsyncThunk(
  'stockNotifications/createStockNotification',
  async (data: CreateStockNotificationRequest, { rejectWithValue }) => {
    try {
      const response = await stockNotificationsService.createStockNotification(data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create stock notification')
    }
  }
)

export const updateStockNotification = createAsyncThunk(
  'stockNotifications/updateStockNotification',
  async (data: { notificationId: string; data: {
    notificationMethod?: 'EMAIL' | 'SMS' | 'PUSH' | 'ALL'
    isActive?: boolean
  } }, { rejectWithValue }) => {
    try {
      const response = await stockNotificationsService.updateStockNotification(data.notificationId, data.data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update stock notification')
    }
  }
)

export const deleteStockNotification = createAsyncThunk(
  'stockNotifications/deleteStockNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await stockNotificationsService.deleteStockNotification(notificationId)
      return notificationId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete stock notification')
    }
  }
)

export const toggleStockNotification = createAsyncThunk(
  'stockNotifications/toggleStockNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await stockNotificationsService.toggleStockNotification(notificationId)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle stock notification')
    }
  }
)

export const checkProductStockNotification = createAsyncThunk(
  'stockNotifications/checkProductStockNotification',
  async (data: { productId: string; skuId: string }, { rejectWithValue }) => {
    try {
      const response = await stockNotificationsService.checkProductStockNotification(data.productId, data.skuId)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check product stock notification')
    }
  }
)

export const getStockStatus = createAsyncThunk(
  'stockNotifications/getStockStatus',
  async (data: { productId: string; skuId: string }, { rejectWithValue }) => {
    try {
      const response = await stockNotificationsService.getStockStatus(data.productId, data.skuId)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get stock status')
    }
  }
)

const stockNotificationsSlice = createSlice({
  name: 'stockNotifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch Stock Notifications
    builder
      .addCase(fetchStockNotifications.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchStockNotifications.fulfilled, (state, action) => {
        state.isLoading = false
        state.notifications = action.payload.notifications || []
      })
      .addCase(fetchStockNotifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Create Stock Notification
      .addCase(createStockNotification.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createStockNotification.fulfilled, (state, action) => {
        state.isLoading = false
        state.notifications.unshift(action.payload)
      })
      .addCase(createStockNotification.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Stock Notification
      .addCase(updateStockNotification.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateStockNotification.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.notifications.findIndex(notification => notification.id === action.payload.id)
        if (index !== -1) {
          state.notifications[index] = action.payload
        }
      })
      .addCase(updateStockNotification.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete Stock Notification
      .addCase(deleteStockNotification.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteStockNotification.fulfilled, (state, action) => {
        state.isLoading = false
        state.notifications = state.notifications.filter(notification => notification.id !== action.payload)
      })
      .addCase(deleteStockNotification.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Toggle Stock Notification
      .addCase(toggleStockNotification.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(toggleStockNotification.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.notifications.findIndex(notification => notification.id === action.payload.id)
        if (index !== -1) {
          state.notifications[index] = action.payload
        }
      })
      .addCase(toggleStockNotification.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = stockNotificationsSlice.actions
export default stockNotificationsSlice.reducer
