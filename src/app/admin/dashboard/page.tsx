'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users,
  Store,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  BarChart3,
  Shield,
  Activity
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useMerchants } from '@/hooks/useMerchants'
import { useProducts } from '@/hooks/useProducts'
import { useOrders } from '@/hooks/useOrders'
import { PriceDisplay } from '@/components/ui/price-display'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [systemMetrics, setSystemMetrics] = useState<any>(null)

  const { isAuthenticated, isAdmin, user } = useAuth()
  const { merchants, fetchMerchants } = useMerchants()
  const { products, fetchProducts } = useProducts()
  const { orders, fetchOrders } = useOrders()

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isAuthenticated || !isAdmin) return

      try {
        await Promise.all([
          fetchMerchants(),
          fetchProducts(),
          fetchOrders()
        ])

        // Fetch system metrics
        try {
          const response = await fetch('/api/metrics')
          if (response.ok) {
            const metrics = await response.json()
            setSystemMetrics(metrics)
          }
        } catch (error) {
          console.error('Failed to fetch system metrics:', error)
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [isAuthenticated, isAdmin, fetchMerchants, fetchProducts, fetchOrders])

  const getDashboardStats = () => {
    const totalUsers = 0 // TODO: Implement user count
    const totalMerchants = merchants?.length || 0
    const activeMerchants = merchants?.length || 0 // All merchants are considered active
    const verifiedMerchants = merchants?.filter(m => m.kyc?.status === 'APPROVED').length || 0
    const totalProducts = products?.length || 0
    const activeProducts = products?.filter(p => p.skus?.some(sku => sku.active)).length || 0
    const totalOrders = orders?.length || 0
    const pendingOrders = orders?.filter(o => o.status === 'PENDING').length || 0
    const completedOrders = orders?.filter(o => o.status === 'DELIVERED').length || 0
    const cancelledOrders = orders?.filter(o => o.status === 'CANCELLED').length || 0

    const totalRevenue = orders
      ?.filter(o => o.status === 'DELIVERED')
      .reduce((sum, order) => sum + order.totalAmount, 0) || 0

    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0

    return {
      totalUsers,
      totalMerchants,
      activeMerchants,
      verifiedMerchants,
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      averageOrderValue
    }
  }

  const stats = getDashboardStats()

  if (!isAuthenticated || !isAdmin) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You need admin privileges to access this page
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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'Admin'}! Here's your system overview.
          </p>
        </div>

        {/* Key Metrics */}
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
                  <p className="text-sm font-medium text-muted-foreground">Active Merchants</p>
                  <p className="text-2xl font-bold">{stats.activeMerchants}</p>
                </div>
                <Store className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
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
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {stats.completedOrders}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Cancelled</span>
                  </div>
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    {stats.cancelledOrders}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Merchant Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Merchant Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Store className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Total Merchants</span>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    {stats.totalMerchants}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Active</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {stats.activeMerchants}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Verified</span>
                  </div>
                  <Badge variant="outline" className="text-purple-600 border-purple-200">
                    {stats.verifiedMerchants}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        {systemMetrics && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {systemMetrics.uptime || '99.9%'}
                  </div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {systemMetrics.responseTime || '120ms'}
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {systemMetrics.activeConnections || '1,234'}
                  </div>
                  <p className="text-sm text-muted-foreground">Active Connections</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button asChild className="h-20 flex-col space-y-2">
                <Link href="/admin/users">
                  <Users className="h-6 w-6" />
                  <span>Manage Users</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                <Link href="/admin/merchants">
                  <Store className="h-6 w-6" />
                  <span>Manage Merchants</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                <Link href="/admin/orders">
                  <ShoppingCart className="h-6 w-6" />
                  <span>View All Orders</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                <Link href="/admin/chat/reports">
                  <Shield className="h-6 w-6" />
                  <span>Content Moderation</span>
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
                    {stats.pendingOrders} orders are pending merchant confirmation
                  </p>
                  <p className="text-sm text-yellow-700">
                    Monitor order flow to ensure smooth customer experience
                  </p>
                </div>
                <Button size="sm" asChild className="ml-auto">
                  <Link href="/admin/orders">View Orders</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {stats.verifiedMerchants < stats.totalMerchants && (
          <Card className="mt-8 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">
                    {stats.totalMerchants - stats.verifiedMerchants} merchants need verification
                  </p>
                  <p className="text-sm text-blue-700">
                    Review merchant applications and KYC documents
                  </p>
                </div>
                <Button size="sm" asChild className="ml-auto">
                  <Link href="/admin/merchants">Review Merchants</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
