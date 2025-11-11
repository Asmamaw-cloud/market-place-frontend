'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Store,
  User,
  Bell,
  CreditCard,
  Shield,
  MapPin,
  Globe,
  Mail,
  Phone,
  Save,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Settings as SettingsIcon
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useMerchants } from '@/hooks/useMerchants'
import { cn } from '@/lib/utils'

export default function MerchantSettingsPage() {
  const { isAuthenticated, isMerchant, user } = useAuth()
  const { currentMerchant, loadMerchantById, updateMerchant } = useMerchants()
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Store Information - loaded from merchant data
  const [storeName, setStoreName] = useState('')
  const [storeDescription, setStoreDescription] = useState('')
  const [storeEmail, setStoreEmail] = useState('')
  const [storePhone, setStorePhone] = useState('')
  const [storeAddress, setStoreAddress] = useState('')
  const [storeLogo, setStoreLogo] = useState<string | null>(null)

  // Load merchant data on mount or if not already loaded
  useEffect(() => {
    const loadMerchantData = async () => {
      if (!isAuthenticated || !isMerchant) {
        setIsLoading(false)
        return
      }

      // Only load if we don't have current merchant data
      if (!currentMerchant) {
        try {
          console.log('Loading merchant data for settings page...')
          await loadMerchantById('current')
        } catch (error) {
          console.error('Failed to load merchant data:', error)
        }
      } else {
        console.log('Merchant data already loaded:', currentMerchant)
      }
      
      setIsLoading(false)
    }

    loadMerchantData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isMerchant])

  // Business Information
  const [businessName, setBusinessName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [businessType, setBusinessType] = useState('llc')
  const [registrationNumber, setRegistrationNumber] = useState('')

  // Update form fields when merchant data loads
  useEffect(() => {
    console.log('Settings useEffect triggered - currentMerchant:', currentMerchant)
    console.log('Settings useEffect triggered - user:', user)
    
    if (currentMerchant) {
      console.log('Prefilling form fields with merchant data:', currentMerchant)
      console.log('Merchant displayName:', currentMerchant.displayName)
      console.log('Merchant description:', currentMerchant.description)
      console.log('Merchant legalName:', currentMerchant.legalName)
      console.log('Merchant owner:', (currentMerchant as any)?.owner)
      console.log('Merchant payout:', (currentMerchant as any)?.payout)
      
      // Store Information
      setStoreName(currentMerchant.displayName || '')
      setStoreDescription(currentMerchant.description || '')
      
      // Get email and phone from owner if available, otherwise from current merchant object or user
      const ownerEmail = (currentMerchant as any)?.owner?.email || user?.email || ''
      const ownerPhone = (currentMerchant as any)?.owner?.phone || user?.phone || ''
      setStoreEmail(ownerEmail)
      setStorePhone(ownerPhone)
      
      setStoreLogo(currentMerchant.logoUrl || null)
      
      // Address - try to format it better if we have lat/lon
      if (currentMerchant.lat && currentMerchant.lon) {
        // You could use a geocoding service to get address from lat/lon
        // For now, just show coordinates or try to get a formatted address
        setStoreAddress(`${currentMerchant.lat}, ${currentMerchant.lon}`)
      } else {
        setStoreAddress('')
      }
      
      // Business Information - prefilled from merchant data
      setBusinessName(currentMerchant.legalName || '')
      
      // Payment Settings - prefilled from MerchantPayout if available
      const payout = (currentMerchant as any)?.payout
      if (payout) {
        setPaymentMethod(payout.method || 'telebirr')
        setAccountNumber(payout.accountRef || '')
        // Account name could be derived from merchant name or owner name
        setAccountName(currentMerchant.displayName || ownerEmail || '')
      } else {
        // Set defaults if no payout exists yet
        setPaymentMethod('telebirr')
        setAccountNumber('')
        setAccountName('')
      }
      
      // Note: taxId, businessType, and registrationNumber might be in MerchantKyc or elsewhere
      // For now, we'll leave them empty if not in the merchant object
      // These could be extended to fetch from related tables if needed
    }
  }, [currentMerchant, user])

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [orderNotifications, setOrderNotifications] = useState(true)
  const [reviewNotifications, setReviewNotifications] = useState(true)
  const [lowStockNotifications, setLowStockNotifications] = useState(true)
  const [messageNotifications, setMessageNotifications] = useState(true)

  // Payment Settings
  const [paymentMethod, setPaymentMethod] = useState('telebirr')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')

  // Shipping Settings
  const [shippingEnabled, setShippingEnabled] = useState(true)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('500')
  const [deliveryTime, setDeliveryTime] = useState('2-5')

  const handleSave = async (section: string) => {
    if (!currentMerchant?.id) {
      console.error('Merchant ID not available')
      return
    }

    setIsSaving(true)
    try {
      const updateData: any = {}
      
      if (section === 'store' || section === 'all') {
        updateData.displayName = storeName
        updateData.description = storeDescription
        if (storeLogo) {
          updateData.logoUrl = storeLogo
        }
      }

      if (section === 'business' || section === 'all') {
        updateData.legalName = businessName
        // Note: taxId, businessType, registrationNumber would need to be stored elsewhere
        // (e.g., in MerchantKyc or a separate settings table)
      }

      if (section === 'payment' || section === 'all') {
        // Update payout information
        // This would need a separate API endpoint to update MerchantPayout
        // For now, we'll just update merchant data
        updateData.payout = {
          method: paymentMethod,
          accountRef: accountNumber
        }
      }

      // Update merchant via API
      await updateMerchant(currentMerchant.id, updateData)
      
      // Reload merchant data
      await loadMerchantById('current')
      
      setIsSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save merchant settings:', error)
      setIsSaving(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setStoreLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (!isAuthenticated || !isMerchant) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <SettingsIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You need to be a merchant to access settings
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
          <div className="text-center">
            <SettingsIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-pulse" />
            <h1 className="text-2xl font-bold mb-2">Loading Settings...</h1>
            <p className="text-muted-foreground">
              Please wait while we load your merchant information
            </p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your store settings and preferences
          </p>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Settings saved successfully!
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="store" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="store">
              <Store className="h-4 w-4 mr-2" />
              Store
            </TabsTrigger>
            <TabsTrigger value="business">
              <User className="h-4 w-4 mr-2" />
              Business
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="shipping">
              <MapPin className="h-4 w-4 mr-2" />
              Shipping
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Store Information Tab */}
          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
                <CardDescription>
                  Update your store details and public information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Store Logo */}
                <div className="space-y-2">
                  <Label>Store Logo</Label>
                  <div className="flex items-center space-x-4">
                    {storeLogo ? (
                      <div className="relative w-24 h-24 border-2 border-dashed rounded-lg overflow-hidden group">
                        <img
                          src={storeLogo}
                          alt="Store logo"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setStoreLogo(null)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <X className="h-6 w-6 text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
                        <Store className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Label htmlFor="logo-upload">
                        <Button variant="outline" className="cursor-pointer" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Logo
                          </span>
                        </Button>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG up to 2MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Store Name */}
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name *</Label>
                  <Input
                    id="storeName"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="My Ethiopian Store"
                  />
                </div>

                {/* Store Description */}
                <div className="space-y-2">
                  <Label htmlFor="storeDescription">Store Description</Label>
                  <Textarea
                    id="storeDescription"
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                    placeholder="Describe your store..."
                    rows={4}
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeEmail">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="storeEmail"
                        type="email"
                        value={storeEmail}
                        onChange={(e) => setStoreEmail(e.target.value)}
                        className="pl-10"
                        placeholder="store@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storePhone">Phone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="storePhone"
                        type="tel"
                        value={storePhone}
                        onChange={(e) => setStorePhone(e.target.value)}
                        className="pl-10"
                        placeholder="+251911234567"
                      />
                    </div>
                  </div>
                </div>

                {/* Store Address */}
                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Store Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="storeAddress"
                      value={storeAddress}
                      onChange={(e) => setStoreAddress(e.target.value)}
                      className="pl-10"
                      placeholder="Bole, Addis Ababa"
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave('store')} disabled={isSaving}>
                  {isSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Information Tab */}
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Manage your business details and legal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Legal Business Name *</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ethiopian Store LLC"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Select value={businessType} onValueChange={setBusinessType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sole">Sole Proprietorship</SelectItem>
                        <SelectItem value="llc">Limited Liability Company</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="corporation">Corporation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID (TIN) *</Label>
                    <Input
                      id="taxId"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="TIN-123456789"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Business Registration Number *</Label>
                  <Input
                    id="registrationNumber"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="REG-987654"
                  />
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Business information is used for tax purposes and legal compliance. 
                    Ensure all details are accurate.
                  </AlertDescription>
                </Alert>

                <Button onClick={() => handleSave('business')} disabled={isSaving}>
                  {isSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-medium">Notification Types</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Order Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        New orders and order status changes
                      </p>
                    </div>
                    <Switch
                      checked={orderNotifications}
                      onCheckedChange={setOrderNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Customer Reviews</Label>
                      <p className="text-sm text-muted-foreground">
                        New reviews on your products
                      </p>
                    </div>
                    <Switch
                      checked={reviewNotifications}
                      onCheckedChange={setReviewNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Low Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        When products are running low
                      </p>
                    </div>
                    <Switch
                      checked={lowStockNotifications}
                      onCheckedChange={setLowStockNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        New messages from customers
                      </p>
                    </div>
                    <Switch
                      checked={messageNotifications}
                      onCheckedChange={setMessageNotifications}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave('notifications')} disabled={isSaving}>
                  {isSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings Tab */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>
                  Configure your payment methods and payout details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Preferred Payment Method *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="telebirr">TeleBirr</SelectItem>
                      <SelectItem value="cbebirr">CBE Birr</SelectItem>
                      <SelectItem value="chapa">Chapa</SelectItem>
                      <SelectItem value="amole">Amole</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter your account number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Holder Name *</Label>
                  <Input
                    id="accountName"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Name on account"
                  />
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your payment information is encrypted and secure. We'll use this 
                    information to process your payouts.
                  </AlertDescription>
                </Alert>

                <Button onClick={() => handleSave('payment')} disabled={isSaving}>
                  {isSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Payment Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shipping Settings Tab */}
          <TabsContent value="shipping">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Settings</CardTitle>
                <CardDescription>
                  Configure shipping options and delivery times
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Shipping</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to order with shipping
                    </p>
                  </div>
                  <Switch
                    checked={shippingEnabled}
                    onCheckedChange={setShippingEnabled}
                  />
                </div>

                {shippingEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="freeShipping">Free Shipping Threshold (ETB)</Label>
                      <Input
                        id="freeShipping"
                        type="number"
                        value={freeShippingThreshold}
                        onChange={(e) => setFreeShippingThreshold(e.target.value)}
                        placeholder="500"
                      />
                      <p className="text-xs text-muted-foreground">
                        Orders above this amount get free shipping
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryTime">Estimated Delivery Time (days)</Label>
                      <Input
                        id="deliveryTime"
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        placeholder="2-5"
                      />
                      <p className="text-xs text-muted-foreground">
                        e.g., "2-5" for 2 to 5 business days
                      </p>
                    </div>
                  </>
                )}

                <Button onClick={() => handleSave('shipping')} disabled={isSaving}>
                  {isSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Shipping Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-muted-foreground">
                    You're currently signed in as {user?.email}
                  </p>
                  <Button variant="outline">
                    Change Password
                  </Button>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                  <Button variant="outline">
                    Enable 2FA
                  </Button>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-medium">Active Sessions</h4>
                  <p className="text-sm text-muted-foreground">
                    Manage devices where you're currently logged in
                  </p>
                  <Button variant="outline">
                    View Active Sessions
                  </Button>
                </div>

                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Danger Zone:</strong> Deactivating your account will remove 
                    all your products and data. This action cannot be undone.
                  </AlertDescription>
                </Alert>

                <Button variant="destructive">
                  Deactivate Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

