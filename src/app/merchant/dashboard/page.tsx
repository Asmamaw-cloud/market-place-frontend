'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  BarChart3,
  Eye
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useMerchants } from '@/hooks/useMerchants'
import { useProducts } from '@/hooks/useProducts'
import { useOrders } from '@/hooks/useOrders'
import { PriceDisplay } from '@/components/ui/price-display'
import { AnalyticsDashboard } from '@/components/merchants/analytics-dashboard'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function MerchantDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)

  const { isAuthenticated, isMerchant, user } = useAuth()
  const { currentMerchant: merchant, loadMerchantById } = useMerchants()
  const { products, fetchProducts } = useProducts()
  const { orders, fetchOrders } = useOrders()

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isAuthenticated || !isMerchant) return

      try {
        await Promise.all([
          loadMerchantById('current'),
          fetchProducts({ merchant: 'current' }),
          fetchOrders({})
        ])
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [isAuthenticated, isMerchant, loadMerchantById, fetchProducts, fetchOrders])

  const getDashboardStats = () => {
    const totalProducts = products?.length || 0
    const activeProducts = products?.filter(p => p.skus?.some(sku => sku.active)).length || 0
    const totalOrders = orders?.length || 0
    const pendingOrders = orders?.filter(o => o.status === 'PENDING').length || 0
    const confirmedOrders = orders?.filter(o => o.status === 'CONFIRMED').length || 0
    const fulfillingOrders = orders?.filter(o => o.status === 'FULFILLING').length || 0
    const shippedOrders = orders?.filter(o => o.status === 'SHIPPED').length || 0
    const deliveredOrders = orders?.filter(o => o.status === 'DELIVERED').length || 0
    const cancelledOrders = orders?.filter(o => o.status === 'CANCELLED').length || 0

    const totalRevenue = orders
      ?.filter(o => o.status === 'DELIVERED')
      .reduce((sum, order) => sum + order.totalAmount, 0) || 0

    const averageOrderValue = deliveredOrders > 0 ? totalRevenue / deliveredOrders : 0

    return {
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      fulfillingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      averageOrderValue
    }
  }

  const stats = getDashboardStats()

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

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
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
          <h1 className="text-3xl font-bold">Merchant Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {merchant?.displayName || user?.name || 'Merchant'}!
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    <PriceDisplay amount={stats.totalRevenue} />
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                  <p className="text-2xl font-bold">{stats.activeProducts}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold">
                    <PriceDisplay amount={stats.averageOrderValue} />
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Order Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                    {stats.pendingOrders}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Confirmed</span>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    {stats.confirmedOrders}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Fulfilling</span>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    {stats.fulfillingOrders}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Shipped</span>
                  </div>
                  <Badge variant="outline" className="text-purple-600 border-purple-200">
                    {stats.shippedOrders}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Delivered</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {stats.deliveredOrders}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders && orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">#{order.id.slice(-8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.user?.name || 'Unknown Customer'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          <PriceDisplay amount={order.totalAmount} />
                        </p>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            order.status === 'PENDING' && "text-yellow-600 border-yellow-200",
                            order.status === 'CONFIRMED' && "text-blue-600 border-blue-200",
                            order.status === 'FULFILLING' && "text-orange-600 border-orange-200",
                            order.status === 'SHIPPED' && "text-purple-600 border-purple-200",
                            order.status === 'DELIVERED' && "text-green-600 border-green-200",
                            order.status === 'CANCELLED' && "text-red-600 border-red-200"
                          )}
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/merchant/orders">View All Orders</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button asChild className="h-20 flex-col space-y-2">
                <Link href="/merchant/products/new">
                  <Package className="h-6 w-6" />
                  <span>Add Product</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                <Link href="/merchant/products">
                  <Eye className="h-6 w-6" />
                  <span>Manage Products</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                <Link href="/merchant/orders">
                  <ShoppingCart className="h-6 w-6" />
                  <span>View Orders</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                <Link href="/merchant/profile">
                  <Users className="h-6 w-6" />
                  <span>Edit Profile</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {stats.pendingOrders > 0 && (
          <Card className="mt-8 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">
                    You have {stats.pendingOrders} pending order{stats.pendingOrders > 1 ? 's' : ''} that need attention
                  </p>
                  <p className="text-sm text-yellow-700">
                    Review and confirm these orders to keep your customers happy
                  </p>
                </div>
                <Button size="sm" asChild className="ml-auto">
                  <Link href="/merchant/orders">View Orders</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {stats.activeProducts === 0 && (
          <Card className="mt-8 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">
                    Get started by adding your first product
                  </p>
                  <p className="text-sm text-blue-700">
                    Create product listings to start receiving orders from customers
                  </p>
                </div>
                <Button size="sm" asChild className="ml-auto">
                  <Link href="/merchant/products/new">Add Product</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Dashboard */}
        <div className="mt-8">
          <AnalyticsDashboard merchantId={merchant?.id || ''} />
        </div>
      </div>
    </MainLayout>
  )
}
