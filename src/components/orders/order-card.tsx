'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Package, 
  MapPin, 
  CreditCard, 
  Truck, 
  MessageCircle,
  ChevronRight,
  Eye
} from 'lucide-react'
import { Order, OrderStatus, PaymentStatus, ShipmentStatus } from '@/types'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'

interface OrderCardProps {
  order: Order
  onStatusUpdate?: (orderId: string, status: OrderStatus) => void
  showActions?: boolean
  className?: string
}

export function OrderCard({
  order,
  onStatusUpdate,
  showActions = true,
  className
}: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const getOrderStatusColor = (status: OrderStatus) => {
    return getStatusColor(status)
  }

  const getPaymentStatusColor = (status: PaymentStatus) => {
    return getStatusColor(status)
  }

  const getShipmentStatusColor = (status: ShipmentStatus) => {
    return getStatusColor(status)
  }

  const getLatestShipment = () => {
    return order.shipments && order.shipments.length > 0 
      ? order.shipments[order.shipments.length - 1]
      : null
  }

  const getLatestPayment = () => {
    return order.payments && order.payments.length > 0
      ? order.payments[order.payments.length - 1]
      : null
  }

  const getTotalItems = () => {
    return order.items.reduce((total, item) => total + item.requestedQty, 0)
  }

  const latestShipment = getLatestShipment()
  const latestPayment = getLatestPayment()
  const totalItems = getTotalItems()

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
            <p className="text-sm text-muted-foreground">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <Badge className={getOrderStatusColor(order.status)}>
            {order.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Merchant Info */}
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{order.merchant.displayName}</span>
        </div>

        {/* Order Items Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Items ({totalItems})</span>
            <span className="text-sm text-muted-foreground">
              {order.items.length} different products
            </span>
          </div>
          
          {/* Show first few items */}
          <div className="space-y-1">
            {order.items.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="truncate flex-1 mr-2">
                  {item.sku.product.name} - {item.sku.name}
                </span>
                <span className="text-muted-foreground">
                  {item.requestedQty} {item.sku.unitType}
                </span>
              </div>
            ))}
            {order.items.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{order.items.length - 3} more items
              </p>
            )}
          </div>
        </div>

        {/* Delivery Address */}
        {order.address && (
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">{order.address.fullName}</p>
              <p className="text-muted-foreground">
                {order.address.line1}, {order.address.city}
              </p>
            </div>
          </div>
        )}

        {/* Payment Status */}
        {latestPayment && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Payment</span>
            </div>
            <Badge className={getPaymentStatusColor(latestPayment.status)}>
              {latestPayment.status}
            </Badge>
          </div>
        )}

        {/* Shipment Status */}
        {latestShipment && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Shipment</span>
            </div>
            <Badge className={getShipmentStatusColor(latestShipment.status)}>
              {latestShipment.status.replace('_', ' ')}
            </Badge>
          </div>
        )}

        {/* Total Amount */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-lg">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-2 pt-2">
            <Link href={`/orders/${order.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Link>
            
            {/* Chat with Merchant */}
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
