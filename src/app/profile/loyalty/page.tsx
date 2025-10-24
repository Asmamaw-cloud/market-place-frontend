'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Gift, 
  Star, 
  ArrowLeft,
  TrendingUp,
  Award,
  Clock,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface LoyaltyTransaction {
  id: string
  points: number
  reason: string
  type: 'earned' | 'redeemed' | 'expired'
  createdAt: string
  orderId?: string
}

// Mock data - in a real app, this would come from the API
const mockTransactions: LoyaltyTransaction[] = [
  {
    id: '1',
    points: 100,
    reason: 'Order completed',
    type: 'earned',
    createdAt: '2024-01-15T10:00:00Z',
    orderId: 'ORD-123456'
  },
  {
    id: '2',
    points: 50,
    reason: 'Product review',
    type: 'earned',
    createdAt: '2024-01-14T15:30:00Z'
  },
  {
    id: '3',
    points: -25,
    reason: 'Redeemed for discount',
    type: 'redeemed',
    createdAt: '2024-01-13T09:15:00Z',
    orderId: 'ORD-123455'
  },
  {
    id: '4',
    points: 75,
    reason: 'First order bonus',
    type: 'earned',
    createdAt: '2024-01-12T14:20:00Z',
    orderId: 'ORD-123454'
  }
]

const loyaltyTiers = [
  {
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 499,
    color: 'bg-amber-100 text-amber-800',
    benefits: ['Basic support', 'Standard delivery']
  },
  {
    name: 'Silver',
    minPoints: 500,
    maxPoints: 999,
    color: 'bg-gray-100 text-gray-800',
    benefits: ['Priority support', 'Free delivery', 'Early access to sales']
  },
  {
    name: 'Gold',
    minPoints: 1000,
    maxPoints: 1999,
    color: 'bg-yellow-100 text-yellow-800',
    benefits: ['VIP support', 'Free delivery', 'Exclusive products', 'Birthday rewards']
  },
  {
    name: 'Platinum',
    minPoints: 2000,
    maxPoints: Infinity,
    color: 'bg-purple-100 text-purple-800',
    benefits: ['Concierge support', 'Free delivery', 'Exclusive products', 'Birthday rewards', 'Personal shopper']
  }
]

export default function LoyaltyPage() {
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalPoints, setTotalPoints] = useState(0)

  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      // Simulate API call
      setTimeout(() => {
        setTransactions(mockTransactions)
        setTotalPoints(mockTransactions.reduce((sum, t) => sum + t.points, 0))
        setIsLoading(false)
      }, 1000)
    }
  }, [isAuthenticated])

  const getCurrentTier = () => {
    return loyaltyTiers.find(tier => 
      totalPoints >= tier.minPoints && totalPoints < tier.maxPoints
    ) || loyaltyTiers[0]
  }

  const getNextTier = () => {
    const currentTier = getCurrentTier()
    const currentIndex = loyaltyTiers.findIndex(tier => tier.name === currentTier.name)
    return currentIndex < loyaltyTiers.length - 1 ? loyaltyTiers[currentIndex + 1] : null
  }

  const getProgressToNextTier = () => {
    const currentTier = getCurrentTier()
    const nextTier = getNextTier()
    
    if (!nextTier) return 100
    
    const progress = ((totalPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    return Math.min(100, Math.max(0, progress))
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <Gift className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Please Login</h1>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to view your loyalty points
            </p>
            <Link href="/login">
              <Button>Login to Continue</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  const currentTier = getCurrentTier()
  const nextTier = getNextTier()
  const progress = getProgressToNextTier()

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/profile">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Loyalty Points</h1>
            <p className="text-muted-foreground">
              Earn points with every purchase and unlock exclusive benefits
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Points Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Points */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Your Points</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-4xl font-bold text-primary">
                      {totalPoints.toLocaleString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={currentTier.color}>
                        {currentTier.name} Member
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {currentTier.benefits.length} benefits
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tier Progress */}
            {nextTier && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Progress to {nextTier.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>{totalPoints} points</span>
                        <span>{nextTier.minPoints} points needed</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className="bg-primary h-3 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {nextTier.minPoints - totalPoints} more points to reach {nextTier.name}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Current Tier Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Your {currentTier.name} Benefits</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-4 w-3/4" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentTier.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center space-x-4">
                        <div className={`
                          flex items-center justify-center w-8 h-8 rounded-full
                          ${transaction.type === 'earned' 
                            ? 'bg-green-100 text-green-600' 
                            : transaction.type === 'redeemed'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-600'
                          }
                        `}>
                          {transaction.type === 'earned' ? (
                            <Star className="h-4 w-4" />
                          ) : transaction.type === 'redeemed' ? (
                            <Gift className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{transaction.reason}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(transaction.createdAt)}
                            {transaction.orderId && ` • Order ${transaction.orderId}`}
                          </p>
                        </div>
                        
                        <div className={`
                          text-sm font-medium
                          ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}
                        `}>
                          {transaction.points > 0 ? '+' : ''}{transaction.points}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How to Earn Points */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">How to Earn Points</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Complete an order</span>
                  <Badge variant="secondary">+100</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Write a review</span>
                  <Badge variant="secondary">+50</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Refer a friend</span>
                  <Badge variant="secondary">+200</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">First order bonus</span>
                  <Badge variant="secondary">+75</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Redeem Points */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Redeem Points</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Use your points for discounts and exclusive offers
                  </p>
                  <Button className="w-full" disabled={totalPoints < 100}>
                    <Gift className="h-4 w-4 mr-2" />
                    Redeem Points
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* All Tiers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">All Tiers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loyaltyTiers.map((tier) => (
                  <div key={tier.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        className={`
                          ${tier.name === currentTier.name ? tier.color : 'bg-muted text-muted-foreground'}
                        `}
                      >
                        {tier.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {tier.minPoints}+ points
                      </span>
                    </div>
                    {tier.name === currentTier.name && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
