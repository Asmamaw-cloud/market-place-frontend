import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

interface ReferralState {
  referralCode: any
  referrals: any[]
  stats: any
  isLoading: boolean
  error: string | null
}

const initialState: ReferralState = {
  referralCode: null,
  referrals: [],
  stats: null,
  isLoading: false,
  error: null,
}

// Mock async thunks
export const fetchReferralCode = createAsyncThunk(
  'referral/fetchReferralCode',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { referralCode: null }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch referral code')
    }
  }
)

export const createReferralCode = createAsyncThunk(
  'referral/createReferralCode',
  async (data: any, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { referralCode: { id: '1', ...data } }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create referral code')
    }
  }
)

export const updateReferralCode = createAsyncThunk(
  'referral/updateReferralCode',
  async (data: { codeId: string; data: any }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { codeId: data.codeId, data: data.data }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update referral code')
    }
  }
)

export const deleteReferralCode = createAsyncThunk(
  'referral/deleteReferralCode',
  async (codeId: string, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return codeId
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete referral code')
    }
  }
)

export const fetchReferrals = createAsyncThunk(
  'referral/fetchReferrals',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { referrals: [] }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch referrals')
    }
  }
)

export const fetchReferralStats = createAsyncThunk(
  'referral/fetchReferralStats',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { stats: {} }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch referral stats')
    }
  }
)

export const useReferralCode = createAsyncThunk(
  'referral/useReferralCode',
  async (data: { code: string; orderId?: string }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { success: true }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to use referral code')
    }
  }
)

const referralSlice = createSlice({
  name: 'referral',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReferralCode.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchReferralCode.fulfilled, (state, action) => {
        state.isLoading = false
        state.referralCode = action.payload.referralCode
      })
      .addCase(fetchReferralCode.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(createReferralCode.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createReferralCode.fulfilled, (state, action) => {
        state.isLoading = false
        state.referralCode = action.payload.referralCode
      })
      .addCase(createReferralCode.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchReferrals.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchReferrals.fulfilled, (state, action) => {
        state.isLoading = false
        state.referrals = action.payload.referrals || []
      })
      .addCase(fetchReferrals.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchReferralStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchReferralStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.stats = action.payload.stats
      })
      .addCase(fetchReferralStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = referralSlice.actions
export default referralSlice.reducer
