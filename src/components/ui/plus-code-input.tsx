'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Navigation, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlusCodeInputProps {
  value?: string
  onChange?: (plusCode: string) => void
  onLocationSelect?: (lat: number, lon: number) => void
  className?: string
  disabled?: boolean
  placeholder?: string
}

export function PlusCodeInput({
  value = '',
  onChange,
  onLocationSelect,
  className,
  disabled = false,
  placeholder = 'Enter Plus Code (e.g., 6G8G+2M Addis Ababa, Ethiopia)'
}: PlusCodeInputProps) {
  const [plusCode, setPlusCode] = useState(value)
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null)

  useEffect(() => {
    setPlusCode(value)
  }, [value])

  const validatePlusCode = async (code: string) => {
    if (!code.trim()) {
      setIsValid(null)
      setCoordinates(null)
      return
    }

    setIsValidating(true)
    
    try {
      // Use OpenLocationCode library or API to validate
      const response = await fetch(
        `https://api.plus.codes/v1/decode?code=${encodeURIComponent(code)}`
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.status === 'OK' && data.coordinates) {
          setIsValid(true)
          setCoordinates({
            lat: data.coordinates.lat,
            lon: data.coordinates.lng
          })
          onLocationSelect?.(data.coordinates.lat, data.coordinates.lng)
        } else {
          setIsValid(false)
          setCoordinates(null)
        }
      } else {
        setIsValid(false)
        setCoordinates(null)
      }
    } catch (error) {
      console.error('Plus Code validation failed:', error)
      setIsValid(false)
      setCoordinates(null)
    } finally {
      setIsValidating(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setPlusCode(newValue)
    onChange?.(newValue)
    
    // Debounce validation
    const timeoutId = setTimeout(() => {
      validatePlusCode(newValue)
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const getCurrentLocationPlusCode = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          setIsValidating(true)
          const response = await fetch(
            `https://api.plus.codes/v1/encode?lat=${latitude}&lng=${longitude}`
          )
          
          if (response.ok) {
            const data = await response.json()
            if (data.status === 'OK' && data.plus_code) {
              const newPlusCode = data.plus_code
              setPlusCode(newPlusCode)
              onChange?.(newPlusCode)
              setIsValid(true)
              setCoordinates({ lat: latitude, lon: longitude })
              onLocationSelect?.(latitude, longitude)
            }
          }
        } catch (error) {
          console.error('Plus Code generation failed:', error)
        } finally {
          setIsValidating(false)
        }
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
    <div className={cn('space-y-2', className)}>
      <Label htmlFor="plus-code">Plus Code</Label>
      <div className="flex space-x-2">
        <div className="flex-1">
          <div className="relative">
            <Input
              id="plus-code"
              value={plusCode}
              onChange={handleInputChange}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                'pr-10',
                isValid === true && 'border-green-500 focus:border-green-500',
                isValid === false && 'border-red-500 focus:border-red-500'
              )}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isValidating ? (
                <div className="animate-spin h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full" />
              ) : isValid === true ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : isValid === false ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : null}
            </div>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={getCurrentLocationPlusCode}
          disabled={disabled || isValidating}
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

      {/* Plus Code Info */}
      <div className="text-xs text-muted-foreground">
        <p>Plus Codes are a simple way to share a location anywhere in the world.</p>
        <p>Example: 6G8G+2M Addis Ababa, Ethiopia</p>
      </div>

      {/* Coordinates Display */}
      {coordinates && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Coordinates:</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {coordinates.lat.toFixed(6)}, {coordinates.lon.toFixed(6)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Validation Messages */}
      {isValid === false && !isValidating && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>Invalid Plus Code format</span>
        </div>
      )}
    </div>
  )
}
