import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { CartState, CartItem, AddToCartRequest } from '@/types'
import { cartApi } from '@/lib/api'

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartApi.get()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart')
    }
  }
)

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (data: AddToCartRequest, { rejectWithValue }) => {
    try {
      const response = await cartApi.addItem(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add item to cart')
    }
  }
)

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId: string, { rejectWithValue }) => {
    try {
      await cartApi.removeItem(itemId)
      return itemId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item from cart')
    }
  }
)

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }: { itemId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await cartApi.updateItem(itemId, { quantity })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart item')
    }
  }
)

export const clearCartAsync = createAsyncThunk(
  'cart/clearCartAsync',
  async (_, { rejectWithValue }) => {
    try {
      // Call the backend DELETE /cart endpoint to clear all items from database
      await cartApi.clear()
      return { success: true }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart')
    }
  }
)

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCart: (state) => {
      state.items = []
      state.totalItems = 0
      state.totalAmount = 0
      state.error = null
    },
    calculateTotals: (state) => {
      // Count unique products (by skuId), not total quantity
      const uniqueSkus = new Set(state.items.map(item => item.skuId))
      state.totalItems = uniqueSkus.size
      state.totalAmount = state.items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0)
    },
    // Lightweight optimistic count increment used to instantly update navbar badge
    // Increment by 1 for each new product added (not by quantity)
    incrementTotalItemsOptimistic: (state, action: PayloadAction<string>) => {
      // action.payload is the skuId
      // Only increment if this product (skuId) is not already in cart
      const skuId = action.payload
      const productExists = state.items.some(item => item.skuId === skuId)
      if (!productExists) {
        // New product added, increment count by 1
        state.totalItems = Math.max(0, state.totalItems + 1)
      }
      // If product already exists, don't increment (count is by unique products, not quantity)
    },
    // Optimistic updates
    addItemOptimistic: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.skuId === action.payload.skuId)
      if (existingItem) {
        existingItem.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }
      cartSlice.caseReducers.calculateTotals(state)
    },
    removeItemOptimistic: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      cartSlice.caseReducers.calculateTotals(state)
    },
    updateItemOptimistic: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.itemId)
      if (item) {
        item.quantity = action.payload.quantity
      }
      cartSlice.caseReducers.calculateTotals(state)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false
        // TransformInterceptor wraps response in { data: ... }
        // response.data from axios = { data: Cart }
        // So action.payload (which is response.data) = { data: Cart }
        // action.payload.data = Cart object with items array
        
        // Try multiple possible response structures
        let items: any[] = []
        const payload = action.payload as any
        
        if (payload) {
          // Case 1: { data: { items: [...] } }
          if (payload.data && Array.isArray(payload.data.items)) {
            items = payload.data.items
          }
          // Case 2: { data: Cart object } where Cart has items property
          else if (payload.data && payload.data.items) {
            items = Array.isArray(payload.data.items) ? payload.data.items : []
          }
          // Case 3: Cart object directly (no data wrapper)
          else if (Array.isArray(payload.items)) {
            items = payload.items
          }
          // Case 4: items array directly
          else if (Array.isArray(payload)) {
            items = payload
          }
        }
        
        // Debug: log what we received
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.log('Cart fetch response:', {
            payload: action.payload,
            itemsLength: items?.length,
            items
          })
        }
        
        // Only filter out items that are completely invalid (no id or skuId)
        // Keep items even if sku or product relation is missing - we'll handle that in the UI
        const validItems = Array.isArray(items) 
          ? items.filter((item: any) => {
              const isValid = item && item.id && item.skuId
              if (!isValid && typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
                console.warn('Filtered out invalid cart item (missing id or skuId):', item)
              }
              return isValid
            })
          : []
        
        // Log what we're setting as items
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.log('Setting cart items:', {
            validItemsLength: validItems.length,
            validItems,
            sampleItem: validItems[0]
          })
        }
        
        state.items = validItems as CartItem[]
        cartSlice.caseReducers.calculateTotals(state)
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false
        // addToCart returns a single CartItem, not the full cart
        // The cart will be refetched in useCart hook after this
        // Don't update items here - wait for fetchCart to complete
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        // Recalculate from items to revert any optimistic count changes
        cartSlice.caseReducers.calculateTotals(state)
      })
      
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = state.items.filter(item => item.id !== action.payload)
        cartSlice.caseReducers.calculateTotals(state)
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false
        // updateItem returns a single CartItem, not the full cart
        // Update the specific item in the items array
        const updatedItem = action.payload?.data || action.payload
        if (updatedItem?.id) {
          const itemIndex = state.items.findIndex(item => item.id === updatedItem.id)
          if (itemIndex >= 0) {
            state.items[itemIndex] = { ...state.items[itemIndex], ...updatedItem } as CartItem
          }
        }
        cartSlice.caseReducers.calculateTotals(state)
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Clear Cart
      .addCase(clearCartAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.isLoading = false
        state.items = []
        state.totalItems = 0
        state.totalAmount = 0
        state.error = null
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const {
  clearError,
  clearCart,
  calculateTotals,
  incrementTotalItemsOptimistic,
  addItemOptimistic,
  removeItemOptimistic,
  updateItemOptimistic,
} = cartSlice.actions

export default cartSlice.reducer
