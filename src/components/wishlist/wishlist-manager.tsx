'use client'

import { useState } from 'react'
import { Plus, Heart, Share2, Edit3, Trash2, Move, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useWishlist } from '@/hooks/useWishlist'
import { useAuth } from '@/hooks/useAuth'
import { Wishlist, WishlistItem } from '@/types/wishlist'
import { cn } from '@/lib/utils'

interface WishlistManagerProps {
  className?: string
}

export function WishlistManager({ className }: WishlistManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null)
  const [newWishlistName, setNewWishlistName] = useState('')
  const [newWishlistDescription, setNewWishlistDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  const { isAuthenticated } = useAuth()
  const { 
    wishlists, 
    isLoading, 
    createWishlist, 
    updateWishlist, 
    deleteWishlist, 
    shareWishlist,
    addToCartFromWishlist,
    removeFromWishlist
  } = useWishlist()

  const handleCreateWishlist = async () => {
    if (!newWishlistName.trim()) return

    try {
      await createWishlist({
        name: newWishlistName,
        description: newWishlistDescription || undefined,
        isPublic
      })
      setNewWishlistName('')
      setNewWishlistDescription('')
      setIsPublic(false)
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create wishlist:', error)
    }
  }

  const handleShareWishlist = async (wishlist: Wishlist) => {
    try {
      const result = await shareWishlist({
        wishlistId: wishlist.id,
        isPublic: true
      })
      
      // Copy to clipboard
      await navigator.clipboard.writeText(result.shareUrl)
      alert('Share link copied to clipboard!')
      setIsShareDialogOpen(false)
    } catch (error) {
      console.error('Failed to share wishlist:', error)
    }
  }

  const handleAddToCart = async (wishlistId: string, item: WishlistItem) => {
    try {
      await addToCartFromWishlist(wishlistId, item.id, 1)
      alert('Item added to cart!')
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Heart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Please Login</h3>
          <p className="text-muted-foreground text-center mb-4">
            You need to be logged in to manage your wishlists
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Login to Continue
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Wishlists</h2>
          <p className="text-muted-foreground">
            Save your favorite items and share them with others
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Wishlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Wishlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newWishlistName}
                  onChange={(e) => setNewWishlistName(e.target.value)}
                  placeholder="Enter wishlist name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newWishlistDescription}
                  onChange={(e) => setNewWishlistDescription(e.target.value)}
                  placeholder="Enter wishlist description"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="public">Make this wishlist public</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWishlist}>
                  Create Wishlist
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Wishlists Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : wishlists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Wishlists Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first wishlist to start saving your favorite items
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Wishlist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlists.map((wishlist) => (
            <Card key={wishlist.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{wishlist.name}</CardTitle>
                    {wishlist.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {wishlist.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {wishlist.isPublic && (
                      <Badge variant="secondary">Public</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{wishlist.items.length} items</span>
                    <span>{new Date(wishlist.updatedAt).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedWishlist(wishlist)}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShareWishlist(wishlist)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteWishlist(wishlist.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Wishlist Items Dialog */}
      {selectedWishlist && (
        <Dialog open={!!selectedWishlist} onOpenChange={() => setSelectedWishlist(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedWishlist.name}</DialogTitle>
              {selectedWishlist.description && (
                <p className="text-muted-foreground">{selectedWishlist.description}</p>
              )}
            </DialogHeader>
            <div className="space-y-4">
              {selectedWishlist.items.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">This wishlist is empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedWishlist.items.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex space-x-4">
                          <img
                            src={item.product.images[0] || '/placeholder-product.jpg'}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{item.product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.product.merchant.displayName}
                            </p>
                            <p className="text-sm font-medium">
                              {item.product.skus[0]?.pricePerCanonicalUnit 
                                ? `ETB ${(item.product.skus[0].pricePerCanonicalUnit / 100).toFixed(2)}`
                                : 'Price not available'
                              }
                            </p>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Note: {item.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button
                              size="sm"
                              onClick={() => handleAddToCart(selectedWishlist.id, item)}
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Add to Cart
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromWishlist(selectedWishlist.id, item.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
