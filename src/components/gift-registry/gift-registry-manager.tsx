'use client'

import { useState } from 'react'
import { Plus, Gift, Share2, Edit3, Trash2, Calendar, Users, Package, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useGiftRegistry } from '@/hooks/useGiftRegistry'
import { useAuth } from '@/hooks/useAuth'
import { GiftRegistry, GiftRegistryItem } from '@/types/gift-registry'
import { cn } from '@/lib/utils'

interface GiftRegistryManagerProps {
  className?: string
}

const eventTypes = [
  { value: 'BIRTHDAY', label: 'Birthday', icon: '🎂' },
  { value: 'WEDDING', label: 'Wedding', icon: '💒' },
  { value: 'BABY_SHOWER', label: 'Baby Shower', icon: '👶' },
  { value: 'ANNIVERSARY', label: 'Anniversary', icon: '💕' },
  { value: 'HOLIDAY', label: 'Holiday', icon: '🎄' },
  { value: 'OTHER', label: 'Other', icon: '🎁' },
]

export function GiftRegistryManager({ className }: GiftRegistryManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [selectedRegistry, setSelectedRegistry] = useState<GiftRegistry | null>(null)
  const [newRegistryName, setNewRegistryName] = useState('')
  const [newRegistryDescription, setNewRegistryDescription] = useState('')
  const [eventType, setEventType] = useState('BIRTHDAY')
  const [eventDate, setEventDate] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  const { isAuthenticated } = useAuth()
  const { 
    registries, 
    isLoading, 
    createGiftRegistry, 
    updateGiftRegistry, 
    deleteGiftRegistry, 
    shareGiftRegistry 
  } = useGiftRegistry()

  const handleCreateRegistry = async () => {
    if (!newRegistryName.trim() || !eventDate) return

    try {
      await createGiftRegistry({
        name: newRegistryName,
        description: newRegistryDescription || undefined,
        eventType: eventType as any,
        eventDate,
        isPublic
      })
      setNewRegistryName('')
      setNewRegistryDescription('')
      setEventType('BIRTHDAY')
      setEventDate('')
      setIsPublic(false)
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create gift registry:', error)
    }
  }

  const handleShareRegistry = async (registry: GiftRegistry) => {
    try {
      const result = await shareGiftRegistry(registry.id, true)
      
      // Copy to clipboard
      await navigator.clipboard.writeText(result.shareUrl)
      alert('Share link copied to clipboard!')
      setIsShareDialogOpen(false)
    } catch (error) {
      console.error('Failed to share gift registry:', error)
    }
  }

  const getEventTypeIcon = (type: string) => {
    return eventTypes.find(et => et.value === type)?.icon || '🎁'
  }

  const getEventTypeLabel = (type: string) => {
    return eventTypes.find(et => et.value === type)?.label || 'Other'
  }

  const getCompletionRate = (registry: GiftRegistry) => {
    if (registry.totalItems === 0) return 0
    return Math.round((registry.purchasedItems / registry.totalItems) * 100)
  }

  if (!isAuthenticated) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Gift className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Please Login</h3>
          <p className="text-muted-foreground text-center mb-4">
            You need to be logged in to manage your gift registries
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
          <h2 className="text-2xl font-bold">My Gift Registries</h2>
          <p className="text-muted-foreground">
            Create and manage gift registries for special occasions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Registry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Gift Registry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Registry Name</Label>
                <Input
                  id="name"
                  value={newRegistryName}
                  onChange={(e) => setNewRegistryName(e.target.value)}
                  placeholder="e.g., Sarah's Birthday Wishlist"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newRegistryDescription}
                  onChange={(e) => setNewRegistryDescription(e.target.value)}
                  placeholder="Tell your friends what you're celebrating..."
                />
              </div>
              <div>
                <Label htmlFor="eventType">Event Type</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="eventDate">Event Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="public">Make this registry public</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRegistry}>
                  Create Registry
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Registries Grid */}
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
      ) : registries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gift className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Gift Registries Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first gift registry to start sharing your wishlist with friends and family
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Registry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registries.map((registry) => (
            <Card key={registry.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span>{getEventTypeIcon(registry.eventType)}</span>
                      {registry.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getEventTypeLabel(registry.eventType)}
                    </p>
                    {registry.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {registry.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {registry.isPublic && (
                      <Badge variant="secondary">Public</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{getCompletionRate(registry)}%</span>
                    </div>
                    <Progress value={getCompletionRate(registry)} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{registry.totalItems} items</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(registry.eventDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span>Total Value:</span>
                      <span className="font-medium">ETB {(registry.totalValue / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Purchased:</span>
                      <span>ETB {(registry.purchasedValue / 100).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedRegistry(registry)}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShareRegistry(registry)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteGiftRegistry(registry.id)}
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

      {/* Registry Items Dialog */}
      {selectedRegistry && (
        <Dialog open={!!selectedRegistry} onOpenChange={() => setSelectedRegistry(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>{getEventTypeIcon(selectedRegistry.eventType)}</span>
                {selectedRegistry.name}
              </DialogTitle>
              <p className="text-muted-foreground">{selectedRegistry.description}</p>
            </DialogHeader>
            <div className="space-y-4">
              {selectedRegistry.items.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">This registry is empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRegistry.items.map((item) => (
                    <Card key={item.id} className={cn(
                      item.isPurchased && 'opacity-60 bg-muted'
                    )}>
                      <CardContent className="p-4">
                        <div className="flex space-x-4">
                          <img
                            src={item.product.images[0] || '/placeholder-product.jpg'}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium truncate">{item.product.name}</h4>
                              {item.isPurchased && (
                                <Badge variant="secondary" className="ml-2">
                                  Purchased
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {item.product.merchant.displayName}
                            </p>
                            <p className="text-sm font-medium">
                              ETB {(item.product.skus[0]?.pricePerCanonicalUnit / 100).toFixed(2)}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {item.priority}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Qty: {item.quantity}
                              </span>
                            </div>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Note: {item.notes}
                              </p>
                            )}
                            {item.isPurchased && item.purchasedBy && (
                              <p className="text-xs text-green-600 mt-1">
                                Purchased by {item.purchasedBy}
                              </p>
                            )}
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
