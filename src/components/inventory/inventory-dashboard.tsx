'use client'

import { useState, useEffect } from 'react'
import { Package, AlertTriangle, Clock, TrendingUp, MapPin, Plus, Filter, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useInventory } from '@/hooks/useInventory'
import { useAuth } from '@/hooks/useAuth'
import { InventoryLot, InventoryMovement, InventoryAnalytics, StockAlert } from '@/types/inventory'
import { cn } from '@/lib/utils'

interface InventoryDashboardProps {
  className?: string
}

export function InventoryDashboard({ className }: InventoryDashboardProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddLotDialogOpen, setIsAddLotDialogOpen] = useState(false)
  const [analytics, setAnalytics] = useState<InventoryAnalytics | null>(null)
  const [alerts, setAlerts] = useState<StockAlert[]>([])

  const { isAuthenticated } = useAuth()
  const { 
    lots, 
    movements, 
    locations, 
    isLoading, 
    loadInventoryLots,
    loadInventoryMovements,
    loadInventoryLocations,
    loadInventoryAnalytics,
    loadStockAlerts
  } = useInventory()

  useEffect(() => {
    if (isAuthenticated) {
      loadInventoryLots()
      loadInventoryMovements()
      loadInventoryLocations()
      loadInventoryAnalytics().then((data) => setAnalytics(data.analytics as any || null)).catch(console.error)
      loadStockAlerts().then((data) => setAlerts(data.alerts as any || [])).catch(console.error)
    }
  }, [isAuthenticated, loadInventoryLots, loadInventoryMovements, loadInventoryLocations, loadInventoryAnalytics, loadStockAlerts])

  const filteredLots = lots.filter(lot => {
    const matchesLocation = selectedLocation === 'all' || lot.locationId === selectedLocation
    const matchesSearch = searchQuery === '' || 
      lot.sku.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.sku.product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesLocation && matchesSearch
  })

  const getStockStatus = (quantity: number, unitType: string) => {
    if (quantity === 0) return { status: 'out', color: 'bg-red-100 text-red-800', label: 'Out of Stock' }
    if (quantity < 10) return { status: 'low', color: 'bg-yellow-100 text-yellow-800', label: 'Low Stock' }
    return { status: 'good', color: 'bg-green-100 text-green-800', label: 'In Stock' }
  }

  const getExpiryStatus = (expiry?: string) => {
    if (!expiry) return { status: 'none', color: 'bg-gray-100 text-gray-800', label: 'No Expiry' }
    
    const expiryDate = new Date(expiry)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) return { status: 'expired', color: 'bg-red-100 text-red-800', label: 'Expired' }
    if (daysUntilExpiry <= 7) return { status: 'expiring', color: 'bg-orange-100 text-orange-800', label: 'Expiring Soon' }
    return { status: 'good', color: 'bg-green-100 text-green-800', label: 'Fresh' }
  }

  if (!isAuthenticated) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Please Login</h3>
          <p className="text-muted-foreground text-center mb-4">
            You need to be logged in to access inventory management
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Login to Continue
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-muted-foreground">
            Manage your inventory, track stock levels, and monitor movements
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddLotDialogOpen} onOpenChange={setIsAddLotDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Stock</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sku">Select Product SKU</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product SKU" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* This would be populated with available SKUs */}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" placeholder="Enter quantity" />
                </div>
                <div>
                  <Label htmlFor="expiry">Expiry Date (Optional)</Label>
                  <Input id="expiry" type="date" />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="batchNumber">Batch Number (Optional)</Label>
                  <Input id="batchNumber" placeholder="Enter batch number" />
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier (Optional)</Label>
                  <Input id="supplier" placeholder="Enter supplier name" />
                </div>
                <div>
                  <Label htmlFor="costPrice">Cost Price (Optional)</Label>
                  <Input id="costPrice" type="number" placeholder="Enter cost price in ETB" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddLotDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsAddLotDialogOpen(false)}>
                    Add Stock
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">ETB {(analytics.totalValue / 100).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.totalQuantity} total units
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{analytics.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">
                Need restocking
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{analytics.expiringSoonItems}</div>
              <p className="text-xs text-muted-foreground">
                Within 7 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{analytics.expiredItems}</div>
              <p className="text-xs text-muted-foreground">
                Need disposal
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stock Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={alert.sku.product.images[0] || '/placeholder-product.jpg'}
                      alt={alert.sku.product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{alert.sku.product.name}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {alert.type.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Current Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredLots.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No inventory found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLots.map((lot) => {
                    const stockStatus = getStockStatus(lot.quantity, lot.sku.unitType)
                    const expiryStatus = getExpiryStatus(lot.expiry)
                    
                    return (
                      <div key={lot.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <img
                            src={lot.sku.product.images[0] || '/placeholder-product.jpg'}
                            alt={lot.sku.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <h4 className="font-medium">{lot.sku.product.name}</h4>
                            <p className="text-sm text-muted-foreground">{lot.sku.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={stockStatus.color}>
                                {stockStatus.label}
                              </Badge>
                              <Badge className={expiryStatus.color}>
                                {expiryStatus.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {lot.quantity} {lot.sku.unitType.toLowerCase()}
                          </p>
                          {lot.location && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {lot.location.name}
                            </p>
                          )}
                          {lot.batchNumber && (
                            <p className="text-xs text-muted-foreground">
                              Batch: {lot.batchNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Movements</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : movements.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No movements found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {movements.slice(0, 10).map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          movement.type === 'IN' ? 'bg-green-100 text-green-600' :
                          movement.type === 'OUT' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        )}>
                          {movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : '±'}
                        </div>
                        <div>
                          <h4 className="font-medium">{movement.lot.sku.product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {movement.type} - {movement.quantity} {movement.lot.sku.unitType.toLowerCase()}
                          </p>
                          {movement.reason && (
                            <p className="text-xs text-muted-foreground">{movement.reason}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(movement.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(movement.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Locations</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : locations.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No locations found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locations.map((location) => (
                    <div key={location.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">{location.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{location.address}</p>
                      <Badge variant={location.isActive ? 'default' : 'secondary'}>
                        {location.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
