'use client'

import { useState, useEffect } from 'react'
import { Users, Share2, Gift, TrendingUp, Copy, Check, ExternalLink, QrCode } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useReferral } from '@/hooks/useReferral'
import { useAuth } from '@/hooks/useAuth'
import { ReferralCode, Referral, ReferralStats } from '@/types/referral'
import { cn } from '@/lib/utils'

interface ReferralDashboardProps {
  className?: string
}

export function ReferralDashboard({ className }: ReferralDashboardProps) {
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [isCreateCodeDialogOpen, setIsCreateCodeDialogOpen] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [maxUses, setMaxUses] = useState<number | undefined>()

  const { isAuthenticated } = useAuth()
  const { 
    createReferralCode,
    getReferralCode,
    getReferrals,
    getReferralStats,
    useReferralCode
  } = useReferral()

  useEffect(() => {
    if (isAuthenticated) {
      loadReferralData()
    }
  }, [isAuthenticated])

  const loadReferralData = async () => {
    setIsLoading(true)
    try {
      const [code, referralsData, statsData] = await Promise.all([
        getReferralCode(),
        getReferrals(),
        getReferralStats()
      ])
      setReferralCode(code)
      setReferrals(referralsData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load referral data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCode = async () => {
    try {
      const code = await createReferralCode({
        code: newCode || undefined,
        maxUses: maxUses || undefined
      })
      setReferralCode(code)
      setNewCode('')
      setMaxUses(undefined)
      setIsCreateCodeDialogOpen(false)
    } catch (error) {
      console.error('Failed to create referral code:', error)
    }
  }

  const handleCopyCode = async () => {
    if (referralCode) {
      const shareUrl = `${window.location.origin}/referral/${referralCode.code}`
      await navigator.clipboard.writeText(shareUrl)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'EXPIRED': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRewardTypeIcon = (type: string) => {
    switch (type) {
      case 'POINTS': return '🎯'
      case 'DISCOUNT': return '💰'
      case 'CASHBACK': return '💳'
      case 'FREE_SHIPPING': return '🚚'
      default: return '🎁'
    }
  }

  if (!isAuthenticated) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Please Login</h3>
          <p className="text-muted-foreground text-center mb-4">
            You need to be logged in to access the referral program
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
          <h2 className="text-2xl font-bold">Referral Program</h2>
          <p className="text-muted-foreground">
            Invite friends and earn rewards together
          </p>
        </div>
        {!referralCode && (
          <Dialog open={isCreateCodeDialogOpen} onOpenChange={setIsCreateCodeDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Share2 className="h-4 w-4 mr-2" />
                Create Referral Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Your Referral Code</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="code">Custom Code (Optional)</Label>
                  <Input
                    id="code"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="Leave empty for auto-generation"
                  />
                </div>
                <div>
                  <Label htmlFor="maxUses">Maximum Uses (Optional)</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    value={maxUses || ''}
                    onChange={(e) => setMaxUses(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Unlimited if empty"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateCodeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCode}>
                    Create Code
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReferrals}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedReferrals} completed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Success rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">ETB {(stats.totalEarnings / 100).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalPointsEarned} points earned
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingReferrals}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting completion
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Referral Code Section */}
      {referralCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>Your Code</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={referralCode.code}
                      readOnly
                      className="font-mono text-lg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyCode}
                    >
                      {copiedCode ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                    <QrCode className="h-8 w-8" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">QR Code</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{referralCode.totalUses}</div>
                  <p className="text-sm text-muted-foreground">Total Uses</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {referralCode.maxUses || '∞'}
                  </div>
                  <p className="text-sm text-muted-foreground">Max Uses</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {referralCode.isActive ? 'Active' : 'Inactive'}
                  </div>
                  <p className="text-sm text-muted-foreground">Status</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleCopyCode}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Share on Social
                </Button>
                <Button variant="outline">
                  <QrCode className="h-4 w-4 mr-2" />
                  Download QR
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="referrals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="referrals">My Referrals</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Referrals</CardTitle>
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
              ) : referrals.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No referrals yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Share your referral code to start earning rewards
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {referrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-lg">
                            {getRewardTypeIcon(referral.rewardType)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{referral.referee.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Referred on {new Date(referral.createdAt).toLocaleDateString()}
                          </p>
                          {referral.orderId && (
                            <p className="text-xs text-muted-foreground">
                              Order: {referral.orderId}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(referral.status)}>
                          {referral.status}
                        </Badge>
                        <p className="text-sm font-medium mt-1">
                          ETB {(referral.rewardAmount / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {referral.rewardType.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎯</span>
                    <h4 className="font-medium">Points</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Earn points for each successful referral
                  </p>
                  <p className="text-lg font-bold">100 points per referral</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💰</span>
                    <h4 className="font-medium">Discount</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Get discount on your next purchase
                  </p>
                  <p className="text-lg font-bold">10% off next order</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🚚</span>
                    <h4 className="font-medium">Free Shipping</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Free delivery on your next order
                  </p>
                  <p className="text-lg font-bold">Free shipping</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.topReferrers.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No leaderboard data yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.topReferrers.map((referrer, index) => (
                    <div key={referrer.userId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{referrer.userName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {referrer.totalReferrals} referrals
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ETB {(referrer.totalEarnings / 100).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">Total earnings</p>
                      </div>
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
