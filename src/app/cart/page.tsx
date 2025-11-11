'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { CartItem } from '@/components/cart/cart-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  ArrowLeft, 
  Trash2, 
  CreditCard,
  MapPin,
  Package
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default function CartPage() {
  const router = useRouter()
  const { items, totalItems, totalAmount, isLoading, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [isClearing, setIsClearing] = useState(false)

  // Note: Cart is already loaded by useCart hook on mount
  // No need to call loadCart here to avoid infinite loops

  const handleClearCart = async () => {
    setIsClearing(true)
    try {
      await clearCart()
    } finally {
      setIsClearing(false)
    }
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    router.push('/checkout')
  }

  // Debug: Log items to see what we have
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('Cart Page - Items:', {
        itemsLength: items.length,
        items,
        totalItems,
        totalAmount
      })
    }
  }, [items, totalItems, totalAmount])

  // Consolidate duplicate items by skuId (sum quantities)
  // Only require basic item structure, not product (we'll handle missing product in UI)
  const consolidatedItems = Object.values(
    items.reduce((acc, item) => {
      // Only filter out completely invalid items (no id or skuId)
      if (!item || !item.id || !item.skuId) {
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.warn('Filtered out invalid item in consolidation:', item)
        }
        return acc
      }
      const key = item.skuId
      if (!acc[key]) {
        acc[key] = { ...item }
      } else {
        acc[key] = { ...acc[key], quantity: acc[key].quantity + item.quantity }
      }
      return acc
    }, {} as Record<string, typeof items[number]>)
  )
  
  // Debug: Log consolidated items
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('Cart Page - Consolidated Items:', {
        consolidatedItemsLength: consolidatedItems.length,
        consolidatedItems
      })
    }
  }, [consolidatedItems])

  // compute subtotal just once from consolidated items for clarity in the summary
  const consolidatedSubtotal = consolidatedItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Please Login</h1>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to view your cart
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
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Skeleton className="w-20 h-20 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-6 w-1/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-6">
              Add some products to get started
            </p>
            <Link href="/products">
              <Button>
                <Package className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Shopping Cart</h1>
              <p className="text-muted-foreground">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
          
          {items.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearCart}
              disabled={isClearing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isClearing ? 'Clearing...' : 'Clear Cart'}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Products</h2>
              <span className="text-sm text-muted-foreground">
                {consolidatedItems.length} {consolidatedItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            
            {consolidatedItems.length > 0 ? (
              <div className="space-y-4">
                {consolidatedItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    showMerchant={true}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No items in your cart</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Items ({totalItems})</span>
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
                
                <Button 
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </Button>
                
                <div className="text-xs text-muted-foreground text-center">
                  <p>Your payment is protected by escrow</p>
                  <p>You'll pay when your order is delivered</p>
                </div>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Security & Protection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Escrow protection</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Secure payments</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Local merchants</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
