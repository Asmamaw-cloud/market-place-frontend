import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Wishlist, WishlistItem, CreateWishlistRequest, AddToWishlistRequest, ShareWishlistRequest } from '@/types/wishlist'
import { wishlistService } from '@/services/wishlist'

interface WishlistState {
  wishlists: Wishlist[]
  currentWishlist: Wishlist | null
  isLoading: boolean
  error: string | null
}

const initialState: WishlistState = {
  wishlists: [],
  currentWishlist: null,
  isLoading: false,
  error: null,
}

// Async Thunks
export const fetchWishlists = createAsyncThunk(
  'wishlist/fetchWishlists',
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistService.getWishlists()
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlists')
    }
  }
)

export const createWishlist = createAsyncThunk(
  'wishlist/createWishlist',
  async (data: CreateWishlistRequest, { rejectWithValue }) => {
    try {
      const response = await wishlistService.createWishlist(data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create wishlist')
    }
  }
)

export const updateWishlist = createAsyncThunk(
  'wishlist/updateWishlist',
  async (data: { wishlistId: string; data: Partial<CreateWishlistRequest> }, { rejectWithValue }) => {
    try {
      const response = await wishlistService.updateWishlist(data.wishlistId, data.data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update wishlist')
    }
  }
)

export const deleteWishlist = createAsyncThunk(
  'wishlist/deleteWishlist',
  async (wishlistId: string, { rejectWithValue }) => {
    try {
      await wishlistService.deleteWishlist(wishlistId)
      return wishlistId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete wishlist')
    }
  }
)

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (data: { wishlistId: string; data: AddToWishlistRequest }, { rejectWithValue }) => {
    try {
      const response = await wishlistService.addToWishlist(data.wishlistId, data.data)
      return { wishlistId: data.wishlistId, item: response }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist')
    }
  }
)

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (data: { wishlistId: string; itemId: string }, { rejectWithValue }) => {
    try {
      await wishlistService.removeFromWishlist(data.wishlistId, data.itemId)
      return { wishlistId: data.wishlistId, itemId: data.itemId }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist')
    }
  }
)

export const moveWishlistItem = createAsyncThunk(
  'wishlist/moveWishlistItem',
  async (data: { itemId: string; fromWishlistId: string; toWishlistId: string }, { rejectWithValue }) => {
    try {
      await wishlistService.moveWishlistItem(data.itemId, data.fromWishlistId, data.toWishlistId)
      return data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to move wishlist item')
    }
  }
)

export const updateWishlistItem = createAsyncThunk(
  'wishlist/updateWishlistItem',
  async (data: { wishlistId: string; itemId: string; data: { notes?: string } }, { rejectWithValue }) => {
    try {
      const response = await wishlistService.updateWishlistItem(data.wishlistId, data.itemId, data.data)
      return { wishlistId: data.wishlistId, item: response }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update wishlist item')
    }
  }
)

export const shareWishlist = createAsyncThunk(
  'wishlist/shareWishlist',
  async (data: ShareWishlistRequest, { rejectWithValue }) => {
    try {
      const response = await wishlistService.shareWishlist(data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to share wishlist')
    }
  }
)

export const addToCartFromWishlist = createAsyncThunk(
  'wishlist/addToCartFromWishlist',
  async (data: { wishlistId: string; itemId: string; quantity: number }, { rejectWithValue }) => {
    try {
      await wishlistService.addToCartFromWishlist(data.wishlistId, data.itemId, data.quantity)
      return data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart from wishlist')
    }
  }
)

export const checkProductInWishlist = createAsyncThunk(
  'wishlist/checkProductInWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await wishlistService.checkProductInWishlist(productId)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check product in wishlist')
    }
  }
)

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setCurrentWishlist: (state, action: PayloadAction<Wishlist | null>) => {
      state.currentWishlist = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch Wishlists
    builder
      .addCase(fetchWishlists.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchWishlists.fulfilled, (state, action) => {
        state.isLoading = false
        state.wishlists = action.payload.wishlists || []
      })
      .addCase(fetchWishlists.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Create Wishlist
      .addCase(createWishlist.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createWishlist.fulfilled, (state, action) => {
        state.isLoading = false
        state.wishlists.unshift(action.payload)
      })
      .addCase(createWishlist.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Wishlist
      .addCase(updateWishlist.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateWishlist.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.wishlists.findIndex(w => w.id === action.payload.id)
        if (index !== -1) {
          state.wishlists[index] = action.payload
        }
        if (state.currentWishlist?.id === action.payload.id) {
          state.currentWishlist = action.payload
        }
      })
      .addCase(updateWishlist.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete Wishlist
      .addCase(deleteWishlist.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteWishlist.fulfilled, (state, action) => {
        state.isLoading = false
        state.wishlists = state.wishlists.filter(w => w.id !== action.payload)
        if (state.currentWishlist?.id === action.payload) {
          state.currentWishlist = null
        }
      })
      .addCase(deleteWishlist.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Add to Wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false
        const wishlist = state.wishlists.find(w => w.id === action.payload.wishlistId)
        if (wishlist) {
          wishlist.items.push(action.payload.item)
        }
        if (state.currentWishlist?.id === action.payload.wishlistId) {
          state.currentWishlist.items.push(action.payload.item)
        }
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Remove from Wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.isLoading = false
        const wishlist = state.wishlists.find(w => w.id === action.payload.wishlistId)
        if (wishlist) {
          wishlist.items = wishlist.items.filter(item => item.id !== action.payload.itemId)
        }
        if (state.currentWishlist?.id === action.payload.wishlistId) {
          state.currentWishlist.items = state.currentWishlist.items.filter(item => item.id !== action.payload.itemId)
        }
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Move Wishlist Item
      .addCase(moveWishlistItem.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(moveWishlistItem.fulfilled, (state, action) => {
        state.isLoading = false
        const { itemId, fromWishlistId, toWishlistId } = action.payload
        
        // Remove from source wishlist
        const fromWishlist = state.wishlists.find(w => w.id === fromWishlistId)
        if (fromWishlist) {
          const item = fromWishlist.items.find(i => i.id === itemId)
          if (item) {
            fromWishlist.items = fromWishlist.items.filter(i => i.id !== itemId)
            
            // Add to destination wishlist
            const toWishlist = state.wishlists.find(w => w.id === toWishlistId)
            if (toWishlist) {
              toWishlist.items.push(item)
            }
          }
        }
      })
      .addCase(moveWishlistItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Wishlist Item
      .addCase(updateWishlistItem.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateWishlistItem.fulfilled, (state, action) => {
        state.isLoading = false
        const wishlist = state.wishlists.find(w => w.id === action.payload.wishlistId)
        if (wishlist) {
          const itemIndex = wishlist.items.findIndex(item => item.id === action.payload.item.id)
          if (itemIndex !== -1) {
            wishlist.items[itemIndex] = action.payload.item
          }
        }
        if (state.currentWishlist?.id === action.payload.wishlistId) {
          const itemIndex = state.currentWishlist.items.findIndex(item => item.id === action.payload.item.id)
          if (itemIndex !== -1) {
            state.currentWishlist.items[itemIndex] = action.payload.item
          }
        }
      })
      .addCase(updateWishlistItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setCurrentWishlist, clearError } = wishlistSlice.actions
export default wishlistSlice.reducer
