'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'
import { ProductCard } from '@/components/products/product-card'
import { SKUSelector } from '@/components/products/sku-selector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Star, 
  MapPin, 
  MessageCircle, 
  Heart, 
  Share2,
  ShoppingCart,
  Truck,
  Shield,
  ArrowLeft
} from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { Sku, UnitType } from '@/types'
import { formatCurrency, formatUnit, getRatingStars, getStatusColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  
  const [selectedSku, setSelectedSku] = useState<Sku | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const { currentProduct, isLoading, error, loadProduct } = useProducts()
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (productId) {
      loadProduct(productId)
    }
  }, [productId, loadProduct])

  useEffect(() => {
    if (currentProduct?.skus && currentProduct.skus.length > 0) {
      setSelectedSku(currentProduct.skus[0])
    }
  }, [currentProduct])

  const handleAddToCart = async () => {
    if (!selectedSku || !isAuthenticated) return

    setIsAddingToCart(true)
    try {
      await addItem(selectedSku.id, quantity)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const getAverageRating = () => {
    if (!currentProduct?.reviews || currentProduct.reviews.length === 0) return 0
    return currentProduct.reviews.reduce((sum, review) => sum + review.rating, 0) / currentProduct.reviews.length
  }

  const getReviewCount = () => {
    return currentProduct?.reviews?.length || 0
  }

  const averageRating = getAverageRating()
  const reviewCount = getReviewCount()

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Skeleton className="aspect-square rounded-lg" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !currentProduct) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || 'Product not found'}</p>
            <Link href="/products">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary">Products</Link>
          <span>/</span>
          <span>{currentProduct.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-lg">
              {currentProduct.images && currentProduct.images.length > 0 ? (
                <Image
                  src={currentProduct.images[selectedImageIndex]}
                  alt={currentProduct.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {currentProduct.images && currentProduct.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {currentProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "aspect-square overflow-hidden rounded border-2 transition-colors",
                      selectedImageIndex === index
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground"
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${currentProduct.name} ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Name and Rating */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{currentProduct.name}</h1>
              {averageRating > 0 && (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center space-x-1">
                    {getRatingStars(averageRating).map((star, index) => (
                      <span key={index} className="text-yellow-400">{star}</span>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            {selectedSku && (
              <div className="space-y-2">
                <div className="text-3xl font-bold">
                  {formatCurrency(selectedSku.pricePerCanonicalUnit * quantity)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(selectedSku.pricePerCanonicalUnit)} per {formatUnit(1, selectedSku.unitType)}
                </div>
              </div>
            )}

            {/* SKU Selection */}
            {currentProduct.skus && currentProduct.skus.length > 0 && (
              <SKUSelector
                skus={currentProduct.skus}
                selectedSku={selectedSku}
                onSkuChange={setSelectedSku}
                quantity={quantity}
                onQuantityChange={setQuantity}
              />
            )}

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedSku || !isAuthenticated || isAddingToCart}
                size="lg"
                className="flex-1"
              >
                {isAddingToCart ? (
                  <Skeleton className="h-4 w-4 mr-2" />
                ) : (
                  <ShoppingCart className="h-4 w-4 mr-2" />
                )}
                {!isAuthenticated ? 'Login to Add to Cart' : 'Add to Cart'}
              </Button>
              
              <Button variant="outline" size="lg">
                <Heart className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="lg">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Merchant Info */}
            {currentProduct.merchant && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {currentProduct.merchant.displayName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{currentProduct.merchant.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          {currentProduct.merchant.rating > 0 && (
                            <span className="flex items-center space-x-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{currentProduct.merchant.rating.toFixed(1)}</span>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="h-4 w-4 text-primary" />
                <span>Free delivery</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span>Escrow protected</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Local merchant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviewCount})</TabsTrigger>
              <TabsTrigger value="qna">Q&A</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">
                    {currentProduct.description || 'No description available.'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">Reviews will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="qna" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">Q&A will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Delivery Information</h3>
                      <p className="text-sm text-muted-foreground">
                        This item will be delivered by {currentProduct.merchant?.displayName || 'the merchant'}.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Shipping Options</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Standard delivery: 2-5 business days</li>
                        <li>• Express delivery: 1-2 business days (additional fee)</li>
                        <li>• Same-day delivery: Available in select areas</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* This would be populated with related products */}
            <div className="text-center py-8 text-muted-foreground">
              Related products will be displayed here
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
