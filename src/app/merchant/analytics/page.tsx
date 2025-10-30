'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
  Eye,
  Star,
  MessageSquare,
  BarChart3,
  PieChart,
  Activity,
  Download
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export default function MerchantAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const { isAuthenticated, isMerchant } = useAuth()

  // Mock data - in production, this would come from API
  const analytics = {
    revenue: {
      current: 45678.50,
      previous: 38456.20,
      change: 18.8,
      trend: 'up' as const
    },
    orders: {
      current: 234,
      previous: 198,
      change: 18.2,
      trend: 'up' as const
    },
    products: {
      current: 48,
      active: 45,
      outOfStock: 3,
      lowStock: 7
    },
    customers: {
      current: 187,
      previous: 156,
      change: 19.9,
      trend: 'up' as const,
      returning: 89,
      new: 98
    },
    avgOrderValue: {
      current: 195.20,
      previous: 194.20,
      change: 0.5,
      trend: 'up' as const
    },
    conversionRate: {
      current: 3.2,
      previous: 2.8,
      change: 14.3,
      trend: 'up' as const
    }
  }

  const topProducts = [
    { id: '1', name: 'Premium Ethiopian Coffee', sales: 89, revenue: 4450.00, trend: 'up' },
    { id: '2', name: 'Organic Teff Flour (1kg)', sales: 76, revenue: 3800.00, trend: 'up' },
    { id: '3', name: 'Berbere Spice Mix', sales: 65, revenue: 1950.00, trend: 'up' },
    { id: '4', name: 'Ethiopian Honey (500g)', sales: 54, revenue: 2700.00, trend: 'down' },
    { id: '5', name: 'Handwoven Basket', sales: 42, revenue: 4200.00, trend: 'up' }
  ]

  const recentActivity = [
    { type: 'order', message: 'New order #ORD-1234 received', time: '2 minutes ago', icon: ShoppingCart },
    { type: 'review', message: 'New 5-star review on Premium Coffee', time: '15 minutes ago', icon: Star },
    { type: 'message', message: 'New message from customer', time: '1 hour ago', icon: MessageSquare },
    { type: 'stock', message: 'Low stock alert: Teff Flour', time: '2 hours ago', icon: Package },
    { type: 'order', message: 'Order #ORD-1230 completed', time: '3 hours ago', icon: ShoppingCart }
  ]

  const salesByCategory = [
    { category: 'Food & Beverages', sales: 145, revenue: 18500.00, percentage: 40 },
    { category: 'Handicrafts', sales: 67, revenue: 12400.00, percentage: 27 },
    { category: 'Spices & Herbs', sales: 89, revenue: 8900.00, percentage: 20 },
    { category: 'Textiles', sales: 45, revenue: 5878.50, percentage: 13 }
  ]

  if (!isAuthenticated || !isMerchant) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You need to be a merchant to access analytics
            </p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const StatCard = ({ title, value, change, trend, icon: Icon, prefix = '', suffix = '' }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </h3>
            {change !== undefined && (
              <div className="flex items-center mt-2">
                {trend === 'up' ? (
                  <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}>
                  {change}%
                </span>
                <span className="text-sm text-muted-foreground ml-2">vs last period</span>
              </div>
            )}
          </div>
          <div className={cn(
            "h-12 w-12 rounded-lg flex items-center justify-center",
            trend === 'up' ? 'bg-green-100' : 'bg-blue-100'
          )}>
            <Icon className={cn(
              "h-6 w-6",
              trend === 'up' ? 'text-green-600' : 'text-blue-600'
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics</h1>
            <p className="text-muted-foreground">
              Track your store performance and insights
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={analytics.revenue.current}
            change={analytics.revenue.change}
            trend={analytics.revenue.trend}
            icon={DollarSign}
            prefix="ETB "
          />
          <StatCard
            title="Total Orders"
            value={analytics.orders.current}
            change={analytics.orders.change}
            trend={analytics.orders.trend}
            icon={ShoppingCart}
          />
          <StatCard
            title="Total Customers"
            value={analytics.customers.current}
            change={analytics.customers.change}
            trend={analytics.customers.trend}
            icon={Users}
          />
          <StatCard
            title="Avg. Order Value"
            value={analytics.avgOrderValue.current}
            change={analytics.avgOrderValue.change}
            trend={analytics.avgOrderValue.trend}
            icon={Activity}
            prefix="ETB "
          />
          <StatCard
            title="Conversion Rate"
            value={analytics.conversionRate.current}
            change={analytics.conversionRate.change}
            trend={analytics.conversionRate.trend}
            icon={TrendingUp}
            suffix="%"
          />
          <StatCard
            title="Active Products"
            value={analytics.products.active}
            icon={Package}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                  <CardDescription>Revenue distribution across categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesByCategory.map((category) => (
                      <div key={category.category}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{category.category}</span>
                          <div className="text-right">
                            <span className="text-sm font-bold">ETB {category.revenue.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground ml-2">({category.percentage}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${category.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates from your store</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => {
                      const Icon = activity.icon
                      return (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{activity.message}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Chart visualization coming soon
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Integrate with a charting library like Recharts or Chart.js
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>Best selling products in the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">ETB {product.revenue.toLocaleString()}</p>
                        <div className="flex items-center justify-end mt-1">
                          {product.trend === 'up' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Product Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Active Products</p>
                      <h3 className="text-2xl font-bold">{analytics.products.active}</h3>
                    </div>
                    <Package className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Low Stock</p>
                      <h3 className="text-2xl font-bold text-yellow-600">{analytics.products.lowStock}</h3>
                    </div>
                    <Package className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Out of Stock</p>
                      <h3 className="text-2xl font-bold text-red-600">{analytics.products.outOfStock}</h3>
                    </div>
                    <Package className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Overview</CardTitle>
                  <CardDescription>Customer acquisition and retention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Total Customers</span>
                        <span className="text-2xl font-bold">{analytics.customers.current}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">New Customers</span>
                        <span className="text-lg font-bold text-green-600">{analytics.customers.new}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(analytics.customers.new / analytics.customers.current) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Returning Customers</span>
                        <span className="text-lg font-bold text-blue-600">{analytics.customers.returning}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(analytics.customers.returning / analytics.customers.current) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Satisfaction</CardTitle>
                  <CardDescription>Reviews and ratings summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-4xl font-bold">4.8</span>
                          <Star className="h-6 w-6 text-yellow-500 fill-yellow-500 ml-2" />
                        </div>
                        <p className="text-sm text-muted-foreground">Based on 248 reviews</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center space-x-2">
                          <span className="text-sm w-12">{stars} star</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500"
                              style={{ width: `${stars === 5 ? 75 : stars === 4 ? 15 : stars === 3 ? 7 : stars === 2 ? 2 : 1}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {stars === 5 ? 186 : stars === 4 ? 37 : stars === 3 ? 17 : stars === 2 ? 5 : 3}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>Detailed sales metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Gross Sales</p>
                    <p className="text-2xl font-bold">ETB {analytics.revenue.current.toLocaleString()}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Net Sales</p>
                    <p className="text-2xl font-bold">ETB {(analytics.revenue.current * 0.95).toLocaleString()}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Orders</p>
                    <p className="text-2xl font-bold">{analytics.orders.current}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Avg. Order Value</p>
                    <p className="text-2xl font-bold">ETB {analytics.avgOrderValue.current.toLocaleString()}</p>
                  </div>
                </div>

                <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Sales breakdown chart coming soon
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

