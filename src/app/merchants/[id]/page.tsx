'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Store, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Package, 
  MessageCircle,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useMerchants } from '@/hooks/useMerchants'
import { useProducts } from '@/hooks/useProducts'
import { ProductCard } from '@/components/products/product-card'
import { PriceDisplay } from '@/components/ui/price-display'
import Link from 'next/link'

export default function MerchantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const merchantId = params.id as string

  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)

  const { 
    currentMerchant: merchant, 
    isLoading: merchantLoading, 
    error: merchantError,
    loadMerchantById 
  } = useMerchants()

  const { 
    products, 
    isLoading: productsLoading, 
    error: productsError,
    fetchProducts 
  } = useProducts()

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

  // Load merchant and products
  useEffect(() => {
    if (merchantId) {
      loadMerchantById(merchantId)
      fetchProducts({ merchant: merchantId })
    }
  }, [merchantId, loadMerchantById, fetchProducts])

  const handleContactMerchant = () => {
    // TODO: Implement contact functionality
    console.log('Contact merchant:', merchantId)
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const getDistance = () => {
    if (!userLocation || !merchant?.lat || !merchant?.lon) return null
    return calculateDistance(
      userLocation.lat, 
      userLocation.lon, 
      merchant.lat, 
      merchant.lon
    )
  }

  if (merchantError) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Merchant Not Found</h2>
            <p className="text-muted-foreground mb-6">{merchantError}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (merchantLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading merchant...</span>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!merchant) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Merchant Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The merchant you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  const distance = getDistance()

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Merchant Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Merchant Logo */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                  {merchant.logoUrl ? (
                    <img
                      src={merchant.logoUrl}
                      alt={merchant.displayName}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Store className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Merchant Info */}
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{merchant.displayName}</h1>
                    {merchant.legalName && (
                      <p className="text-muted-foreground mb-2">{merchant.legalName}</p>
                    )}
                    <p className="text-muted-foreground mb-4">{merchant.description}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleContactMerchant}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                    <Button variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-semibold">{merchant.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold">{products?.length || 0}</div>
                    <p className="text-sm text-muted-foreground">Products</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold">
                      {merchant.createdAt ? new Date(merchant.createdAt).getFullYear() : 'N/A'}
                    </div>
                    <p className="text-sm text-muted-foreground">Established</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold">
                      {distance ? `${distance.toFixed(1)} km` : 'N/A'}
                    </div>
                    <p className="text-sm text-muted-foreground">Distance</p>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="flex items-center gap-2">
                  <Badge variant="default">Active</Badge>
                  {merchant.kyc?.status === 'APPROVED' && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {merchant.serviceAreas && merchant.serviceAreas.length > 0 && (
                    <Badge variant="secondary">
                      <MapPin className="h-3 w-3 mr-1" />
                      {merchant.serviceAreas.length} Service Areas
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Areas */}
        {merchant.serviceAreas && merchant.serviceAreas.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Service Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {merchant.serviceAreas.map((area, index) => (
                  <Badge key={index} variant="outline">
                    {area}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Products ({products?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-48 w-full mb-4" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : productsError ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Failed to load products</p>
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No products available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
