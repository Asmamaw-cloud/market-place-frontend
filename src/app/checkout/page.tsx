'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { AddressForm } from '@/components/addresses/address-form'
import { PaymentMethodSelector } from '@/components/payments/payment-method-selector'
import { CartItem } from '@/components/cart/cart-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  CheckCircle, 
  MapPin, 
  CreditCard, 
  Package,
  ArrowLeft,
  ArrowRight,
  Shield
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { useOrders } from '@/hooks/useOrders'
import { AddressFormData } from '@/types'
import { PaymentMethod } from '@/components/payments/payment-method-selector'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

const steps = [
  { id: 'address', title: 'Delivery Address', icon: MapPin },
  { id: 'payment', title: 'Payment Method', icon: CreditCard },
  { id: 'review', title: 'Review Order', icon: Package },
]

export default function CheckoutPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedAddress, setSelectedAddress] = useState<AddressFormData | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)

  const { items, totalAmount, loadCart } = useCart()
  const { isAuthenticated } = useAuth()
  const { createOrder } = useOrders()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadCart()
  }, [isAuthenticated, router, loadCart])

  const handleAddressSubmit = (data: AddressFormData) => {
    setSelectedAddress(data)
    setCurrentStep(1)
  }

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method)
    setCurrentStep(2)
  }

  const handleCreateOrder = async () => {
    if (!selectedAddress || !selectedPaymentMethod) return

    setIsCreatingOrder(true)
    try {
      // In a real app, you'd need to create the address first, then create the order
      const order = await createOrder({
        addressId: 'temp-address-id', // This would be the created address ID
        paymentProvider: selectedPaymentMethod
      })
      
      if (order) {
        // Navigate to orders page - the order ID will be available in the orders list
        router.push('/orders')
      }
    } catch (error) {
      console.error('Failed to create order:', error)
    } finally {
      setIsCreatingOrder(false)
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0:
        return selectedAddress !== null
      case 1:
        return selectedPaymentMethod !== null
      case 2:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canProceedToNext() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Login</h1>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to checkout
            </p>
            <Link href="/login">
              <Button>Login to Continue</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-6">
              Add some products to checkout
            </p>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/cart">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-muted-foreground">
              Complete your order in {steps.length} simple steps
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step Indicator */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => {
                    const Icon = step.icon
                    const isCompleted = index < currentStep
                    const isCurrent = index === currentStep
                    
                    return (
                      <div key={step.id} className="flex items-center">
                        <div className={`
                          flex items-center justify-center w-10 h-10 rounded-full border-2
                          ${isCompleted 
                            ? 'bg-primary border-primary text-primary-foreground' 
                            : isCurrent 
                              ? 'border-primary text-primary' 
                              : 'border-muted text-muted-foreground'
                          }
                        `}>
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className={`text-sm font-medium ${
                            isCurrent ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                            {step.title}
                          </p>
                        </div>
                        {index < steps.length - 1 && (
                          <div className="flex-1 h-px bg-muted mx-4" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Step Content */}
            <Card>
              <CardHeader>
                <CardTitle>{steps[currentStep].title}</CardTitle>
              </CardHeader>
              <CardContent>
                {currentStep === 0 && (
                  <AddressForm
                    onSubmit={handleAddressSubmit}
                    title="Delivery Address"
                  />
                )}

                {currentStep === 1 && (
                  <PaymentMethodSelector
                    selectedMethod={selectedPaymentMethod}
                    onMethodChange={handlePaymentMethodSelect}
                  />
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    {/* Order Summary */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                      <div className="space-y-4">
                        {items.map((item) => (
                          <CartItem
                            key={item.id}
                            item={item}
                            showMerchant={true}
                            disabled={true}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    {selectedAddress && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
                        <Card>
                          <CardContent className="p-4">
                            <div className="space-y-1">
                              <p className="font-medium">{selectedAddress.fullName}</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedAddress.line1}
                                {selectedAddress.line2 && `, ${selectedAddress.line2}`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {selectedAddress.city}, {selectedAddress.region || 'Ethiopia'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {selectedAddress.phone}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Payment Method */}
                    {selectedPaymentMethod && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <CreditCard className="h-5 w-5" />
                              <span className="font-medium capitalize">
                                {selectedPaymentMethod.replace('_', ' ')}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Terms and Conditions */}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <Shield className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Escrow Protection</p>
                          <p className="text-sm text-muted-foreground">
                            Your payment is held securely until delivery is confirmed. 
                            You can request a refund if you're not satisfied.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedToNext()}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreateOrder}
                  disabled={!canProceedToNext() || isCreatingOrder}
                  size="lg"
                >
                  {isCreatingOrder ? 'Creating Order...' : 'Place Order'}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>Free</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Why Shop with Us?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Escrow protection</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Verified merchants</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Package className="h-4 w-4 text-primary" />
                  <span>Local delivery</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
