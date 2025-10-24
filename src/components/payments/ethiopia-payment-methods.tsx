'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Banknote,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { PaymentMethod } from '@/types'
import { PriceDisplay } from '@/components/ui/price-display'

interface EthiopiaPaymentMethodsProps {
  selectedMethod?: PaymentMethod
  onMethodSelect: (method: PaymentMethod) => void
  amount: number
  disabled?: boolean
}

const paymentMethods = [
  {
    id: 'TELEBIRR' as PaymentMethod,
    name: 'Telebirr',
    description: 'Ethiopia\'s leading mobile payment platform',
    icon: Smartphone,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    iconColor: 'text-blue-600',
    features: ['Instant payment', 'Wide acceptance', 'Secure'],
    instructions: 'Enter your Telebirr PIN to complete payment',
    placeholder: 'Enter Telebirr PIN',
    isAvailable: true
  },
  {
    id: 'CHAPA' as PaymentMethod,
    name: 'Chapa',
    description: 'Online payment gateway for Ethiopia',
    icon: CreditCard,
    color: 'bg-green-100 text-green-800 border-green-200',
    iconColor: 'text-green-600',
    features: ['Card payments', 'Bank transfers', 'Mobile money'],
    instructions: 'You will be redirected to Chapa payment page',
    placeholder: 'Click to proceed to payment',
    isAvailable: true
  },
  {
    id: 'AMOLE' as PaymentMethod,
    name: 'Amole',
    description: 'Ethiopian Airlines mobile wallet',
    icon: Wallet,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    iconColor: 'text-purple-600',
    features: ['Mobile wallet', 'Easy top-up', 'Rewards'],
    instructions: 'Login to your Amole account to pay',
    placeholder: 'Enter Amole credentials',
    isAvailable: true
  },
  {
    id: 'COD' as PaymentMethod,
    name: 'Cash on Delivery',
    description: 'Pay when your order arrives',
    icon: Banknote,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    iconColor: 'text-orange-600',
    features: ['No upfront payment', 'Pay on delivery', 'Cash only'],
    instructions: 'Pay the exact amount when your order is delivered',
    placeholder: 'No payment required now',
    isAvailable: true
  }
]

export function EthiopiaPaymentMethods({
  selectedMethod,
  onMethodSelect,
  amount,
  disabled = false
}: EthiopiaPaymentMethodsProps) {
  const [paymentData, setPaymentData] = useState<{ [key: string]: string }>({})

  const handleMethodSelect = (method: PaymentMethod) => {
    onMethodSelect(method)
    setPaymentData({})
  }

  const handlePaymentDataChange = (method: PaymentMethod, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [method]: value
    }))
  }

  const getSelectedMethod = () => {
    return paymentMethods.find(method => method.id === selectedMethod)
  }

  const selectedMethodData = getSelectedMethod()

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose Payment Method</h3>
        <RadioGroup
          value={selectedMethod}
          onValueChange={handleMethodSelect}
          disabled={disabled}
          className="space-y-3"
        >
          {paymentMethods.map((method) => {
            const Icon = method.icon
            return (
              <div key={method.id} className="relative">
                <Card className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  selectedMethod === method.id && 'ring-2 ring-primary',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <RadioGroupItem
                        value={method.id}
                        id={method.id}
                        className="mt-1"
                        disabled={disabled}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Icon className={cn('h-6 w-6', method.iconColor)} />
                          <div>
                            <Label
                              htmlFor={method.id}
                              className="text-base font-medium cursor-pointer"
                            >
                              {method.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {method.description}
                            </p>
                          </div>
                          <Badge className={cn('border', method.color)}>
                            {method.isAvailable ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                        
                        {/* Features */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {method.features.map((feature, index) => (
                            <span
                              key={index}
                              className="text-xs bg-muted px-2 py-1 rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>

                        {/* Payment Instructions */}
                        {selectedMethod === method.id && (
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <div className="flex items-start space-x-2">
                              <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-sm font-medium mb-1">
                                  {method.instructions}
                                </p>
                                {method.id !== 'CASH_ON_DELIVERY' && (
                                  <div className="space-y-2">
                                    <Input
                                      placeholder={method.placeholder}
                                      value={paymentData[method.id] || ''}
                                      onChange={(e) => handlePaymentDataChange(method.id, e.target.value)}
                                      disabled={disabled}
                                    />
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                      <CheckCircle className="h-4 w-4" />
                                      <span>Secure payment processing</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </RadioGroup>
      </div>

      {/* Payment Summary */}
      {selectedMethod && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Order Total</span>
              <PriceDisplay amount={amount} className="text-lg font-semibold" />
            </div>
            
            {selectedMethodData && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Payment Method</span>
                <div className="flex items-center space-x-2">
                  <selectedMethodData.icon className={cn('h-4 w-4', selectedMethodData.iconColor)} />
                  <span className="text-sm font-medium">{selectedMethodData.name}</span>
                </div>
              </div>
            )}

            {selectedMethod === 'CASH_ON_DELIVERY' && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      Cash on Delivery
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      Please have the exact amount ready when your order arrives. 
                      The delivery person will collect payment upon delivery.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod !== 'CASH_ON_DELIVERY' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Secure Payment
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Your payment information is encrypted and secure. 
                      We never store your payment details.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
