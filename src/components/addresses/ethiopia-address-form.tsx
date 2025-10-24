'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Map } from '@/components/ui/map'
import { PlusCodeInput } from '@/components/ui/plus-code-input'
import { 
  MapPin, 
  Navigation, 
  Save,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Address, CreateAddressRequest, UpdateAddressRequest } from '@/types'
import { addressSchema } from '@/lib/validators'
import { cn } from '@/lib/utils'

const ethiopianRegions = [
  'Addis Ababa',
  'Afar',
  'Amhara',
  'Benishangul-Gumuz',
  'Dire Dawa',
  'Gambela',
  'Harari',
  'Oromia',
  'Sidama',
  'Somali',
  'SNNPR',
  'Tigray'
]

const majorCities = {
  'Addis Ababa': ['Addis Ababa'],
  'Afar': ['Semera', 'Asaita', 'Awash'],
  'Amhara': ['Bahir Dar', 'Gondar', 'Dessie', 'Debre Markos', 'Woldiya'],
  'Benishangul-Gumuz': ['Asosa', 'Metekel'],
  'Dire Dawa': ['Dire Dawa'],
  'Gambela': ['Gambela'],
  'Harari': ['Harar'],
  'Oromia': ['Adama', 'Jimma', 'Shashamane', 'Nekemte', 'Bishoftu', 'Addis Ababa'],
  'Sidama': ['Hawassa', 'Yirgalem'],
  'Somali': ['Jijiga', 'Gode', 'Kebri Dehar'],
  'SNNPR': ['Hawassa', 'Arba Minch', 'Sodo', 'Dilla', 'Wolayita Sodo'],
  'Tigray': ['Mekelle', 'Axum', 'Adigrat', 'Shire', 'Humera']
}

interface EthiopiaAddressFormProps {
  address?: Address
  onSubmit: (data: CreateAddressRequest | UpdateAddressRequest) => void
  onCancel?: () => void
  isLoading?: boolean
  className?: string
}

export function EthiopiaAddressForm({
  address,
  onSubmit,
  onCancel,
  isLoading = false,
  className
}: EthiopiaAddressFormProps) {
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [useMap, setUseMap] = useState(false)
  const [usePlusCode, setUsePlusCode] = useState(false)
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number; lon: number } | null>(null)
  const [plusCode, setPlusCode] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: address?.fullName || '',
      phone: address?.phone || '',
      region: address?.region || '',
      city: address?.city || '',
      line1: address?.line1 || '', // was subcity
      line2: address?.line2 || '', // was woreda/kebele/houseNumber
      landmark: address?.landmark || '',
      plusCode: address?.plusCode || '',
      lat: address?.lat || undefined,
      lon: address?.lon || undefined,
      country: 'ET'
    }
  })

  const watchedRegion = watch('region')
  const watchedCity = watch('city')

  // Update cities when region changes
  useEffect(() => {
    if (watchedRegion) {
      setSelectedRegion(watchedRegion)
      setValue('city', '')
      setSelectedCity('')
    }
  }, [watchedRegion, setValue])

  // Update form when address changes
  useEffect(() => {
    if (address) {
      reset({
        fullName: address.fullName || '',
        phone: address.phone || '',
        region: address.region || '',
        city: address.city || '',
        line1: address.line1 || '', // was subcity
        line2: address.line2 || '', // was woreda/kebele/houseNumber
        landmark: address.landmark || '',
        plusCode: address.plusCode || '',
        lat: address.lat || undefined,
        lon: address.lon || undefined,
        country: 'ET'
      })
      setSelectedRegion(address.region || '')
      setSelectedCity(address.city || '')
      setPlusCode(address.plusCode || '')
      if (address.lat && address.lon) {
        setMapCoordinates({ lat: address.lat, lon: address.lon })
      }
    }
  }, [address, reset])

  const handleMapLocationSelect = (lat: number, lon: number, address?: string) => {
    setMapCoordinates({ lat, lon })
    setValue('lat', lat)
    setValue('lon', lon)
    
    if (address) {
      // Try to extract region and city from address
      const addressParts = address.split(',').map(part => part.trim())
      // This is a simple extraction - in a real app, you'd use a more sophisticated geocoding service
      if (addressParts.length > 1) {
        const city = addressParts[0]
        const region = addressParts[addressParts.length - 1]
        
        if (ethiopianRegions.includes(region)) {
          setValue('region', region)
          setSelectedRegion(region)
        }
        if (city) {
          setValue('city', city)
          setSelectedCity(city)
        }
      }
    }
  }

  const handlePlusCodeSelect = (code: string) => {
    setPlusCode(code)
    setValue('plusCode', code)
  }

  const handlePlusCodeLocationSelect = (lat: number, lon: number) => {
    setMapCoordinates({ lat, lon })
    setValue('lat', lat)
    setValue('lon', lon)
  }

  const onFormSubmit = (data: any) => {
    onSubmit(data)
  }

  const availableCities = selectedRegion ? majorCities[selectedRegion as keyof typeof majorCities] || [] : []

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>
          {address ? 'Edit Address' : 'Add New Address'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="+251 9X XXX XXXX"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Location Selection Method */}
          <div className="space-y-4">
            <Label>Location Selection Method</Label>
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={!useMap && !usePlusCode ? "default" : "outline"}
                onClick={() => {
                  setUseMap(false)
                  setUsePlusCode(false)
                }}
              >
                Manual Entry
              </Button>
              <Button
                type="button"
                variant={useMap ? "default" : "outline"}
                onClick={() => {
                  setUseMap(true)
                  setUsePlusCode(false)
                }}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Map Selection
              </Button>
              <Button
                type="button"
                variant={usePlusCode ? "default" : "outline"}
                onClick={() => {
                  setUseMap(false)
                  setUsePlusCode(true)
                }}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Plus Code
              </Button>
            </div>
          </div>

          {/* Map Selection */}
          {useMap && (
            <div className="space-y-4">
              <Label>Select Location on Map</Label>
              <Map
                lat={mapCoordinates?.lat}
                lon={mapCoordinates?.lon}
                onLocationSelect={handleMapLocationSelect}
                height="300px"
              />
            </div>
          )}

          {/* Plus Code Input */}
          {usePlusCode && (
            <div className="space-y-4">
              <PlusCodeInput
                value={plusCode}
                onChange={handlePlusCodeSelect}
                onLocationSelect={handlePlusCodeLocationSelect}
              />
            </div>
          )}

          {/* Manual Address Entry */}
          {!useMap && !usePlusCode && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Select
                    value={selectedRegion}
                    onValueChange={(value) => {
                      setSelectedRegion(value)
                      setValue('region', value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {ethiopianRegions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.region && (
                    <p className="text-sm text-destructive">{errors.region.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Select
                    value={selectedCity}
                    onValueChange={(value) => {
                      setSelectedCity(value)
                      setValue('city', value)
                    }}
                    disabled={!selectedRegion}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.city && (
                    <p className="text-sm text-destructive">{errors.city.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="line1">Subcity/Zone *</Label>
                  <Input
                    id="line1"
                    placeholder="Enter subcity or zone"
                    {...register('line1')}
                  />
                  {errors.line1 && (
                    <p className="text-sm text-destructive">{errors.line1.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="line2">Woreda/Kebele/House No.</Label>
                  <Input
                    id="line2"
                    placeholder="Enter woreda, kebele, house number"
                    {...register('line2')}
                  />
                  {errors.line2 && (
                    <p className="text-sm text-destructive">{errors.line2.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Landmark */}
          <div className="space-y-2">
            <Label htmlFor="landmark">Landmark</Label>
            <Textarea
              id="landmark"
              placeholder="Enter nearby landmarks (e.g., near Meskel Square, behind Commercial Bank)"
              {...register('landmark')}
            />
          </div>


          {/* Coordinates Display */}
          {(mapCoordinates || (watchedRegion && watchedCity)) && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Location Details:</span>
              </div>
              {mapCoordinates && (
                <p className="text-sm text-muted-foreground mt-1">
                  Coordinates: {mapCoordinates.lat.toFixed(6)}, {mapCoordinates.lon.toFixed(6)}
                </p>
              )}
              {watchedRegion && watchedCity && (
                <p className="text-sm text-muted-foreground">
                  {watchedCity}, {watchedRegion}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {address ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {address ? 'Update Address' : 'Add Address'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
