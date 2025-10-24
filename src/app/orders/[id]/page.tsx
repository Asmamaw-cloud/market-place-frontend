'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  CreditCard, 
  Truck, 
  MessageCircle,
  Download,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { useOrders } from '@/hooks/useOrders'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, formatDate, formatUnit, getStatusColor } from '@/lib/utils'
import { OrderStatus, ShipmentStatus } from '@/types'
import Link from 'next/link'

const shipmentStatusSteps = [
  { status: 'CREATED', label: 'Order Created', icon: Package },
  { status: 'PICKED_UP', label: 'Picked Up', icon: Truck },
  { status: 'IN_TRANSIT', label: 'In Transit', icon: Truck },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
]

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  
  const [otpCode, setOtpCode] = useState('')
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)

  const { currentOrder, isLoading, error, loadOrder } = useOrders()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && orderId) {
      loadOrder(orderId)
    }
  }, [isAuthenticated, orderId, loadOrder])

  const handleVerifyOtp = async () => {
    if (!otpCode || !currentOrder?.shipments?.[0]) return
    
    setIsVerifyingOtp(true)
    try {
      // In a real app, you'd call the API to verify OTP
      console.log('Verifying OTP:', otpCode)
      // await verifyShipmentOtp(currentOrder.shipments[0].id, otpCode)
    } catch (error) {
      console.error('Failed to verify OTP:', error)
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const getCurrentShipmentStatus = () => {
    if (!currentOrder?.shipments || currentOrder.shipments.length === 0) return null
    return currentOrder.shipments[currentOrder.shipments.length - 1]
  }

  const getShipmentProgress = () => {
    const shipment = getCurrentShipmentStatus()
    if (!shipment) return 0
    
    const statusIndex = shipmentStatusSteps.findIndex(step => step.status === shipment.status)
    return statusIndex >= 0 ? (statusIndex + 1) / shipmentStatusSteps.length * 100 : 0
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Login</h1>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to view order details
            </p>
            <Link href="/login">
              <Button>Login to Continue</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !currentOrder) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || 'The order you\'re looking for doesn\'t exist'}
            </p>
            <Link href="/orders">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  const shipment = getCurrentShipmentStatus()
  const progress = getShipmentProgress()

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Order #{currentOrder.id.slice(-8)}</h1>
            <p className="text-muted-foreground">
              Placed on {formatDate(currentOrder.createdAt)}
            </p>
          </div>
          <div className="ml-auto">
            <Badge className={getStatusColor(currentOrder.status)}>
              {currentOrder.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Items */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Order Items</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentOrder.items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      {item.sku.product.images && item.sku.product.images.length > 0 ? (
                        <Image
                          src={item.sku.product.images[0]}
                          alt={item.sku.product.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-muted rounded-lg">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium line-clamp-2">
                        {item.sku.product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.sku.name} - {item.sku.unitType}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm">
                          {formatUnit(item.requestedQty, item.sku.unitType)}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(item.unitPrice * item.requestedQty)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(currentOrder.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            {currentOrder.address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Delivery Address</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-medium">{currentOrder.address.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {currentOrder.address.line1}
                      {currentOrder.address.line2 && `, ${currentOrder.address.line2}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentOrder.address.city}, {currentOrder.address.region || 'Ethiopia'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentOrder.address.phone}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Information */}
            {currentOrder.payments && currentOrder.payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentOrder.payments.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">
                          {payment.provider.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Shipment Tracking */}
          <div className="space-y-6">
            {shipment ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Truck className="h-5 w-5" />
                    <span>Shipment Tracking</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Steps */}
                  <div className="space-y-4">
                    {shipmentStatusSteps.map((step, index) => {
                      const Icon = step.icon
                      const isCompleted = index < shipmentStatusSteps.findIndex(s => s.status === shipment.status)
                      const isCurrent = step.status === shipment.status
                      
                      return (
                        <div key={step.status} className="flex items-center space-x-3">
                          <div className={`
                            flex items-center justify-center w-8 h-8 rounded-full border-2
                            ${isCompleted 
                              ? 'bg-primary border-primary text-primary-foreground' 
                              : isCurrent 
                                ? 'border-primary text-primary' 
                                : 'border-muted text-muted-foreground'
                            }
                          `}>
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${
                              isCurrent ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                              {step.label}
                            </p>
                            {isCurrent && (
                              <p className="text-xs text-muted-foreground">
                                Current status
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* OTP Verification */}
                  {shipment.status === 'OUT_FOR_DELIVERY' && shipment.otp && (
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <h3 className="font-medium mb-2">Delivery Verification</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Enter the OTP code provided by the delivery person to confirm delivery.
                      </p>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter OTP"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          maxLength={6}
                        />
                        <Button
                          onClick={handleVerifyOtp}
                          disabled={!otpCode || isVerifyingOtp}
                        >
                          {isVerifyingOtp ? 'Verifying...' : 'Verify'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Tracking Code */}
                  {shipment.trackingCode && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Tracking Code</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Use this code to track your shipment
                      </p>
                      <div className="flex items-center space-x-2">
                        <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                          {shipment.trackingCode}
                        </code>
                        <Button variant="outline" size="sm">
                          Copy
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Shipment information will appear here once your order is processed.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat with Merchant
                  </Button>
                  
                  {currentOrder.invoice && (
                    <Button className="w-full" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </Button>
                  )}
                  
                  <Button className="w-full" variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Reorder Items
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
