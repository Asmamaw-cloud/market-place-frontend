'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Sku, UnitType } from '@/types'
import { formatCurrency, formatUnit } from '@/lib/utils'

interface SKUSelectorProps {
  skus: Sku[]
  selectedSku: Sku | null
  onSkuChange: (sku: Sku) => void
  quantity: number
  onQuantityChange: (quantity: number) => void
  disabled?: boolean
}

export function SKUSelector({
  skus,
  selectedSku,
  onSkuChange,
  quantity,
  onQuantityChange,
  disabled = false
}: SKUSelectorProps) {
  const [customQuantity, setCustomQuantity] = useState('')

  const handleQuantityChange = (newQuantity: number) => {
    if (selectedSku) {
      const adjustedQuantity = Math.max(selectedSku.unitIncrement, newQuantity)
      onQuantityChange(adjustedQuantity)
    }
  }

  const handleCustomQuantitySubmit = () => {
    const num = parseFloat(customQuantity)
    if (!isNaN(num) && num > 0) {
      handleQuantityChange(num)
      setCustomQuantity('')
    }
  }

  const getQuantityOptions = (sku: Sku) => {
    const options = []
    const maxQuantity = Math.min(10, sku.unitIncrement * 10) // Show up to 10x unit increment
    
    for (let i = sku.unitIncrement; i <= maxQuantity; i += sku.unitIncrement) {
      options.push(i)
    }
    
    return options
  }

  if (!skus || skus.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">No SKUs available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* SKU Selection */}
      <div className="space-y-3">
        <Label>Unit Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {skus.map((sku) => (
            <Button
              key={sku.id}
              variant={selectedSku?.id === sku.id ? "default" : "outline"}
              onClick={() => onSkuChange(sku)}
              disabled={disabled || !sku.active}
              className="h-12 flex flex-col items-center justify-center space-y-1"
            >
              <span className="font-medium">{sku.unitType}</span>
              <span className="text-xs text-muted-foreground">
                {formatCurrency(sku.pricePerCanonicalUnit)} per {formatUnit(1, sku.unitType)}
              </span>
              {sku.packageSize && (
                <span className="text-xs text-muted-foreground">
                  Package: {formatUnit(sku.packageSize, sku.unitType)}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Quantity Selection */}
      {selectedSku && (
        <div className="space-y-3">
          <Label>Quantity</Label>
          
          {/* Quick Quantity Buttons */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {getQuantityOptions(selectedSku).map((qty) => (
                <Button
                  key={qty}
                  variant={quantity === qty ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuantityChange(qty)}
                  disabled={disabled}
                >
                  {formatUnit(qty, selectedSku.unitType)}
                </Button>
              ))}
            </div>
            
            {/* Custom Quantity Input */}
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={customQuantity}
                onChange={(e) => setCustomQuantity(e.target.value)}
                placeholder="Custom amount"
                className="flex-1 px-3 py-2 border rounded-md text-sm"
                min={selectedSku.unitIncrement}
                step={selectedSku.unitIncrement}
                disabled={disabled}
              />
              <Button
                size="sm"
                onClick={handleCustomQuantitySubmit}
                disabled={disabled || !customQuantity}
              >
                Set
              </Button>
            </div>
          </div>

          {/* Current Selection Display */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {formatUnit(quantity, selectedSku.unitType)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedSku.name}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">
                  {formatCurrency(selectedSku.pricePerCanonicalUnit * quantity)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(selectedSku.pricePerCanonicalUnit)} per {formatUnit(1, selectedSku.unitType)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unit Increment Info */}
      {selectedSku && (
        <div className="text-xs text-muted-foreground">
          <p>
            Minimum order: {formatUnit(selectedSku.unitIncrement, selectedSku.unitType)}
          </p>
          {selectedSku.packageSize && (
            <p>
              Package size: {formatUnit(selectedSku.packageSize, selectedSku.unitType)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
