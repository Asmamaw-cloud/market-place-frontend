import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  theme: 'light' | 'dark' | 'system'
  language: string
  loading: {
    global: boolean
    auth: boolean
    cart: boolean
    products: boolean
    orders: boolean
    chat: boolean
  }
  modals: {
    cart: boolean
    search: boolean
    filters: boolean
    address: boolean
    payment: boolean
    review: boolean
  }
  toasts: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
  }>
}

const initialState: UiState = {
  sidebarOpen: false,
  mobileMenuOpen: false,
  theme: 'system',
  language: 'en',
  loading: {
    global: false,
    auth: false,
    cart: false,
    products: false,
    orders: false,
    chat: false,
  },
  modals: {
    cart: false,
    search: false,
    filters: false,
    address: false,
    payment: false,
    review: false,
  },
  toasts: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload
    },
    setLoading: (state, action: PayloadAction<{ key: keyof UiState['loading']; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload
    },
    setModalOpen: (state, action: PayloadAction<{ key: keyof UiState['modals']; value: boolean }>) => {
      state.modals[action.payload.key] = action.payload.value
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UiState['modals']] = false
      })
    },
    addToast: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info'
      title: string
      message: string
      duration?: number
    }>) => {
      const id = Math.random().toString(36).substr(2, 9)
      state.toasts.push({
        id,
        ...action.payload,
        duration: action.payload.duration || 5000,
      })
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload)
    },
    clearToasts: (state) => {
      state.toasts = []
    },
  },
})

export const {
  setSidebarOpen,
  toggleSidebar,
  setMobileMenuOpen,
  toggleMobileMenu,
  setTheme,
  setLanguage,
  setLoading,
  setGlobalLoading,
  setModalOpen,
  closeAllModals,
  addToast,
  removeToast,
  clearToasts,
} = uiSlice.actions

export default uiSlice.reducer
