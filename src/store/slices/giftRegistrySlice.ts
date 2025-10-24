import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { GiftRegistry, CreateGiftRegistryRequest, AddToGiftRegistryRequest } from '@/types/gift-registry'

interface GiftRegistryState {
  registries: GiftRegistry[]
  currentRegistry: GiftRegistry | null
  isLoading: boolean
  error: string | null
}

const initialState: GiftRegistryState = {
  registries: [],
  currentRegistry: null,
  isLoading: false,
  error: null,
}

// Mock async thunks
export const fetchGiftRegistries = createAsyncThunk(
  'giftRegistry/fetchGiftRegistries',
  async (_, { rejectWithValue }) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { registries: [] }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch gift registries')
    }
  }
)

export const createGiftRegistry = createAsyncThunk(
  'giftRegistry/createGiftRegistry',
  async (data: CreateGiftRegistryRequest, { rejectWithValue }) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { id: '1', ...data, items: [], totalItems: 0, purchasedItems: 0, totalValue: 0, purchasedValue: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create gift registry')
    }
  }
)

export const updateGiftRegistry = createAsyncThunk(
  'giftRegistry/updateGiftRegistry',
  async (data: { registryId: string; data: Partial<CreateGiftRegistryRequest> }, { rejectWithValue }) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { id: data.registryId, ...data.data }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update gift registry')
    }
  }
)

export const deleteGiftRegistry = createAsyncThunk(
  'giftRegistry/deleteGiftRegistry',
  async (registryId: string, { rejectWithValue }) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return registryId
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete gift registry')
    }
  }
)

export const shareGiftRegistry = createAsyncThunk(
  'giftRegistry/shareGiftRegistry',
  async (data: { registryId: string; isPublic: boolean }, { rejectWithValue }) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { shareCode: 'ABC123', shareUrl: 'https://example.com/registry/ABC123' }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to share gift registry')
    }
  }
)

export const addToGiftRegistry = createAsyncThunk(
  'giftRegistry/addToGiftRegistry',
  async (data: { registryId: string; data: AddToGiftRegistryRequest }, { rejectWithValue }) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { registryId: data.registryId, item: { id: '1', ...data.data, isPurchased: false, createdAt: new Date().toISOString() } }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add to gift registry')
    }
  }
)

export const removeFromGiftRegistry = createAsyncThunk(
  'giftRegistry/removeFromGiftRegistry',
  async (data: { registryId: string; itemId: string }, { rejectWithValue }) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove from gift registry')
    }
  }
)

export const updateGiftRegistryItem = createAsyncThunk(
  'giftRegistry/updateGiftRegistryItem',
  async (data: { registryId: string; itemId: string; data: any }, { rejectWithValue }) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { registryId: data.registryId, item: { id: data.itemId, ...data.data } }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update gift registry item')
    }
  }
)

const giftRegistrySlice = createSlice({
  name: 'giftRegistry',
  initialState,
  reducers: {
    setCurrentRegistry: (state, action: PayloadAction<GiftRegistry | null>) => {
      state.currentRegistry = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGiftRegistries.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchGiftRegistries.fulfilled, (state, action) => {
        state.isLoading = false
        state.registries = action.payload.registries || []
      })
      .addCase(fetchGiftRegistries.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(createGiftRegistry.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createGiftRegistry.fulfilled, (state, action) => {
        state.isLoading = false
        state.registries.unshift(action.payload as any)
      })
      .addCase(createGiftRegistry.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(updateGiftRegistry.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateGiftRegistry.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.registries.findIndex(r => r.id === action.payload.id)
        if (index !== -1) {
          state.registries[index] = { ...state.registries[index], ...action.payload }
        }
      })
      .addCase(updateGiftRegistry.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(deleteGiftRegistry.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteGiftRegistry.fulfilled, (state, action) => {
        state.isLoading = false
        state.registries = state.registries.filter(r => r.id !== action.payload)
      })
      .addCase(deleteGiftRegistry.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setCurrentRegistry, clearError } = giftRegistrySlice.actions
export default giftRegistrySlice.reducer
