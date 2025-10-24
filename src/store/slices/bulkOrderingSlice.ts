import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

interface BulkOrderingState {
  bulkOrders: any[]
  groupBuys: any[]
  quotes: any[]
  isLoading: boolean
  error: string | null
}

const initialState: BulkOrderingState = {
  bulkOrders: [],
  groupBuys: [],
  quotes: [],
  isLoading: false,
  error: null,
}

// Mock async thunks
export const fetchBulkOrders = createAsyncThunk(
  'bulkOrdering/fetchBulkOrders',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { bulkOrders: [] }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch bulk orders')
    }
  }
)

export const createBulkOrder = createAsyncThunk(
  'bulkOrdering/createBulkOrder',
  async (data: any, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { bulkOrder: { id: '1', ...data } }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create bulk order')
    }
  }
)

export const updateBulkOrder = createAsyncThunk(
  'bulkOrdering/updateBulkOrder',
  async (data: { orderId: string; data: any }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { orderId: data.orderId, data: data.data }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update bulk order')
    }
  }
)

export const deleteBulkOrder = createAsyncThunk(
  'bulkOrdering/deleteBulkOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return orderId
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete bulk order')
    }
  }
)

export const fetchGroupBuys = createAsyncThunk(
  'bulkOrdering/fetchGroupBuys',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { groupBuys: [] }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch group buys')
    }
  }
)

export const createGroupBuy = createAsyncThunk(
  'bulkOrdering/createGroupBuy',
  async (data: any, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { groupBuy: { id: '1', ...data } }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create group buy')
    }
  }
)

export const joinGroupBuy = createAsyncThunk(
  'bulkOrdering/joinGroupBuy',
  async (data: { groupBuyId: string; data: any }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { groupBuyId: data.groupBuyId, data: data.data }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to join group buy')
    }
  }
)

export const getBulkOrderQuote = createAsyncThunk(
  'bulkOrdering/getBulkOrderQuote',
  async (data: any, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { quote: {} }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get bulk order quote')
    }
  }
)

const bulkOrderingSlice = createSlice({
  name: 'bulkOrdering',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBulkOrders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBulkOrders.fulfilled, (state, action) => {
        state.isLoading = false
        state.bulkOrders = action.payload.bulkOrders || []
      })
      .addCase(fetchBulkOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(createBulkOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createBulkOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.bulkOrders.unshift(action.payload.bulkOrder)
      })
      .addCase(createBulkOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchGroupBuys.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchGroupBuys.fulfilled, (state, action) => {
        state.isLoading = false
        state.groupBuys = action.payload.groupBuys || []
      })
      .addCase(fetchGroupBuys.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(createGroupBuy.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createGroupBuy.fulfilled, (state, action) => {
        state.isLoading = false
        state.groupBuys.unshift(action.payload.groupBuy)
      })
      .addCase(createGroupBuy.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = bulkOrderingSlice.actions
export default bulkOrderingSlice.reducer
