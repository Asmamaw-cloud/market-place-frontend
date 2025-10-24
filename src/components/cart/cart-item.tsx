'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Trash2, Minus, Plus } from 'lucide-react'
import { CartItem as CartItemType, Sku } from '@/types'
import { formatCurrency, formatUnit } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity?: (itemId: string, quantity: number) => void
  onRemove?: (itemId: string) => void
  disabled?: boolean
  showMerchant?: boolean
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  disabled = false,
  showMerchant = true
}: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const { updateItem, removeItem } = useCart()

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemove()
      return
    }

    setIsUpdating(true)
    try {
      if (onUpdateQuantity) {
        onUpdateQuantity(item.id, newQuantity)
      } else {
        await updateItem(item.id, newQuantity)
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    setIsUpdating(true)
    try {
      if (onRemove) {
        onRemove(item.id)
      } else {
        await removeItem(item.id)
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleIncrement = () => {
    const newQuantity = item.quantity + item.sku.unitIncrement
    handleQuantityChange(newQuantity)
  }

  const handleDecrement = () => {
    const newQuantity = Math.max(0, item.quantity - item.sku.unitIncrement)
    handleQuantityChange(newQuantity)
  }

  const subtotal = item.unitPrice * item.quantity

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Product Image */}
          <div className="relative w-20 h-20 flex-shrink-0">
            {item.sku.product.images && item.sku.product.images.length > 0 ? (
              <Image
                src={item.sku.product.images[0]}
                alt={item.sku.product.name}
                fill
                className="object-cover rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted rounded-lg">
                <span className="text-xs text-muted-foreground">No Image</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="space-y-2">
              {/* Product Name */}
              <h3 className="font-medium line-clamp-2">
                {item.sku.product.name}
              </h3>

              {/* SKU Info */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {item.sku.name} - {item.sku.unitType}
                </p>
                
                {/* Merchant Info */}
                {showMerchant && item.sku.product.merchant && (
                  <p className="text-xs text-muted-foreground">
                    Sold by {item.sku.product.merchant.displayName}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center space-x-2">
                <span className="font-bold">
                  {formatCurrency(item.unitPrice)} per {formatUnit(1, item.sku.unitType)}
                </span>
                {item.unitPrice !== item.sku.pricePerCanonicalUnit && (
                  <Badge variant="secondary" className="text-xs">
                    Price Updated
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex flex-col items-end space-y-2">
            {/* Quantity Selector */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecrement}
                disabled={disabled || isUpdating || item.quantity <= item.sku.unitIncrement}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <div className="flex items-center space-x-1 min-w-[4rem] justify-center">
                {isUpdating ? (
                  <Skeleton className="h-4 w-8" />
                ) : (
                  <span className="text-sm font-medium">
                    {formatUnit(item.quantity, item.sku.unitType)}
                  </span>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleIncrement}
                disabled={disabled || isUpdating}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled || isUpdating}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Subtotal */}
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="font-bold text-lg">
            {formatCurrency(subtotal)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
