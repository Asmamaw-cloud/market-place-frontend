'use client'

import { useState, useEffect } from 'react'
import { Package, Users, TrendingUp, Plus, ShoppingCart, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useBulkOrdering } from '@/hooks/useBulkOrdering'
import { useAuth } from '@/hooks/useAuth'
import { BulkOrder, GroupBuy, BulkOrderQuote } from '@/types/bulk-ordering'
import { cn } from '@/lib/utils'

interface BulkOrderManagerProps {
  className?: string
}

export function BulkOrderManager({ className }: BulkOrderManagerProps) {
  const [bulkOrders, setBulkOrders] = useState<BulkOrder[]>([])
  const [groupBuys, setGroupBuys] = useState<GroupBuy[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateOrderDialogOpen, setIsCreateOrderDialogOpen] = useState(false)
  const [isCreateGroupBuyDialogOpen, setIsCreateGroupBuyDialogOpen] = useState(false)
  const [selectedMerchant, setSelectedMerchant] = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState('')

  const { isAuthenticated } = useAuth()
  const { 
    createBulkOrder,
    getBulkOrders,
    getGroupBuys,
    createGroupBuy,
    joinGroupBuy,
    getBulkOrderQuote
  } = useBulkOrdering()

  useEffect(() => {
    if (isAuthenticated) {
      loadBulkOrderData()
    }
  }, [isAuthenticated])

  const loadBulkOrderData = async () => {
    setIsLoading(true)
    try {
      const [orders, groupBuyData] = await Promise.all([
        getBulkOrders(),
        getGroupBuys()
      ])
      setBulkOrders(orders)
      setGroupBuys(groupBuyData)
    } catch (error) {
      console.error('Failed to load bulk order data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBulkOrder = async () => {
    if (!selectedMerchant) return

    try {
      // This would be implemented with actual product selection
      await createBulkOrder({
        merchantId: selectedMerchant,
        items: [], // Would be populated from product selection
        notes: orderNotes || undefined,
        requestedDeliveryDate: requestedDeliveryDate || undefined
      })
      setOrderNotes('')
      setRequestedDeliveryDate('')
      setIsCreateOrderDialogOpen(false)
      loadBulkOrderData()
    } catch (error) {
      console.error('Failed to create bulk order:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'PROCESSING': return 'bg-blue-100 text-blue-800'
      case 'SHIPPED': return 'bg-purple-100 text-purple-800'
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getGroupBuyStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'FULFILLED': return 'bg-blue-100 text-blue-800'
      case 'EXPIRED': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  if (!isAuthenticated) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Please Login</h3>
          <p className="text-muted-foreground text-center mb-4">
            You need to be logged in to access bulk ordering
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
          <h2 className="text-2xl font-bold">Bulk Ordering & Group Buying</h2>
          <p className="text-muted-foreground">
            Order in bulk for better prices or join group buys for discounts
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCreateGroupBuyDialogOpen} onOpenChange={setIsCreateGroupBuyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Start Group Buy
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start a Group Buy</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="product">Select Product</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* This would be populated with available products */}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetQuantity">Target Quantity</Label>
                  <Input id="targetQuantity" type="number" placeholder="Enter target quantity" />
                </div>
                <div>
                  <Label htmlFor="discount">Discount Percentage</Label>
                  <Input id="discount" type="number" placeholder="Enter discount %" />
                </div>
                <div>
                  <Label htmlFor="expiresAt">Expires At</Label>
                  <Input id="expiresAt" type="datetime-local" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateGroupBuyDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsCreateGroupBuyDialogOpen(false)}>
                    Start Group Buy
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateOrderDialogOpen} onOpenChange={setIsCreateOrderDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Bulk Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Bulk Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="merchant">Select Merchant</Label>
                  <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a merchant" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* This would be populated with available merchants */}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Add any special instructions..."
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryDate">Requested Delivery Date</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={requestedDeliveryDate}
                    onChange={(e) => setRequestedDeliveryDate(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateOrderDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateBulkOrder}>
                    Create Order
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="bulk-orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bulk-orders">Bulk Orders</TabsTrigger>
          <TabsTrigger value="group-buys">Group Buys</TabsTrigger>
          <TabsTrigger value="quotes">Get Quotes</TabsTrigger>
        </TabsList>

        <TabsContent value="bulk-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Bulk Orders</CardTitle>
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
              ) : bulkOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No bulk orders yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Create your first bulk order to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bulkOrders.map((order) => (
                    <div key={order.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium">Order #{order.id.slice(-8)}</h4>
                          <p className="text-sm text-muted-foreground">
                            {order.merchant.displayName}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <p className="text-sm font-medium mt-1">
                            ETB {(order.totalAmount / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Items:</span>
                          <p className="font-medium">{order.items.length}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <p className="font-medium">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Delivery:</span>
                          <p className="font-medium">
                            {order.requestedDeliveryDate 
                              ? new Date(order.requestedDeliveryDate).toLocaleDateString()
                              : 'Not specified'
                            }
                          </p>
                        </div>
                      </div>

                      {order.notes && (
                        <div className="mt-4 p-3 bg-muted rounded">
                          <p className="text-sm">
                            <span className="font-medium">Notes:</span> {order.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="group-buys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Group Buys</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : groupBuys.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active group buys</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start a group buy to get discounts on bulk purchases
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupBuys.map((groupBuy) => {
                    const progress = getProgressPercentage(groupBuy.currentQuantity, groupBuy.targetQuantity)
                    const timeLeft = new Date(groupBuy.expiresAt).getTime() - Date.now()
                    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24))
                    
                    return (
                      <div key={groupBuy.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={groupBuy.product.images[0] || '/placeholder-product.jpg'}
                              alt={groupBuy.product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div>
                              <h4 className="font-medium">{groupBuy.product.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {groupBuy.product.merchant.displayName}
                              </p>
                              <p className="text-sm font-medium">
                                ETB {(groupBuy.unitPrice / 100).toFixed(2)} per unit
                                <span className="text-green-600 ml-2">
                                  ({groupBuy.discountPercentage}% off)
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getGroupBuyStatusColor(groupBuy.status)}>
                              {groupBuy.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span>Progress</span>
                              <span>{groupBuy.currentQuantity} / {groupBuy.targetQuantity}</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Participants:</span>
                              <p className="font-medium">{groupBuy.participants.length}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Savings:</span>
                              <p className="font-medium text-green-600">
                                ETB {((groupBuy.unitPrice * groupBuy.discountPercentage / 100) / 100).toFixed(2)} per unit
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Value:</span>
                              <p className="font-medium">
                                ETB {((groupBuy.unitPrice * groupBuy.currentQuantity) / 100).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button size="sm">
                              <Users className="h-4 w-4 mr-1" />
                              Join Group Buy
                            </Button>
                            <Button variant="outline" size="sm">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Get Bulk Order Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Get quotes from multiple merchants</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Compare prices and delivery times for your bulk order
                </p>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Request Quote
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
