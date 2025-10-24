'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { AddressForm } from '@/components/addresses/address-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Check,
  ArrowLeft
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Address } from '@/types'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

// Mock data - in a real app, this would come from the API
const mockAddresses: Address[] = [
  {
    id: '1',
    userId: 'user1',
    label: 'Home',
    fullName: 'John Doe',
    phone: '+251900000001',
    line1: '123 Main Street',
    line2: 'Apt 4B',
    city: 'Addis Ababa',
    region: 'Addis Ababa',
    country: 'ET',
    postalCode: '1000',
    plusCode: '6GCRPR6M+2H',
    landmark: 'Near Meskel Square',
    lat: 9.0192,
    lon: 38.7525,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    userId: 'user1',
    label: 'Work',
    fullName: 'John Doe',
    phone: '+251900000001',
    line1: '456 Business Avenue',
    city: 'Addis Ababa',
    region: 'Addis Ababa',
    country: 'ET',
    postalCode: '1000',
    lat: 9.0192,
    lon: 38.7525,
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  }
]

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      // Simulate API call
      setTimeout(() => {
        setAddresses(mockAddresses)
        setIsLoading(false)
      }, 1000)
    }
  }, [isAuthenticated])

  const handleAddAddress = (data: any) => {
    const newAddress: Address = {
      id: Date.now().toString(),
      userId: 'user1',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setAddresses(prev => [...prev, newAddress])
    setIsDialogOpen(false)
  }

  const handleEditAddress = (data: any) => {
    if (editingAddress) {
      setAddresses(prev => prev.map(addr => 
        addr.id === editingAddress.id 
          ? { ...addr, ...data, updatedAt: new Date().toISOString() }
          : addr
      ))
      setEditingAddress(null)
    }
  }

  const handleDeleteAddress = (addressId: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== addressId))
  }

  const openEditDialog = (address: Address) => {
    setEditingAddress(address)
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingAddress(null)
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Please Login</h1>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to manage your addresses
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
          <Link href="/profile">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Delivery Addresses</h1>
            <p className="text-muted-foreground">
              Manage your delivery addresses for faster checkout
            </p>
          </div>
        </div>

        {/* Add Address Button */}
        <div className="mb-8">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Address
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </DialogTitle>
              </DialogHeader>
              <AddressForm
                initialData={editingAddress || undefined}
                onSubmit={editingAddress ? handleEditAddress : handleAddAddress}
                onCancel={closeDialog}
                title={editingAddress ? 'Edit Address' : 'Add New Address'}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Addresses List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Addresses Found</h2>
            <p className="text-muted-foreground mb-6">
              Add your first delivery address to get started
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addresses.map((address) => (
              <Card key={address.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{address.label}</span>
                    </CardTitle>
                    <Badge variant="secondary">
                      {address.id === '1' ? 'Default' : 'Secondary'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="font-medium">{address.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.phone}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm">
                      {address.line1}
                      {address.line2 && `, ${address.line2}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.region || 'Ethiopia'}
                    </p>
                    {address.postalCode && (
                      <p className="text-sm text-muted-foreground">
                        {address.postalCode}
                      </p>
                    )}
                  </div>
                  
                  {address.landmark && (
                    <div>
                      <p className="text-xs text-muted-foreground">Landmark:</p>
                      <p className="text-sm">{address.landmark}</p>
                    </div>
                  )}
                  
                  {address.plusCode && (
                    <div>
                      <p className="text-xs text-muted-foreground">Plus Code:</p>
                      <p className="text-sm font-mono">{address.plusCode}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      Added {formatDate(address.createdAt)}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(address)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Address Management Tips */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Address Management Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Add a default address for faster checkout</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Include landmarks for easier delivery</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Use Plus Codes for precise locations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Keep addresses up to date</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
