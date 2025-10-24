export interface ReferralProgram {
  id: string
  name: string
  description: string
  isActive: boolean
  rewardType: 'POINTS' | 'DISCOUNT' | 'CASHBACK' | 'FREE_SHIPPING'
  referrerReward: number // Points or percentage
  refereeReward: number // Points or percentage
  minOrderAmount?: number // ETB*100
  maxRewardAmount?: number // ETB*100
  expiryDays?: number
  createdAt: string
  updatedAt: string
}

export interface ReferralCode {
  id: string
  userId: string
  code: string
  isActive: boolean
  totalUses: number
  maxUses?: number
  createdAt: string
  expiresAt?: string
  user: {
    id: string
    name: string
    email: string
  }
}

export interface Referral {
  id: string
  referrerId: string
  refereeId: string
  referralCodeId: string
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'
  rewardAmount: number // ETB*100 or points
  rewardType: 'POINTS' | 'DISCOUNT' | 'CASHBACK' | 'FREE_SHIPPING'
  orderId?: string
  createdAt: string
  completedAt?: string
  referrer: {
    id: string
    name: string
    email: string
  }
  referee: {
    id: string
    name: string
    email: string
  }
  referralCode: ReferralCode
}

export interface ReferralStats {
  totalReferrals: number
  completedReferrals: number
  pendingReferrals: number
  totalEarnings: number // ETB*100
  totalPointsEarned: number
  conversionRate: number // Percentage
  topReferrers: Array<{
    userId: string
    userName: string
    totalReferrals: number
    totalEarnings: number
  }>
  recentReferrals: Referral[]
}

export interface CreateReferralCodeRequest {
  code?: string // If not provided, will be auto-generated
  maxUses?: number
  expiresAt?: string
}

export interface UseReferralCodeRequest {
  code: string
  orderId?: string
}

export interface ReferralReward {
  id: string
  userId: string
  referralId: string
  type: 'POINTS' | 'DISCOUNT' | 'CASHBACK' | 'FREE_SHIPPING'
  amount: number
  status: 'PENDING' | 'APPLIED' | 'EXPIRED'
  createdAt: string
  appliedAt?: string
  expiresAt?: string
}
