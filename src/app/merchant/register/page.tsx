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
  Loader2
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useMerchants } from '@/hooks/useMerchants'
import { merchantSchema } from '@/lib/validators'
import { cn } from '@/lib/utils'
import Link from 'next/link'

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
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [serviceAreas, setServiceAreas] = useState<string[]>([])
  const [newServiceArea, setNewServiceArea] = useState('')

  const router = useRouter()
  const { isAuthenticated, isUser } = useAuth()
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
      lat: undefined,
      lon: undefined,
      serviceAreas: []
    }
  })

  const watchedLat = watch('lat')
  const watchedLon = watch('lon')

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
    if (!isAuthenticated || !isUser) {
      router.push('/login')
      return
    }

    setIsSubmitting(true)
    try {
      const merchantData = {
        ...data,
        logoUrl: logoPreview, // In a real app, you'd upload this to a server
        serviceAreas
      }

      await createMerchant(merchantData)
      router.push('/merchant/dashboard')
    } catch (error) {
      console.error('Failed to create merchant:', error)
    } finally {
      setIsSubmitting(false)
    }
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
                        <input
                          type="file"
                          id="logo"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <Label htmlFor="logo" className="cursor-pointer">
                          <div className="w-20 h-20 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center hover:border-primary transition-colors">
                            {logoPreview ? (
                              <img
                                src={logoPreview}
                                alt="Logo preview"
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Upload className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                        </Label>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Upload your store logo (optional)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Recommended: 200x200px, PNG or JPG
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Location Information</h3>
                  
                  <div className="space-y-2">
                    <Label>Store Location</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGetCurrentLocation}
                        className="flex-1"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Use Current Location
                      </Button>
                    </div>
                    {(watchedLat && watchedLon) && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Location: {watchedLat.toFixed(6)}, {watchedLon.toFixed(6)}
                        </p>
                      </div>
                    )}
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
