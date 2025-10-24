'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { OrderCard } from '@/components/orders/order-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Filter, 
  Search,
  Plus
} from 'lucide-react'
import { useOrders } from '@/hooks/useOrders'
import { useAuth } from '@/hooks/useAuth'
import { OrderStatus } from '@/types'
import { cn } from '@/lib/utils'

const statusFilters = [
  { value: '', label: 'All Orders' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'FULFILLING', label: 'Fulfilling' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export default function OrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const { orders, isLoading, error, loadOrders, setFilters } = useOrders()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders({ status: selectedStatus || undefined })
    }
  }, [isAuthenticated, selectedStatus, loadOrders])

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status)
    setFilters({ status: status || undefined })
  }

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true
    return order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
           order.merchant.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Please Login</h1>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to view your orders
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">
            Track and manage your orders
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md"
              />
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={selectedStatus === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => loadOrders()}>Try Again</Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Orders Found</h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedStatus 
                ? 'No orders match your current filters'
                : 'You haven\'t placed any orders yet'
              }
            </p>
            {!searchQuery && !selectedStatus && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Start Shopping
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                showActions={true}
              />
            ))}
          </div>
        )}

        {/* Order Statistics */}
        {orders.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Order Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {orders.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Orders
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {orders.filter(o => o.status === 'DELIVERED').length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Delivered
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {orders.filter(o => ['PENDING', 'CONFIRMED', 'FULFILLING', 'SHIPPED'].includes(o.status)).length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    In Progress
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {orders.filter(o => o.status === 'CANCELLED').length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cancelled
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
