import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Order, CreateOrderRequest } from '@/types'
import { ordersApi } from '@/lib/api'
import { ordersService } from '@/services'

interface OrdersState {
  orders: Order[]
  currentOrder: Order | null
  filters: {
    status?: string
    merchant?: string
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

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
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
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: {
    status?: string
    page?: number
    limit?: number
  } = {}, { rejectWithValue }) => {
    try {
      const response = await ordersService.getOrders(params)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders')
    }
  }
)

export const fetchOrder = createAsyncThunk(
  'orders/fetchOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await ordersService.getOrder(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order')
    }
  }
)

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (data: CreateOrderRequest, { rejectWithValue }) => {
    try {
      const response = await ordersService.createOrder(data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order')
    }
  }
)

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await ordersService.updateOrder(id, { status })
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status')
    }
  }
)

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action: PayloadAction<Partial<OrdersState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    },
    setPagination: (state, action: PayloadAction<Partial<OrdersState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    },
    // Optimistic updates
    addOrderOptimistic: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload)
    },
    updateOrderOptimistic: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex(o => o.id === action.payload.id)
      if (index !== -1) {
        state.orders[index] = action.payload
      }
      if (state.currentOrder?.id === action.payload.id) {
        state.currentOrder = action.payload
      }
    },
    removeOrderOptimistic: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter(o => o.id !== action.payload)
      if (state.currentOrder?.id === action.payload) {
        state.currentOrder = null
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders = action.payload.orders || []
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 20,
          total: action.payload.total || 0,
          hasMore: (action.payload.page || 1) * (action.payload.limit || 20) < (action.payload.total || 0),
        }
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Fetch Order
      .addCase(fetchOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentOrder = action.payload
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders.unshift(action.payload)
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.orders.findIndex(o => o.id === action.payload.id)
        if (index !== -1) {
          state.orders[index] = action.payload
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
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
  clearCurrentOrder,
  addOrderOptimistic,
  updateOrderOptimistic,
  removeOrderOptimistic,
} = ordersSlice.actions

export default ordersSlice.reducer
