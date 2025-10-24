'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { GiftRegistryManager } from '@/components/gift-registry/gift-registry-manager'

export default function GiftRegistryPage() {
  return (
    <MainLayout>
      <div className="container py-8">
        <GiftRegistryManager />
      </div>
    </MainLayout>
  )
}
