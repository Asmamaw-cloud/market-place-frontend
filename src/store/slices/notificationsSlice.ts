import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Notification } from '@/types'

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  isOpen: boolean
  isLoading: boolean
  error: string | null
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isOpen: false,
  isLoading: false,
  error: null,
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Check if notification already exists
      const existingNotification = state.notifications.find(n => n.id === action.payload.id)
      if (!existingNotification) {
        state.notifications.unshift(action.payload)
        if (!action.payload.read) {
          state.unreadCount += 1
        }
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true
      })
      state.unreadCount = 0
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearAllNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
    },
    setNotificationsOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload
    },
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload
    },
  },
})

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  setNotificationsOpen,
  updateUnreadCount,
} = notificationsSlice.actions


export default notificationsSlice.reducer
