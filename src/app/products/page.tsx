'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { ProductCard } from '@/components/products/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { UnitType } from '@/types'
import { cn } from '@/lib/utils'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedMerchant, setSelectedMerchant] = useState('')
  const [selectedUnitType, setSelectedUnitType] = useState<UnitType | 'all'>('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRangeCalculated, setPriceRangeCalculated] = useState(false)
  const [allProducts, setAllProducts] = useState<any[]>([])

  const {
    products,
    categories,
    isLoading,
    error,
    pagination,
    loadProducts,
    setSearchQuery: setSearchQueryAction,
    setFilters,
    setPagination
  } = useProducts()

  // Load all products on mount
  useEffect(() => {
    loadProducts({
      page: 1,
      limit: 1000 // Load a large batch for frontend filtering
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Store all products when they're loaded
  useEffect(() => {
    if (products.length > 0) {
      // Replace all products with the loaded batch
      // Since we're loading with limit 1000, this should get most/all products
      setAllProducts(products)
    }
  }, [products])

  // Calculate and prefill min/max prices from all products (only on initial load)
  useEffect(() => {
    if (allProducts.length > 0 && !priceRangeCalculated && minPrice === '' && maxPrice === '') {
      const allPrices: number[] = []
      allProducts.forEach(product => {
        product.skus?.forEach((sku: any) => {
          if (sku.active && sku.pricePerCanonicalUnit) {
            // Convert from cents to ETB
            const priceInETB = sku.pricePerCanonicalUnit / 100
            allPrices.push(priceInETB)
          }
        })
      })
      
      if (allPrices.length > 0) {
        const min = Math.min(...allPrices)
        const max = Math.max(...allPrices)
        setMinPrice(min.toString())
        setMaxPrice(max.toString())
        setPriceRangeCalculated(true)
      }
    }
  }, [allProducts, priceRangeCalculated, minPrice, maxPrice])

  // Frontend filtering with useMemo for performance
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoryId === selectedCategory)
    }

    // Merchant filter
    if (selectedMerchant) {
      filtered = filtered.filter(product => product.merchantId === selectedMerchant)
    }

    // Unit Type filter
    if (selectedUnitType !== 'all') {
      filtered = filtered.filter(product => 
        product.skus?.some((sku: any) => sku.unitType === selectedUnitType && sku.active)
      )
    }

    // Price filter
    if (minPrice || maxPrice) {
      const min = minPrice ? parseFloat(minPrice) : 0
      const max = maxPrice ? parseFloat(maxPrice) : Infinity
      
      // Only filter if values are valid numbers
      if (!isNaN(min) && !isNaN(max)) {
        filtered = filtered.filter(product => {
          return product.skus?.some((sku: any) => {
            if (!sku.active) return false
            const priceInETB = sku.pricePerCanonicalUnit / 100
            return priceInETB >= min && priceInETB <= max
          })
        })
      }
    }

    return filtered
  }, [allProducts, searchQuery, selectedCategory, selectedMerchant, selectedUnitType, minPrice, maxPrice])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Frontend filtering, no need to reload
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedMerchant('')
    setSelectedUnitType('all')
    // Recalculate price range when clearing filters
    if (allProducts.length > 0) {
      const allPrices: number[] = []
      allProducts.forEach(product => {
        product.skus?.forEach((sku: any) => {
          if (sku.active && sku.pricePerCanonicalUnit) {
            const priceInETB = sku.pricePerCanonicalUnit / 100
            allPrices.push(priceInETB)
          }
        })
      })
      if (allPrices.length > 0) {
        const min = Math.min(...allPrices)
        const max = Math.max(...allPrices)
        setMinPrice(min.toString())
        setMaxPrice(max.toString())
        setPriceRangeCalculated(true)
      } else {
        setMinPrice('')
        setMaxPrice('')
      }
    } else {
    setMinPrice('')
    setMaxPrice('')
    }
    setFilters({})
  }

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedMerchant || selectedUnitType !== 'all' || minPrice || maxPrice

  return (
    <MainLayout>
      <div className="container py-8 px-6 sm:px-8 lg:px-14">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-muted-foreground">
            Discover products from local merchants across Ethiopia
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Unit Type Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Unit Type</label>
                    <Select value={selectedUnitType} onValueChange={(value) => setSelectedUnitType(value as UnitType | 'all')}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Units" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Units</SelectItem>
                        <SelectItem value="PIECE">Piece</SelectItem>
                        <SelectItem value="KG">Kilogram</SelectItem>
                        <SelectItem value="LITER">Liter</SelectItem>
                        <SelectItem value="METER">Meter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Min Price (ETB)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Price (ETB)</label>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="cursor-pointer" onClick={clearFilters}>
                        Clear Filters
                      </Badge>
                    )}
                    {hasActiveFilters && (
                      <span className="text-sm text-muted-foreground">
                        {filteredProducts.length} products found
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `${filteredProducts.length} products found`}
            </span>
            {hasActiveFilters && (
              <Badge variant="outline" onClick={clearFilters} className="cursor-pointer">
                Clear all filters
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid/List */}
        {isLoading ? (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          )}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <Skeleton className="aspect-square rounded-t-lg" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => loadProducts()}>Try Again</Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No products found</p>
            {hasActiveFilters && (
              <Button onClick={clearFilters}>Clear Filters</Button>
            )}
          </div>
        ) : (
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            )}>
            {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className={viewMode === 'list' ? 'flex flex-row' : ''}
                />
              ))}
            </div>
        )}
      </div>
    </MainLayout>
  )
}
