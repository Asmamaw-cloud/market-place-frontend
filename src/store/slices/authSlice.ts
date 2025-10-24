import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User, AuthState, LoginRequest, VerifyOtpRequest } from '@/types'
import { authApi } from '@/lib/api'

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// Async thunks
export const requestOtp = createAsyncThunk(
  'auth/requestOtp',
  async (data: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.requestOtp(data.email)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request OTP')
    }
  }
)

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (data: VerifyOtpRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyOtp(data.email, data.code)
      const { access_token, user } = response.data
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', access_token)
      }
      
      return { access_token, user }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify OTP')
    }
  }
)

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.refresh()
      const { access_token } = response.data.data
      
      // Store new token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', access_token)
      }
      
      return { access_token }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to refresh token')
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.revoke()
      
      // Clear token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
      }
      
      return true
    } catch (error: any) {
      // Even if API call fails, clear local state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
      }
      return true
    }
  }
)

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      // This would typically be a call to get current user profile
      // For now, we'll just check if token exists
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      if (!token) {
        throw new Error('No token found')
      }
      return { access_token: token }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load user')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    clearAuth: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Request OTP
      .addCase(requestOtp.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(requestOtp.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(requestOtp.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false
        state.accessToken = action.payload.access_token
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false
        state.accessToken = action.payload.access_token
        state.isAuthenticated = true
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isLoading = false
        state.accessToken = null
        state.isAuthenticated = false
        state.user = null
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.accessToken = null
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.accessToken = null
        state.isAuthenticated = false
        state.error = null
      })
      
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.accessToken = action.payload.access_token
        state.isAuthenticated = true
      })
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false
        state.accessToken = null
        state.isAuthenticated = false
        state.user = null
      })
  },
})

export const { clearError, setUser, clearAuth } = authSlice.actions
export default authSlice.reducer
