'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Store, 
  MapPin, 
  Upload, 
  Save,
  Edit,
  X,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useMerchants } from '@/hooks/useMerchants'
import { merchantSchema } from '@/lib/validators'
import { cn } from '@/lib/utils'
import { Map } from '@/components/ui/map'
import { DeliveryZones } from '@/components/merchants/delivery-zones'

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

export default function MerchantProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [serviceAreas, setServiceAreas] = useState<string[]>([])
  const [newServiceArea, setNewServiceArea] = useState('')

  const { isAuthenticated, isMerchant, user } = useAuth()
  const { currentMerchant, updateMerchant, isLoading } = useMerchants()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: zodResolver(merchantSchema),
    defaultValues: {
      displayName: '',
      legalName: '',
      description: '',
      lat: undefined,
      lon: undefined,
      serviceAreas: []
    }
  })

  const watchedLat = watch('lat')
  const watchedLon = watch('lon')

  useEffect(() => {
    if (currentMerchant) {
      setValue('displayName', currentMerchant.displayName || '')
      setValue('legalName', currentMerchant.legalName || '')
      setValue('description', currentMerchant.description || '')
      setValue('lat', currentMerchant.lat || undefined)
      setValue('lon', currentMerchant.lon || undefined)
      setValue('serviceAreas', currentMerchant.serviceAreas || [])
      setServiceAreas(currentMerchant.serviceAreas || [])
      setLogoPreview(currentMerchant.logoUrl || null)
    }
  }, [currentMerchant, setValue])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddServiceArea = () => {
    if (newServiceArea.trim() && !serviceAreas.includes(newServiceArea.trim())) {
      const updatedAreas = [...serviceAreas, newServiceArea.trim()]
      setServiceAreas(updatedAreas)
      setValue('serviceAreas', updatedAreas)
      setNewServiceArea('')
    }
  }

  const handleRemoveServiceArea = (area: string) => {
    const updatedAreas = serviceAreas.filter(a => a !== area)
    setServiceAreas(updatedAreas)
    setValue('serviceAreas', updatedAreas)
  }

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser')
      return
    }

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
    } catch (error) {
      console.error('Error getting location:', error)
      alert('Unable to get your current location')
    }
  }

  const onSubmit = async (data: any) => {
    if (!isAuthenticated || !isMerchant || !currentMerchant) return

    setIsSubmitting(true)
    try {
      const updateData = {
        ...data,
        logoUrl: logoPreview, // In a real app, you'd upload this to a server
        serviceAreas
      }

      await updateMerchant(currentMerchant.id, updateData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update merchant:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (currentMerchant) {
      reset({
        displayName: currentMerchant.displayName || '',
        legalName: currentMerchant.legalName || '',
        description: currentMerchant.description || '',
        lat: currentMerchant.lat || undefined,
        lon: currentMerchant.lon || undefined,
        serviceAreas: currentMerchant.serviceAreas || []
      })
      setServiceAreas(currentMerchant.serviceAreas || [])
      setLogoPreview(currentMerchant.logoUrl || null)
    }
    setIsEditing(false)
  }

  if (!isAuthenticated || !isMerchant) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You need to be a merchant to access this page
            </p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!currentMerchant) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Merchant Not Found</h1>
            <p className="text-muted-foreground mb-6">
              Your merchant account could not be found
            </p>
            <Button asChild>
              <a href="/merchant/register">Register as Merchant</a>
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Merchant Profile</h1>
            <p className="text-muted-foreground">
              Manage your merchant account and business information
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="delivery">Delivery Zones</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Store Logo */}
                  <div className="space-y-2">
                    <Label>Store Logo</Label>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <input
                          type="file"
                          id="logo"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          disabled={!isEditing}
                        />
                        <Label htmlFor="logo" className={cn("cursor-pointer", !isEditing && "cursor-not-allowed")}>
                          <div className="w-24 h-24 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center hover:border-primary transition-colors">
                            {logoPreview ? (
                              <img
                                src={logoPreview}
                                alt="Logo preview"
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Upload className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                        </Label>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {isEditing ? 'Click to upload new logo' : 'Store logo'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Recommended: 200x200px, PNG or JPG
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Store Name */}
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Store Name *</Label>
                    <Input
                      id="displayName"
                      placeholder="Enter your store name"
                      {...register('displayName')}
                      disabled={!isEditing}
                    />
                    {errors.displayName && (
                      <p className="text-sm text-destructive">{errors.displayName.message}</p>
                    )}
                  </div>

                  {/* Legal Name */}
                  <div className="space-y-2">
                    <Label htmlFor="legalName">Legal Business Name</Label>
                    <Input
                      id="legalName"
                      placeholder="Enter legal business name (if different)"
                      {...register('legalName')}
                      disabled={!isEditing}
                    />
                    {errors.legalName && (
                      <p className="text-sm text-destructive">{errors.legalName.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Business Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your business and what you sell"
                      {...register('description')}
                      disabled={!isEditing}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label>Account Status</Label>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">
                        Active
                      </Badge>
                      {currentMerchant.kyc?.status === 'APPROVED' && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Location Tab */}
            <TabsContent value="location">
              <Card>
                <CardHeader>
                  <CardTitle>Location & Service Areas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Store Location */}
                  <div className="space-y-4">
                    <Label>Store Location</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGetCurrentLocation}
                        className="flex-1"
                        disabled={!isEditing}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Use Current Location
                      </Button>
                    </div>
                    
                    {/* Map Component */}
                    {isEditing && (
                      <div className="mt-4">
                        <Map
                          lat={watchedLat}
                          lon={watchedLon}
                          onLocationSelect={(lat, lon, address) => {
                            setValue('lat', lat)
                            setValue('lon', lon)
                          }}
                          height="300px"
                          disabled={!isEditing}
                        />
                      </div>
                    )}
                    
                    {(watchedLat && watchedLon) && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Location: {watchedLat.toFixed(6)}, {watchedLon.toFixed(6)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Service Areas */}
                  <div className="space-y-4">
                    <Label>Service Areas</Label>
                    
                    {isEditing && (
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Enter service area (e.g., Addis Ababa, Bole)"
                            value={newServiceArea}
                            onChange={(e) => setNewServiceArea(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddServiceArea())}
                          />
                          <Button
                            type="button"
                            onClick={handleAddServiceArea}
                            disabled={!newServiceArea.trim()}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </div>
                      </div>
                    )}

                    {serviceAreas.length > 0 && (
                      <div className="space-y-2">
                        <Label>Current Service Areas</Label>
                        <div className="flex flex-wrap gap-2">
                          {serviceAreas.map((area) => (
                            <div
                              key={area}
                              className="flex items-center space-x-2 bg-muted px-3 py-1 rounded-full"
                            >
                              <span className="text-sm">{area}</span>
                              {isEditing && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveServiceArea(area)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Delivery Zones Tab */}
            <TabsContent value="delivery">
              <DeliveryZones 
                merchantId={currentMerchant?.id || ''} 
                onZonesChange={(zones) => {
                  // In a real app, this would save to the API
                  console.log('Delivery zones updated:', zones)
                }}
              />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Account Status</Label>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">
                          Active
                        </Badge>
                        {currentMerchant.kyc?.status === 'APPROVED' && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Created At</Label>
                      <p className="text-sm text-muted-foreground">
                        {currentMerchant.createdAt ? new Date(currentMerchant.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Last Updated</Label>
                      <p className="text-sm text-muted-foreground">
                        {currentMerchant.updatedAt ? new Date(currentMerchant.updatedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Contact support if you need to change your account status or have any questions about your merchant account.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  )
}
