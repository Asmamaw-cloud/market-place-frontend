'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Map } from '@/components/ui/map'
import { MapPin, Plus } from 'lucide-react'
import { addressSchema, AddressFormData } from '@/lib/validators'
import { cn } from '@/lib/utils'

interface AddressFormProps {
  initialData?: Partial<AddressFormData>
  onSubmit: (data: AddressFormData) => void
  onCancel?: () => void
  isLoading?: boolean
  title?: string
  showMap?: boolean
}

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

const ethiopianCities = [
  'Addis Ababa',
  'Dire Dawa',
  'Mekelle',
  'Gondar',
  'Awassa',
  'Bahir Dar',
  'Dessie',
  'Jimma',
  'Jijiga',
  'Shashamane',
  'Arba Minch',
  'Hosaena',
  'Harar',
  'Dila',
  'Nekemte',
  'Debre Berhan',
  'Sodo',
  'Asella',
  'Hawassa',
  'Bishoftu'
]

export function AddressForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  title = "Add Address",
  showMap = false
}: AddressFormProps) {
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

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
      country: 'ET',
      ...initialData
    }
  })

  const watchedRegion = watch('region')

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser')
      return
    }

    setIsGettingLocation(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        })
      })

      const { latitude, longitude } = position.coords
      setValue('lat', latitude)
      setValue('lon', longitude)
      setUseCurrentLocation(true)
    } catch (error) {
      console.error('Error getting location:', error)
      alert('Unable to get your current location')
    } finally {
      setIsGettingLocation(false)
    }
  }

  const handleFormSubmit = (data: AddressFormData) => {
    onSubmit(data)
  }

  const handleReset = () => {
    reset()
    setUseCurrentLocation(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Label (Optional)</Label>
            <Input
              id="label"
              placeholder="e.g., Home, Work, Office"
              {...register('label')}
            />
            {errors.label && (
              <p className="text-sm text-destructive">{errors.label.message}</p>
            )}
          </div>

          {/* Full Name */}
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

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+251 900 000 000"
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {/* Address Line 1 */}
          <div className="space-y-2">
            <Label htmlFor="line1">Address Line 1 *</Label>
            <Input
              id="line1"
              placeholder="Street address, building number"
              {...register('line1')}
            />
            {errors.line1 && (
              <p className="text-sm text-destructive">{errors.line1.message}</p>
            )}
          </div>

          {/* Address Line 2 */}
          <div className="space-y-2">
            <Label htmlFor="line2">Address Line 2 (Optional)</Label>
            <Input
              id="line2"
              placeholder="Apartment, suite, unit, etc."
              {...register('line2')}
            />
            {errors.line2 && (
              <p className="text-sm text-destructive">{errors.line2.message}</p>
            )}
          </div>

          {/* Region and City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select onValueChange={(value) => setValue('region', value)}>
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
              <Select onValueChange={(value) => setValue('city', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {ethiopianCities.map((city) => (
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

          {/* Postal Code */}
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code (Optional)</Label>
            <Input
              id="postalCode"
              placeholder="1000"
              {...register('postalCode')}
            />
            {errors.postalCode && (
              <p className="text-sm text-destructive">{errors.postalCode.message}</p>
            )}
          </div>

          {/* Plus Code */}
          <div className="space-y-2">
            <Label htmlFor="plusCode">Plus Code (Optional)</Label>
            <Input
              id="plusCode"
              placeholder="e.g., 6GCRPR6M+2H"
              {...register('plusCode')}
            />
            <p className="text-xs text-muted-foreground">
              Google Plus Code for precise location
            </p>
            {errors.plusCode && (
              <p className="text-sm text-destructive">{errors.plusCode.message}</p>
            )}
          </div>

          {/* Landmark */}
          <div className="space-y-2">
            <Label htmlFor="landmark">Landmark (Optional)</Label>
            <Input
              id="landmark"
              placeholder="e.g., Near Meskel Square, Behind Commercial Bank"
              {...register('landmark')}
            />
            {errors.landmark && (
              <p className="text-sm text-destructive">{errors.landmark.message}</p>
            )}
          </div>

          {/* Location Services */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="useLocation"
                checked={useCurrentLocation}
                onCheckedChange={(checked) => {
                  setUseCurrentLocation(checked as boolean)
                  if (!checked) {
                    setValue('lat', undefined)
                    setValue('lon', undefined)
                  }
                }}
              />
              <Label htmlFor="useLocation" className="text-sm">
                Use current location for precise delivery
              </Label>
            </div>

            {useCurrentLocation && (
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetCurrentLocation}
                  disabled={isGettingLocation}
                  className="w-full"
                >
                  {isGettingLocation ? (
                    "Getting location..."
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Current Location
                    </>
                  )}
                </Button>
                
                {/* Map Component */}
                {showMap && (
                  <div className="mt-4">
                    <Map
                      lat={watch('lat')}
                      lon={watch('lon')}
                      onLocationSelect={(lat, lon, address) => {
                        setValue('lat', lat)
                        setValue('lon', lon)
                      }}
                      height="300px"
                    />
                  </div>
                )}
              </div>
            )}

            {(watch('lat') && watch('lon')) && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Location: {watch('lat')?.toFixed(6)}, {watch('lon')?.toFixed(6)}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Saving..." : "Save Address"}
            </Button>
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
              type="button"
              variant="ghost"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
