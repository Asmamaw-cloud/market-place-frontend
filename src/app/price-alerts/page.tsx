'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { PriceAlertButton } from '@/components/price-alerts/price-alert-button'

export default function PriceAlertsPage() {
  return (
    <MainLayout>
      <div className="container py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Price Alerts</h1>
            <p className="text-muted-foreground">
              Get notified when prices drop on your favorite products
            </p>
          </div>
          
          <div className="text-center py-12">
            <PriceAlertButton
              productId="sample-product"
              skuId="sample-sku"
              currentPrice={15000}
              showText={true}
              className="mx-auto"
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
