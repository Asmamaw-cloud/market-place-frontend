'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { BulkOrderManager } from '@/components/bulk-ordering/bulk-order-manager'

export default function BulkOrdersPage() {
  return (
    <MainLayout>
      <div className="container py-8">
        <BulkOrderManager />
      </div>
    </MainLayout>
  )
}
