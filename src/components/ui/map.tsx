'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Navigation, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MapProps {
  lat?: number
  lon?: number
  onLocationSelect?: (lat: number, lon: number, address?: string) => void
  className?: string
  height?: string
  disabled?: boolean
}

export function Map({ 
  lat, 
  lon, 
  onLocationSelect, 
  className,
  height = '400px',
  disabled = false 
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map) return

    // Load Leaflet dynamically
    const loadMap = async () => {
      try {
        const L = await import('leaflet')
        // Import CSS dynamically
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)

        const mapInstance = L.map(mapRef.current!).setView([9.1450, 40.4897], 6) // Center on Ethiopia

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance)

        setMap(mapInstance)

        // Add click handler
        mapInstance.on('click', (e: any) => {
          if (disabled) return
          
          const { lat: clickLat, lng: clickLon } = e.latlng
          
          // Remove existing marker
          if (marker) {
            mapInstance.removeLayer(marker)
          }

          // Add new marker
          const newMarker = L.marker([clickLat, clickLon]).addTo(mapInstance)
          setMarker(newMarker)

          // Reverse geocode
          reverseGeocode(clickLat, clickLon)
        })

        // Set initial marker if coordinates provided
        if (lat && lon) {
          const initialMarker = L.marker([lat, lon]).addTo(mapInstance)
          setMarker(initialMarker)
          mapInstance.setView([lat, lon], 13)
        }
      } catch (error) {
        console.error('Failed to load map:', error)
      }
    }

    loadMap()
  }, [])

  // Update marker when coordinates change
  useEffect(() => {
    if (!map || !lat || !lon) return

    if (marker) {
      map.removeLayer(marker)
    }

    // Import Leaflet dynamically for marker creation
    import('leaflet').then((L) => {
      const newMarker = L.marker([lat, lon]).addTo(map)
      setMarker(newMarker)
      map.setView([lat, lon], 13)
    })
  }, [lat, lon, map])

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
      )
      const data = await response.json()
      
      const address = data.display_name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`
      onLocationSelect?.(lat, lon, address)
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      onLocationSelect?.(lat, lon)
    } finally {
      setIsLoading(false)
    }
  }

  const searchLocation = async () => {
    if (!searchQuery.trim() || !map) return

    try {
      setIsLoading(true)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=et&limit=1`
      )
      const data = await response.json()

      if (data.length > 0) {
        const { lat: searchLat, lon: searchLon, display_name } = data[0]
        const latNum = parseFloat(searchLat)
        const lonNum = parseFloat(searchLon)

        // Import Leaflet dynamically for marker creation
        const L = await import('leaflet')
        
        // Remove existing marker
        if (marker) {
          map.removeLayer(marker)
        }

        // Add new marker
        const newMarker = L.marker([latNum, lonNum]).addTo(map)
        setMarker(newMarker)
        map.setView([latNum, lonNum], 13)

        onLocationSelect?.(latNum, lonNum, display_name)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        reverseGeocode(latitude, longitude)
      },
      (error) => {
        console.error('Geolocation error:', error)
        alert('Unable to get your current location')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-4">
        {/* Search Bar */}
        <div className="flex space-x-2 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for a location in Ethiopia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                className="pl-10"
                disabled={disabled}
              />
            </div>
          </div>
          <Button
            onClick={searchLocation}
            disabled={disabled || isLoading || !searchQuery.trim()}
            variant="outline"
          >
            Search
          </Button>
          <Button
            onClick={getCurrentLocation}
            disabled={disabled || isLoading}
            variant="outline"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>

        {/* Map Container */}
        <div
          ref={mapRef}
          className="w-full rounded-lg border"
          style={{ height }}
        />

        {/* Coordinates Display */}
        {(lat && lon) && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Selected Location:</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {lat.toFixed(6)}, {lon.toFixed(6)}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
