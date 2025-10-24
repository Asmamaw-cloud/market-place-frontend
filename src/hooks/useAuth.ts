import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import {
  requestOtp,
  verifyOtp,
  logout,
  loadUser,
  clearError,
  setUser,
  clearAuth,
} from '@/store/slices/authSlice'
import { clearCart } from '@/store/slices/cartSlice'
import { clearMessages } from '@/store/slices/chatSlice'
import { clearAllNotifications } from '@/store/slices/notificationsSlice'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const { user, accessToken, isAuthenticated, isLoading, error } = useAppSelector(
    state => state.auth
  )

  const handleRequestOtp = useCallback(
    (email: string) => {
      return dispatch(requestOtp({ email }))
    },
    [dispatch]
  )

  const handleVerifyOtp = useCallback(
    (email: string, code: string) => {
      return dispatch(verifyOtp({ email, code }))
    },
    [dispatch]
  )

  const handleLogout = useCallback(() => {
    dispatch(logout())
    dispatch(clearCart())
    dispatch(clearMessages())
    dispatch(clearAllNotifications())
    dispatch(clearAuth())
  }, [dispatch])

  const handleLoadUser = useCallback(() => {
    return dispatch(loadUser())
  }, [dispatch])

  const handleClearError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const handleSetUser = useCallback(
    (user: any) => {
      dispatch(setUser(user))
    },
    [dispatch]
  )

  const isUser = user?.role === 'USER'
  const isMerchant = user?.role === 'MERCHANT'
  const isAdmin = user?.role === 'ADMIN'

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    isUser,
    isMerchant,
    isAdmin,
    requestOtp: handleRequestOtp,
    verifyOtp: handleVerifyOtp,
    logout: handleLogout,
    loadUser: handleLoadUser,
    clearError: handleClearError,
    setUser: handleSetUser,
  }
}
