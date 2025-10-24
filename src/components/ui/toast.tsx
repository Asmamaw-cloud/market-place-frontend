'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  XCircle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  updateToast: (id: string, updates: Partial<Toast>) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
    }

    setToasts(prev => [...prev, newToast])

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id)
      if (toast?.onClose) {
        toast.onClose()
      }
      return prev.filter(t => t.id !== id)
    })
  }, [])

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, ...updates } : toast
      )
    )
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToast()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => removeToast(toast.id), 150)
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
      case 'loading':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'info':
        return 'border-blue-200 bg-blue-50'
      case 'loading':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <Card
      className={cn(
        'transition-all duration-300 ease-in-out transform',
        isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95',
        getBorderColor()
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900">
              {toast.title}
            </h4>
            {toast.description && (
              <p className="mt-1 text-sm text-gray-600">
                {toast.description}
              </p>
            )}
            {toast.action && (
              <Button
                size="sm"
                variant="outline"
                onClick={toast.action.onClick}
                className="mt-2"
              >
                {toast.action.label}
              </Button>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClose}
            className="flex-shrink-0 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Convenience functions for common toast types
export function useToastHelpers() {
  const { addToast } = useToast()

  const success = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({
      type: 'success',
      title,
      description,
      ...options
    })
  }, [addToast])

  const error = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({
      type: 'error',
      title,
      description,
      duration: 0, // Don't auto-dismiss errors
      ...options
    })
  }, [addToast])

  const warning = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({
      type: 'warning',
      title,
      description,
      ...options
    })
  }, [addToast])

  const info = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({
      type: 'info',
      title,
      description,
      ...options
    })
  }, [addToast])

  const loading = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({
      type: 'loading',
      title,
      description,
      duration: 0, // Don't auto-dismiss loading toasts
      ...options
    })
  }, [addToast])

  return {
    success,
    error,
    warning,
    info,
    loading
  }
}

// Global toast functions (for use outside of React components)
let globalToastContext: ToastContextType | null = null

export function setGlobalToastContext(context: ToastContextType) {
  globalToastContext = context
}

export const toast = {
  success: (title: string, description?: string, options?: Partial<Toast>) => {
    if (globalToastContext) {
      return globalToastContext.addToast({
        type: 'success',
        title,
        description,
        ...options
      })
    }
    console.warn('Toast context not available')
  },
  error: (title: string, description?: string, options?: Partial<Toast>) => {
    if (globalToastContext) {
      return globalToastContext.addToast({
        type: 'error',
        title,
        description,
        duration: 0,
        ...options
      })
    }
    console.warn('Toast context not available')
  },
  warning: (title: string, description?: string, options?: Partial<Toast>) => {
    if (globalToastContext) {
      return globalToastContext.addToast({
        type: 'warning',
        title,
        description,
        ...options
      })
    }
    console.warn('Toast context not available')
  },
  info: (title: string, description?: string, options?: Partial<Toast>) => {
    if (globalToastContext) {
      return globalToastContext.addToast({
        type: 'info',
        title,
        description,
        ...options
      })
    }
    console.warn('Toast context not available')
  },
  loading: (title: string, description?: string, options?: Partial<Toast>) => {
    if (globalToastContext) {
      return globalToastContext.addToast({
        type: 'loading',
        title,
        description,
        duration: 0,
        ...options
      })
    }
    console.warn('Toast context not available')
  }
}
