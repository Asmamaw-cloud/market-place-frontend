'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Banknote,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type PaymentMethod = 'telebirr' | 'chapa' | 'amole' | 'cod'

interface PaymentMethodOption {
  id: PaymentMethod
  name: string
  description: string
  icon: React.ReactNode
  available: boolean
  processingFee?: number
  estimatedTime?: string
}

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null
  onMethodChange: (method: PaymentMethod) => void
  disabled?: boolean
  showFees?: boolean
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'telebirr',
    name: 'Telebirr',
    description: 'Pay with your Telebirr wallet',
    icon: <Smartphone className="h-5 w-5" />,
    available: true,
    processingFee: 0,
    estimatedTime: 'Instant'
  },
  {
    id: 'chapa',
    name: 'Chapa',
    description: 'Pay with Chapa payment gateway',
    icon: <CreditCard className="h-5 w-5" />,
    available: true,
    processingFee: 2.5,
    estimatedTime: '1-2 minutes'
  },
  {
    id: 'amole',
    name: 'Amole',
    description: 'Pay with Amole wallet',
    icon: <Wallet className="h-5 w-5" />,
    available: true,
    processingFee: 0,
    estimatedTime: 'Instant'
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when your order is delivered',
    icon: <Banknote className="h-5 w-5" />,
    available: true,
    processingFee: 0,
    estimatedTime: 'On delivery'
  }
]

export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  disabled = false,
  showFees = true
}: PaymentMethodSelectorProps) {
  const [hoveredMethod, setHoveredMethod] = useState<PaymentMethod | null>(null)

  const handleMethodChange = (method: PaymentMethod) => {
    if (!disabled) {
      onMethodChange(method)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
        <p className="text-sm text-muted-foreground">
          Choose how you'd like to pay for your order
        </p>
      </div>

      <RadioGroup
        value={selectedMethod || ''}
        onValueChange={handleMethodChange}
        className="space-y-3"
      >
        {paymentMethods.map((method) => (
          <div key={method.id} className="relative">
            <Card
              className={cn(
                "cursor-pointer transition-all duration-200",
                selectedMethod === method.id
                  ? "ring-2 ring-primary border-primary"
                  : "hover:border-primary/50",
                !method.available && "opacity-50 cursor-not-allowed",
                disabled && "cursor-not-allowed"
              )}
              onMouseEnter={() => setHoveredMethod(method.id)}
              onMouseLeave={() => setHoveredMethod(null)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem
                    value={method.id}
                    id={method.id}
                    disabled={disabled || !method.available}
                    className="mt-1"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        selectedMethod === method.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {method.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Label
                            htmlFor={method.id}
                            className="text-base font-medium cursor-pointer"
                          >
                            {method.name}
                          </Label>
                          {selectedMethod === method.id && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                          {!method.available && (
                            <Badge variant="secondary" className="text-xs">
                              Unavailable
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {method.description}
                        </p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        {showFees && method.processingFee !== undefined && (
                          <span>
                            {method.processingFee === 0 
                              ? "No processing fee" 
                              : `${method.processingFee}% processing fee`
                            }
                          </span>
                        )}
                        {method.estimatedTime && (
                          <span>~{method.estimatedTime}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </RadioGroup>

      {/* Selected Method Details */}
      {selectedMethod && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">
                {paymentMethods.find(m => m.id === selectedMethod)?.name} selected
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedMethod === 'cod' 
                ? "You'll pay when your order is delivered"
                : "You'll be redirected to complete the payment"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
