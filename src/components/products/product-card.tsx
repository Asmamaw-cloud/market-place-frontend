'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart, ShoppingCart, Star, MapPin } from 'lucide-react'
import { Product, Sku, UnitType } from '@/types'
import { formatCurrency, formatUnit, getRatingStars, getStatusColor } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface ProductCardProps {
  product: Product
  onAddToCart?: (skuId: string, quantity: number) => void
  showMerchant?: boolean
  className?: string
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  showMerchant = true,
  className 
}: ProductCardProps) {
  const [selectedSku, setSelectedSku] = useState<Sku | null>(product.skus?.[0] || null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const handleAddToCart = async () => {
    if (!selectedSku) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    setIsLoading(true)
    try {
      if (onAddToCart) {
        onAddToCart(selectedSku.id, quantity)
      } else {
        await addItem(selectedSku.id, quantity)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getMinPrice = () => {
    if (!product.skus || product.skus.length === 0) return 0
    return Math.min(...product.skus.map(sku => sku.pricePerCanonicalUnit))
  }

  const getMaxPrice = () => {
    if (!product.skus || product.skus.length === 0) return 0
    return Math.max(...product.skus.map(sku => sku.pricePerCanonicalUnit))
  }

  const getAverageRating = () => {
    if (!product.reviews || product.reviews.length === 0) return 0
    return product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
  }

  const getReviewCount = () => {
    return product.reviews?.length || 0
  }

  const minPrice = getMinPrice()
  const maxPrice = getMaxPrice()
  const averageRating = getAverageRating()
  const reviewCount = getReviewCount()

  return (
    <Card className={className}>
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}
          
          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          {/* Product Name */}
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Merchant Info */}
          {showMerchant && product.merchant && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{product.merchant.displayName}</span>
              {product.merchant.rating > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{product.merchant.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          )}

          {/* Price */}
          <div className="space-y-1">
            {minPrice === maxPrice ? (
              <p className="text-lg font-bold">{formatCurrency(selectedSku?.pricePerCanonicalUnit || minPrice)}</p>
            ) : (
              <p className="text-lg font-bold">
                {formatCurrency(minPrice)} - {formatCurrency(maxPrice)}
              </p>
            )}
            
            {selectedSku && (
              <p className="text-sm text-muted-foreground">
                per {formatUnit(1, selectedSku.unitType)}
              </p>
            )}
          </div>

          {/* SKU Selection */}
          {product.skus && product.skus.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Unit Type:</label>
              <div className="flex flex-wrap gap-1">
                {product.skus.map((sku) => (
                  <Button
                    key={sku.id}
                    variant={selectedSku?.id === sku.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSku(sku)}
                    className="h-8 text-xs"
                  >
                    {sku.unitType}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selection */}
          {selectedSku && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Quantity:</label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - selectedSku.unitIncrement))}
                  disabled={quantity <= selectedSku.unitIncrement}
                >
                  -
                </Button>
                <span className="text-sm font-medium min-w-[3rem] text-center">
                  {formatUnit(quantity, selectedSku.unitType)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + selectedSku.unitIncrement)}
                >
                  +
                </Button>
              </div>
            </div>
          )}

          {/* Rating */}
          {averageRating > 0 && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {getRatingStars(averageRating).map((star, index) => (
                  <span key={index} className="text-yellow-400">{star}</span>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({reviewCount})
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={!selectedSku || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Skeleton className="h-4 w-4 mr-2" />
          ) : (
            <ShoppingCart className="h-4 w-4 mr-2" />
          )}
          {!isAuthenticated ? 'Login to Add' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  )
}
