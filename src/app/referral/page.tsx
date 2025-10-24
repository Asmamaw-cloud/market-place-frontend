'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { ReferralDashboard } from '@/components/referral/referral-dashboard'

export default function ReferralPage() {
  return (
    <MainLayout>
      <div className="container py-8">
        <ReferralDashboard />
      </div>
    </MainLayout>
  )
}
