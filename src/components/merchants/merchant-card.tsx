'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Star, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Store,
  Phone,
  ExternalLink
} from 'lucide-react'
import { Merchant } from '@/types'
import { calculateDistance } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MerchantCardProps {
  merchant: Merchant
  userLocation?: { lat: number; lon: number }
  onContact?: (merchantId: string) => void
  showDistance?: boolean
  className?: string
}

export function MerchantCard({
  merchant,
  userLocation,
  onContact,
  showDistance = true,
  className
}: MerchantCardProps) {
  const [imageError, setImageError] = useState(false)

  const getDistance = () => {
    if (!userLocation || !merchant.lat || !merchant.lon) return null
    
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lon,
      merchant.lat,
      merchant.lon
    )
    
    return distance
  }

  const distance = getDistance()
  const hasServiceAreas = merchant.serviceAreas && merchant.serviceAreas.length > 0

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-0">
        {/* Merchant Logo/Image */}
        <div className="relative h-32 overflow-hidden rounded-t-lg">
          {merchant.logoUrl && !imageError ? (
            <Image
              src={merchant.logoUrl}
              alt={merchant.displayName}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <Store className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          {/* Rating Badge */}
          {merchant.rating > 0 && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-background/80 text-foreground">
                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                {merchant.rating.toFixed(1)}
              </Badge>
            </div>
          )}
        </div>

        {/* Merchant Info */}
        <div className="p-4 space-y-3">
          {/* Name and Legal Name */}
          <div>
            <h3 className="font-semibold text-lg">{merchant.displayName}</h3>
            {merchant.legalName && merchant.legalName !== merchant.displayName && (
              <p className="text-sm text-muted-foreground">{merchant.legalName}</p>
            )}
          </div>

          {/* Description */}
          {merchant.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {merchant.description}
            </p>
          )}

          {/* Location and Distance */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {merchant.lat && merchant.lon 
                  ? `Location available` 
                  : 'Location not specified'
                }
              </span>
            </div>
            
            {showDistance && distance !== null && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{distance.toFixed(1)} km away</span>
              </div>
            )}
          </div>

          {/* Service Areas */}
          {hasServiceAreas && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Service Areas:</p>
              <div className="flex flex-wrap gap-1">
                {merchant.serviceAreas.slice(0, 3).map((area, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {area}
                  </Badge>
                ))}
                {merchant.serviceAreas.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{merchant.serviceAreas.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex items-center space-x-2 w-full">
          <Link href={`/merchants/${merchant.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Store
            </Button>
          </Link>
          
          {onContact && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onContact(merchant.id)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
