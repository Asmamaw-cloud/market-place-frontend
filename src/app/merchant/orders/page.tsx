'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Eye,
  Package,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  Truck,
  XCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useOrders } from '@/hooks/useOrders'
import { PriceDisplay } from '@/components/ui/price-display'
import { UnitDisplay } from '@/components/ui/unit-display'
import { cn } from '@/lib/utils'

const orderStatuses = [
  { value: 'all', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'FULFILLING', label: 'Fulfilling' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' }
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <Clock className="h-4 w-4" />
    case 'CONFIRMED':
      return <CheckCircle className="h-4 w-4" />
    case 'FULFILLING':
      return <Package className="h-4 w-4" />
    case 'SHIPPED':
      return <Truck className="h-4 w-4" />
    case 'DELIVERED':
      return <CheckCircle className="h-4 w-4" />
    case 'CANCELLED':
      return <XCircle className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'FULFILLING':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'SHIPPED':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'DELIVERED':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function MerchantOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  const router = useRouter()
  const { isAuthenticated, isMerchant } = useAuth()
  const { 
    orders, 
    isLoading, 
    error,
    fetchOrders,
    updateOrder 
  } = useOrders()

  useEffect(() => {
    if (isAuthenticated && isMerchant) {
      fetchOrders({})
    }
  }, [isAuthenticated, isMerchant, fetchOrders])

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrder(orderId, newStatus)
      // Refresh orders
      fetchOrders({})
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.user?.phone?.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesDate = dateFilter === 'all' || true // TODO: Implement date filtering
    
    return matchesSearch && matchesStatus && matchesDate
  }) || []

  const getOrderStats = () => {
    const total = filteredOrders.length
    const pending = filteredOrders.filter(o => o.status === 'PENDING').length
    const confirmed = filteredOrders.filter(o => o.status === 'CONFIRMED').length
    const fulfilling = filteredOrders.filter(o => o.status === 'FULFILLING').length
    const shipped = filteredOrders.filter(o => o.status === 'SHIPPED').length
    const delivered = filteredOrders.filter(o => o.status === 'DELIVERED').length

    return { total, pending, confirmed, fulfilling, shipped, delivered }
  }

  const stats = getOrderStats()

  if (!isAuthenticated || !isMerchant) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You need to be a merchant to access this page
            </p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Order Management</h1>
            <p className="text-muted-foreground">
              Manage and fulfill customer orders
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
              <p className="text-sm text-muted-foreground">Confirmed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.fulfilling}</p>
              <p className="text-sm text-muted-foreground">Fulfilling</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
              <p className="text-sm text-muted-foreground">Shipped</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              <p className="text-sm text-muted-foreground">Delivered</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders by ID, customer name, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Orders</h3>
                <p className="text-muted-foreground mb-4">
                  {error || 'Failed to load orders'}
                </p>
                <Button onClick={() => fetchOrders({})}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || (statusFilter !== 'all') || (dateFilter !== 'all')
                    ? 'No orders match your filters'
                    : 'You don\'t have any orders yet'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
                        <Badge className={cn("border", getStatusColor(order.status))}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(order.status)}
                            <span>{order.status}</span>
                          </span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Customer: {order.user?.name || 'Unknown'} • {order.user?.phone}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Placed: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/merchant/orders/${order.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 mb-4">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-muted">
                        <div className="flex-1">
                          <p className="font-medium">{item.sku?.product?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.sku?.unitType} • Qty: {item.requestedQty}
                          </p>
                        </div>
                        <div className="text-right">
                          <PriceDisplay amount={item.unitPrice} />
                          <p className="text-sm text-muted-foreground">
                            Subtotal: <PriceDisplay amount={item.unitPrice * item.requestedQty} />
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      {order.items?.length || 0} items
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        Total: <PriceDisplay amount={order.totalAmount} />
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Payment: {order.payments?.[0]?.status || 'Pending'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  {order.status === 'PENDING' && (
                    <div className="flex space-x-2 mt-4 pt-4 border-t">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}
                      >
                        Confirm Order
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                      >
                        Cancel Order
                      </Button>
                    </div>
                  )}

                  {order.status === 'CONFIRMED' && (
                    <div className="flex space-x-2 mt-4 pt-4 border-t">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'FULFILLING')}
                      >
                        Start Fulfilling
                      </Button>
                    </div>
                  )}

                  {order.status === 'FULFILLING' && (
                    <div className="flex space-x-2 mt-4 pt-4 border-t">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                      >
                        Mark as Shipped
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
