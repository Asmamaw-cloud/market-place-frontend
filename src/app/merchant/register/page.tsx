'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Store, 
  MapPin, 
  Upload, 
  CheckCircle,
  ArrowLeft,
  Loader2,
  X
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useMerchants } from '@/hooks/useMerchants'
import { merchantSchema } from '@/lib/validators'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { UploadButton } from '@/components/uploadthing'

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

const businessTypes = [
  'Retail Store',
  'Restaurant',
  'Grocery Store',
  'Pharmacy',
  'Electronics',
  'Clothing',
  'Furniture',
  'Automotive',
  'Other'
]

export default function MerchantRegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [serviceAreas, setServiceAreas] = useState<string[]>([])
  const [newServiceArea, setNewServiceArea] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const router = useRouter()
  const { isAuthenticated, isUser, user, isLoading: authLoading, loadUser } = useAuth()
  const { createMerchant } = useMerchants()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(merchantSchema),
    defaultValues: {
      displayName: '',
      legalName: '',
      description: '',
      serviceAreas: [],
      lat: undefined,
      lon: undefined,
      logoUrl: undefined
    }
  })

  const watchedLat = watch('lat')
  const watchedLon = watch('lon')

  const handleLogoUpload = (res: any[] | undefined) => {
    if (res && res[0]) {
      const uploadedUrl = res[0].url
      setLogoUrl(uploadedUrl)
      setValue('logoUrl', uploadedUrl)
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
      setLocationError('Geolocation is not supported by this browser')
      return
    }

    setLocationError(null) // Clear any previous errors
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
      setLocationError(null) // Clear any errors on success
    } catch (error: any) {
      console.error('Error getting location:', error)
      
      // Handle different error codes with user-friendly messages
      let errorMessage = 'Unable to get your current location'
      if (error.code === 1) {
        errorMessage = 'Location permission denied. Please allow location access in your browser settings or register without location.'
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Please check your device location settings.'
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please try again.'
      }
      
      setLocationError(errorMessage)
    } finally {
      setIsGettingLocation(false)
    }
  }

  const onSubmit = async (data: any) => {
    if (!isAuthenticated || !isUser) {
      router.push('/login')
      return
    }

    // Double-check authentication before making API call
    if (!user?.id) {
      console.error('User ID not available')
      router.push('/login')
      return
    }

    setError(null) // Clear any previous errors
    setIsSubmitting(true)
    try {
      // Filter out undefined, null, and empty values
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => {
          // Keep all defined values except lat/lon if they're undefined
          if (key === 'lat' || key === 'lon') {
            return value !== undefined && value !== null && value !== ''
          }
          return value !== undefined && value !== null && value !== ''
        })
      )
      
      // Include logo URL if uploaded
      const merchantData = {
        ...cleanData,
        logoUrl: logoUrl || undefined,
        serviceAreas
      }

      console.log('=== FRONTEND DEBUG ===')
      console.log('Original form data:', data)
      console.log('Cleaned data:', cleanData)
      console.log('Final merchant data:', merchantData)
      console.log('User authenticated:', isAuthenticated)
      console.log('User ID:', user?.id)
      console.log('=== END FRONTEND DEBUG ===')
      
      await createMerchant(merchantData)
      
      // Reload user data to get updated role
      await loadUser()
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        router.push('/merchant/dashboard')
      }, 100)
    } catch (error: any) {
      console.error('Failed to create merchant:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create merchant account. Please try again.'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <Loader2 className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Loading...</h1>
            <p className="text-muted-foreground">
              Please wait while we verify your authentication
            </p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Please Login</h1>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to register as a merchant
            </p>
            <Link href="/login">
              <Button>Login to Continue</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Become a Merchant</h1>
            <p className="text-muted-foreground">
              Join our platform and start selling to customers across Ethiopia
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Store className="h-5 w-5" />
                <span>Merchant Registration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Business Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Store Name *</Label>
                    <Input
                      id="displayName"
                      placeholder="Enter your store name"
                      {...register('displayName')}
                    />
                    {errors.displayName && (
                      <p className="text-sm text-destructive">{errors.displayName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalName">Legal Business Name</Label>
                    <Input
                      id="legalName"
                      placeholder="Enter legal business name (if different)"
                      {...register('legalName')}
                    />
                    {errors.legalName && (
                      <p className="text-sm text-destructive">{errors.legalName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Business Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your business and what you sell"
                      {...register('description')}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo">Store Logo</Label>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {logoUrl ? (
                          <div className="w-20 h-20 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center relative group">
                            <img
                              src={logoUrl}
                              alt="Logo preview"
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setLogoUrl(null)
                                setValue('logoUrl', undefined)
                              }}
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <UploadButton
                            endpoint="merchantLogo"
                            onClientUploadComplete={handleLogoUpload}
                            onUploadError={(error: Error) => {
                              console.error('Upload error:', error)
                              setError('Failed to upload logo. Please try again.')
                            }}
                            appearance={{
                              button: "w-20 h-20 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center hover:border-primary transition-colors bg-transparent",
                              allowedContent: "hidden"
                            }}
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Upload your store logo (optional)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Recommended: 200x200px, PNG or JPG
                        </p>
                        {logoUrl && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            ✓ Logo uploaded successfully
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Location Information</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Store Location</Label>
                      <span className="text-xs text-muted-foreground">(Optional)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGetCurrentLocation}
                        disabled={isGettingLocation}
                        className="flex-1"
                      >
                        {isGettingLocation ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Getting Location...
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4 mr-2" />
                            Use Current Location
                          </>
                        )}
                      </Button>
                    </div>
                    {locationError && (
                      <Alert variant="destructive">
                        <AlertDescription>{locationError}</AlertDescription>
                      </Alert>
                    )}
                    {(watchedLat && watchedLon) && !locationError && (
                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Location captured: {watchedLat.toFixed(6)}, {watchedLon.toFixed(6)}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Adding your location helps customers find your store. You can skip this and add it later.
                    </p>
                  </div>
                </div>

                {/* Service Areas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Service Areas</h3>
                  
                  <div className="space-y-2">
                    <Label>Add Service Areas</Label>
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
                        Add
                      </Button>
                    </div>
                  </div>

                  {serviceAreas.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Service Areas</Label>
                      <div className="flex flex-wrap gap-2">
                        {serviceAreas.map((area) => (
                          <div
                            key={area}
                            className="flex items-center space-x-2 bg-muted px-3 py-1 rounded-full"
                          >
                            <span className="text-sm">{area}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveServiceArea(area)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{' '}
                      <Link href="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox id="merchant-agreement" required />
                    <Label htmlFor="merchant-agreement" className="text-sm">
                      I understand that I will be responsible for fulfilling orders, 
                      managing inventory, and providing customer support
                    </Label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Merchant Account...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Register as Merchant
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Benefits Card */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Why Join as a Merchant?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Reach More Customers</h4>
                  <p className="text-sm text-muted-foreground">
                    Access customers across Ethiopia with our platform
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Secure Payments</h4>
                  <p className="text-sm text-muted-foreground">
                    Get paid securely with escrow protection
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Easy Management</h4>
                  <p className="text-sm text-muted-foreground">
                    Manage orders, inventory, and customers in one place
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Local Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Get support in Amharic and local languages
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
