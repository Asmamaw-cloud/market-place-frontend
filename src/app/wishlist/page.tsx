'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { WishlistManager } from '@/components/wishlist/wishlist-manager'

export default function WishlistPage() {
  return (
    <MainLayout>
      <div className="container py-8">
        <WishlistManager />
      </div>
    </MainLayout>
  )
}
