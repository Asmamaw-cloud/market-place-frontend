'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { VisualSearch } from '@/components/search/visual-search'
import { AdvancedFilters } from '@/components/search/advanced-filters'

export default function SearchPage() {
  return (
    <MainLayout>
      <div className="container py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Advanced Search</h1>
            <p className="text-muted-foreground">
              Find products using visual search or advanced filters
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <VisualSearch />
            </div>
            <div>
              <AdvancedFilters />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
