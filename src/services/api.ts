import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for HTTP-only cookies
})

// Store token getter function - will be set from outside
let getToken: (() => string | null) | null = null
let dispatch: ((action: any) => void) | null = null

// Allow external code to set the token getter
export const setAuthHelpers = (tokenGetter: () => string | null, dispatcher: (action: any) => void) => {
  getToken = tokenGetter
  dispatch = dispatcher
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken?.()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = getToken?.()
        
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/refresh`,
            {},
            { withCredentials: true }
          )
          
          const { access_token } = response.data
          dispatch?.({ type: 'auth/setAccessToken', payload: access_token })
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, only redirect to login if on a protected route
        dispatch?.({ type: 'auth/logout' })
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname
          // Public routes that don't require authentication
          const publicRoutes = ['/', '/login', '/signup', '/register', '/products', '/merchants']
          const isPublicRoute = publicRoutes.some(route => currentPath === route || currentPath.startsWith(route + '/'))
          
          // Only redirect to login if not already on a public route
          if (!isPublicRoute) {
          window.location.href = '/login'
          }
        }
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
