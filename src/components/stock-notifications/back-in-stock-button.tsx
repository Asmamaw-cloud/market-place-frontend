'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Loader2, Package, PackageCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useStockNotifications } from '@/hooks/useStockNotifications'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface BackInStockButtonProps {
  productId: string
  skuId: string
  isInStock: boolean
  stockQuantity?: number
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  showText?: boolean
}

export function BackInStockButton({ 
  productId, 
  skuId, 
  isInStock,
  stockQuantity = 0,
  className,
  variant = 'outline',
  size = 'default',
  showText = false
}: BackInStockButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [notificationMethod, setNotificationMethod] = useState<'EMAIL' | 'SMS' | 'PUSH' | 'ALL'>('ALL')
  const [isLoading, setIsLoading] = useState(false)
  const [hasNotification, setHasNotification] = useState(false)
  const [existingNotification, setExistingNotification] = useState<any>(null)

  const { isAuthenticated } = useAuth()
  const { 
    createStockNotification, 
    updateStockNotification, 
    deleteStockNotification, 
    toggleStockNotification,
    checkProductStockNotification 
  } = useStockNotifications()

  useEffect(() => {
    if (isAuthenticated && productId && skuId) {
      checkProductStockNotification(productId, skuId).then(result => {
        setHasNotification(result.hasNotification)
        setExistingNotification(result.notification)
        if (result.notification) {
          setNotificationMethod(result.notification.notificationMethod)
        }
      }).catch(console.error)
    }
  }, [isAuthenticated, productId, skuId, checkProductStockNotification])

  const handleCreateNotification = async () => {
    setIsLoading(true)
    try {
      if (hasNotification && existingNotification) {
        await updateStockNotification(existingNotification.id, {
          notificationMethod,
          isActive: true
        })
      } else {
        await createStockNotification({
          productId,
          skuId,
          notificationMethod
        })
      }
      
      setHasNotification(true)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to create/update stock notification:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleNotification = async () => {
    if (!existingNotification) return

    setIsLoading(true)
    try {
      await toggleStockNotification(existingNotification.id)
      setHasNotification(!hasNotification)
    } catch (error) {
      console.error('Failed to toggle stock notification:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteNotification = async () => {
    if (!existingNotification) return

    setIsLoading(true)
    try {
      await deleteStockNotification(existingNotification.id)
      setHasNotification(false)
      setExistingNotification(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to delete stock notification:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn('gap-2', className)}
        onClick={() => {
          window.location.href = '/login'
        }}
      >
        <Bell className="h-4 w-4" />
        {showText && 'Notify When Available'}
      </Button>
    )
  }

  if (isInStock) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <PackageCheck className="h-3 w-3" />
          In Stock
        </Badge>
        {stockQuantity > 0 && (
          <span className="text-sm text-muted-foreground">
            {stockQuantity} available
          </span>
        )}
      </div>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            'gap-2 transition-colors',
            hasNotification && 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200',
            className
          )}
          onClick={() => {
            if (hasNotification) {
              handleToggleNotification()
            }
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : hasNotification ? (
            <BellOff className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {showText && (hasNotification ? 'Stop Notifications' : 'Notify When Available')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {hasNotification ? 'Update Stock Notification' : 'Get Notified When Back in Stock'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Currently Out of Stock</span>
            </div>
            <p className="text-sm text-muted-foreground">
              We'll notify you as soon as this item becomes available again.
            </p>
          </div>

          <div>
            <Label htmlFor="notificationMethod">Notification Method</Label>
            <Select value={notificationMethod} onValueChange={(value: any) => setNotificationMethod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
                <SelectItem value="PUSH">Push Notification</SelectItem>
                <SelectItem value="ALL">All Methods</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between pt-4">
            <div className="flex space-x-2">
              <Button
                onClick={handleCreateNotification}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {hasNotification ? 'Update Notification' : 'Create Notification'}
              </Button>
              {hasNotification && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteNotification}
                  disabled={isLoading}
                >
                  Delete
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
