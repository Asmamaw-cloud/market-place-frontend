'use client'

import { useState, useEffect } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWishlist } from '@/hooks/useWishlist'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  productId: string
  skuId: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  showText?: boolean
}

export function WishlistButton({ 
  productId, 
  skuId, 
  className,
  variant = 'outline',
  size = 'default',
  showText = false
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const { 
    wishlists, 
    addToWishlist, 
    removeFromWishlist, 
    checkProductInWishlist,
    createWishlist
  } = useWishlist()

  useEffect(() => {
    if (isAuthenticated && productId) {
      checkProductInWishlist(productId).then(result => {
        setIsInWishlist(result.inWishlist)
      }).catch(console.error)
    }
  }, [isAuthenticated, productId, checkProductInWishlist])

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      return
    }

    if (wishlists.length === 0) {
      // Create default wishlist first
      try {
        await createWishlist({
          name: 'My Wishlist',
          description: 'My favorite items',
          isPublic: false
        })
      } catch (error) {
        console.error('Failed to create default wishlist:', error)
        return
      }
    }

    setIsLoading(true)
    try {
      if (isInWishlist) {
        // Find which wishlist contains this product
        const wishlistWithProduct = wishlists.find(w => 
          w.items.some(item => item.productId === productId)
        )
        if (wishlistWithProduct) {
          const item = wishlistWithProduct.items.find(item => item.productId === productId)
          if (item) {
            await removeFromWishlist(wishlistWithProduct.id, item.id)
            setIsInWishlist(false)
          }
        }
      } else {
        // Add to first wishlist (or default)
        const targetWishlist = wishlists[0] || { id: 'default' }
        await addToWishlist(targetWishlist.id, {
          productId,
          skuId
        })
        setIsInWishlist(true)
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn('gap-2', className)}
        onClick={() => {
          // Handle login redirect
          window.location.href = '/login'
        }}
      >
        <Heart className="h-4 w-4" />
        {showText && 'Add to Wishlist'}
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'gap-2 transition-colors',
        isInWishlist && 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200',
        className
      )}
      onClick={handleToggleWishlist}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={cn('h-4 w-4', isInWishlist && 'fill-current')} />
      )}
      {showText && (isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist')}
    </Button>
  )
}
