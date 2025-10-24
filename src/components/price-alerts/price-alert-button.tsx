'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Loader2, TrendingDown, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { usePriceAlerts } from '@/hooks/usePriceAlerts'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface PriceAlertButtonProps {
  productId: string
  skuId: string
  currentPrice: number
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  showText?: boolean
}

export function PriceAlertButton({ 
  productId, 
  skuId, 
  currentPrice,
  className,
  variant = 'outline',
  size = 'default',
  showText = false
}: PriceAlertButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [targetPrice, setTargetPrice] = useState('')
  const [alertType, setAlertType] = useState<'PRICE_DROP' | 'PRICE_RISE' | 'BOTH'>('PRICE_DROP')
  const [notificationMethod, setNotificationMethod] = useState<'EMAIL' | 'SMS' | 'PUSH' | 'ALL'>('ALL')
  const [isLoading, setIsLoading] = useState(false)
  const [hasAlert, setHasAlert] = useState(false)
  const [existingAlert, setExistingAlert] = useState<any>(null)

  const { isAuthenticated } = useAuth()
  const { 
    createPriceAlert, 
    updatePriceAlert, 
    deletePriceAlert, 
    togglePriceAlert,
    checkProductPriceAlert 
  } = usePriceAlerts()

  useEffect(() => {
    if (isAuthenticated && productId && skuId) {
      checkProductPriceAlert(productId, skuId).then(result => {
        setHasAlert(result.hasAlert)
        setExistingAlert(result.alert)
        if (result.alert) {
          setTargetPrice((result.alert.targetPrice / 100).toFixed(2))
          setAlertType(result.alert.alertType)
          setNotificationMethod(result.alert.notificationMethod)
        }
      }).catch(console.error)
    }
  }, [isAuthenticated, productId, skuId, checkProductPriceAlert])

  const handleCreateAlert = async () => {
    if (!targetPrice || isNaN(Number(targetPrice))) return

    setIsLoading(true)
    try {
      const targetPriceCents = Math.round(Number(targetPrice) * 100)
      
      if (hasAlert && existingAlert) {
        await updatePriceAlert(existingAlert.id, {
          targetPrice: targetPriceCents,
          alertType,
          notificationMethod,
          isActive: true
        })
      } else {
        await createPriceAlert({
          productId,
          skuId,
          targetPrice: targetPriceCents,
          alertType,
          notificationMethod
        })
      }
      
      setHasAlert(true)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to create/update price alert:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleAlert = async () => {
    if (!existingAlert) return

    setIsLoading(true)
    try {
      await togglePriceAlert(existingAlert.id)
      setHasAlert(!hasAlert)
    } catch (error) {
      console.error('Failed to toggle price alert:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAlert = async () => {
    if (!existingAlert) return

    setIsLoading(true)
    try {
      await deletePriceAlert(existingAlert.id)
      setHasAlert(false)
      setExistingAlert(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to delete price alert:', error)
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
        {showText && 'Set Price Alert'}
      </Button>
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
            hasAlert && 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200',
            className
          )}
          onClick={() => {
            if (hasAlert) {
              handleToggleAlert()
            }
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : hasAlert ? (
            <BellOff className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {showText && (hasAlert ? 'Disable Alert' : 'Set Price Alert')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {hasAlert ? 'Update Price Alert' : 'Set Price Alert'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="targetPrice">Target Price (ETB)</Label>
            <Input
              id="targetPrice"
              type="number"
              step="0.01"
              min="0"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder={`Current: ETB ${(currentPrice / 100).toFixed(2)}`}
            />
          </div>

          <div>
            <Label htmlFor="alertType">Alert Type</Label>
            <Select value={alertType} onValueChange={(value: any) => setAlertType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRICE_DROP">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    Price Drop
                  </div>
                </SelectItem>
                <SelectItem value="PRICE_RISE">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-red-600" />
                    Price Rise
                  </div>
                </SelectItem>
                <SelectItem value="BOTH">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-blue-600" />
                    Both
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
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
                onClick={handleCreateAlert}
                disabled={isLoading || !targetPrice}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {hasAlert ? 'Update Alert' : 'Create Alert'}
              </Button>
              {hasAlert && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteAlert}
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
