'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { MerchantCard } from '@/components/merchants/merchant-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Filter, MapPin, Star, Store, Grid, List } from 'lucide-react'
import { useMerchants } from '@/hooks/useMerchants'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export default function MerchantsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [sortBy, setSortBy] = useState('rating')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)

  const {
    merchants,
    isLoading,
    error,
    loadMerchants,
    pagination
  } = useMerchants()

  // Get user location for distance calculation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (error) => {
          console.log('Geolocation error:', error)
        }
      )
    }
  }, [])

  // Load merchants on mount
  useEffect(() => {
    loadMerchants({
      search: searchQuery,
      lat: userLocation?.lat,
      lon: userLocation?.lon,
      radiusKm: 50
    })
  }, [searchQuery, userLocation, loadMerchants])

  const filteredMerchants = merchants?.filter(merchant => {
    const matchesSearch = merchant.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         merchant.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || merchant.serviceAreas?.includes(selectedCategory)
    const matchesRegion = !selectedRegion || selectedRegion === 'all' || merchant.serviceAreas?.some(area => 
      area.toLowerCase().includes(selectedRegion.toLowerCase())
    )
    
    return matchesSearch && matchesCategory && matchesRegion
  }) || []

  const sortedMerchants = [...filteredMerchants].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      case 'name':
        return a.displayName.localeCompare(b.displayName)
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'products':
        return (b.products?.length || 0) - (a.products?.length || 0)
      default:
        return 0
    }
  })

  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const handleContactMerchant = (merchantId: string) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/chat?merchantId=${merchantId}`)
      return
    }
    // Navigate to chat page with merchantId query parameter
    router.push(`/chat?merchantId=${merchantId}`)
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container py-8 px-6 sm:px-8 lg:px-14">
          <div className="text-center">
            <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error Loading Merchants</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => loadMerchants()}>Try Again</Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container py-8 px-6 sm:px-8 lg:px-14">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Merchants</h1>
          <p className="text-muted-foreground">
            Discover local merchants and businesses in your area
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search merchants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="food">Food & Groceries</SelectItem>
                    <SelectItem value="home">Home & Garden</SelectItem>
                    <SelectItem value="health">Health & Beauty</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="books">Books & Media</SelectItem>
                    <SelectItem value="sports">Sports & Outdoors</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="addis">Addis Ababa</SelectItem>
                    <SelectItem value="oromia">Oromia</SelectItem>
                    <SelectItem value="amhara">Amhara</SelectItem>
                    <SelectItem value="tigray">Tigray</SelectItem>
                    <SelectItem value="snnpr">SNNPR</SelectItem>
                    <SelectItem value="somali">Somali</SelectItem>
                    <SelectItem value="afar">Afar</SelectItem>
                    <SelectItem value="gambela">Gambela</SelectItem>
                    <SelectItem value="harari">Harari</SelectItem>
                    <SelectItem value="dire">Dire Dawa</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="products">Most Products</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `${sortedMerchants.length} merchants found`}
            </p>
            {userLocation && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                Location enabled
              </Badge>
            )}
          </div>
        </div>

        {/* Merchants Grid/List */}
        {isLoading ? (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          )}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[150px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedMerchants.length === 0 ? (
          <div className="text-center py-12">
            <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No merchants found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or filters
            </p>
            <Button onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
              setSelectedRegion('all')
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          )}>
            {sortedMerchants.map((merchant) => (
              <MerchantCard
                key={merchant.id}
                merchant={merchant}
                userLocation={userLocation || undefined}
                onContact={() => handleContactMerchant(merchant.id)}
                showDistance={!!userLocation}
                className={viewMode === 'list' ? 'flex-row' : ''}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {pagination?.hasMore && (
          <div className="text-center mt-8">
            <Button
              onClick={() => loadMerchants({
                page: (pagination.page || 1) + 1,
                search: searchQuery,
                lat: userLocation?.lat,
                lon: userLocation?.lon,
                radiusKm: 50
              })}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
