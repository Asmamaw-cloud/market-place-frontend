'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  Search, 
  Filter, 
  MoreHorizontal,
  Store,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Ban,
  Shield
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useMerchants } from '@/hooks/useMerchants'
import { cn } from '@/lib/utils'

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4" />
    case 'inactive':
      return <XCircle className="h-4 w-4" />
    case 'pending':
      return <AlertCircle className="h-4 w-4" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'inactive':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function AdminMerchantsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [verificationFilter, setVerificationFilter] = useState('')
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null)
  const [isMerchantDialogOpen, setIsMerchantDialogOpen] = useState(false)

  const { isAuthenticated, isAdmin } = useAuth()
  const { merchants, isLoading, error, fetchMerchants } = useMerchants()

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchMerchants()
    }
  }, [isAuthenticated, isAdmin, fetchMerchants])

  const filteredMerchants = merchants?.filter(merchant => {
    const matchesSearch = merchant.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.legalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && true) || // All merchants are considered active
      (statusFilter === 'inactive' && false)
    const matchesVerification = !verificationFilter ||
      (verificationFilter === 'verified' && merchant.kyc?.status === 'APPROVED') ||
      (verificationFilter === 'unverified' && merchant.kyc?.status !== 'APPROVED')
    
    return matchesSearch && matchesStatus && matchesVerification
  }) || []

  const handleViewMerchant = (merchant: any) => {
    setSelectedMerchant(merchant)
    setIsMerchantDialogOpen(true)
  }

  const handleApproveMerchant = async (merchantId: string) => {
    // TODO: Implement merchant approval API call
    console.log('Approve merchant:', merchantId)
  }

  const handleRejectMerchant = async (merchantId: string) => {
    // TODO: Implement merchant rejection API call
    console.log('Reject merchant:', merchantId)
  }

  const handleToggleStatus = async (merchantId: string, isActive: boolean) => {
    // TODO: Implement status toggle API call
    console.log('Toggle status:', merchantId, isActive)
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You need admin privileges to access this page
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Merchant Management</h1>
            <p className="text-muted-foreground">
              Manage merchant accounts, approvals, and verification
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search merchants by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Verification</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Merchants Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Merchants</h3>
                <p className="text-muted-foreground mb-4">
                  {error || 'Failed to load merchants'}
                </p>
                <Button onClick={() => fetchMerchants()}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Service Areas</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMerchants.map((merchant) => (
                    <TableRow key={merchant.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            {merchant.logoUrl ? (
                              <img
                                src={merchant.logoUrl}
                                alt={merchant.displayName}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <Store className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{merchant.displayName}</p>
                            {merchant.legalName && (
                              <p className="text-sm text-muted-foreground">{merchant.legalName}</p>
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {merchant.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("border", getStatusColor('active'))}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon('active')}
                            <span>Active</span>
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={merchant.kyc?.status === 'APPROVED' ? "default" : "secondary"}>
                          <span className="flex items-center space-x-1">
                            <Shield className="h-3 w-3" />
                            <span>{merchant.kyc?.status === 'APPROVED' ? 'Verified' : 'Unverified'}</span>
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {merchant.serviceAreas?.slice(0, 2).map((area, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                          {merchant.serviceAreas && merchant.serviceAreas.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{merchant.serviceAreas.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {new Date(merchant.createdAt).toLocaleDateString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewMerchant(merchant)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Merchant Details Dialog */}
        <Dialog open={isMerchantDialogOpen} onOpenChange={setIsMerchantDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Merchant Details</DialogTitle>
            </DialogHeader>
            {selectedMerchant && (
              <div className="space-y-6">
                {/* Merchant Info */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                      {selectedMerchant.logoUrl ? (
                        <img
                          src={selectedMerchant.logoUrl}
                          alt={selectedMerchant.displayName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Store className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{selectedMerchant.displayName}</h3>
                      {selectedMerchant.legalName && (
                        <p className="text-muted-foreground">{selectedMerchant.legalName}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedMerchant.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">
                        <Badge className={cn("border", getStatusColor(selectedMerchant.isActive ? 'active' : 'inactive'))}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(selectedMerchant.isActive ? 'active' : 'inactive')}
                            <span>{selectedMerchant.isActive ? 'Active' : 'Inactive'}</span>
                          </span>
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Verification</Label>
                      <div className="mt-1">
                        <Badge variant={selectedMerchant.isVerified ? "default" : "secondary"}>
                          <span className="flex items-center space-x-1">
                            <Shield className="h-3 w-3" />
                            <span>{selectedMerchant.isVerified ? 'Verified' : 'Unverified'}</span>
                          </span>
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Created</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedMerchant.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Updated</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedMerchant.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {selectedMerchant.serviceAreas && selectedMerchant.serviceAreas.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Service Areas</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedMerchant.serviceAreas.map((area: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {(selectedMerchant.lat && selectedMerchant.lon) && (
                    <div>
                      <Label className="text-sm font-medium">Location</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedMerchant.lat.toFixed(6)}, {selectedMerchant.lon.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t">
                  {!selectedMerchant.isVerified && (
                    <>
                      <Button
                        onClick={() => handleApproveMerchant(selectedMerchant.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleRejectMerchant(selectedMerchant.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button
                    variant={selectedMerchant.isActive ? "destructive" : "default"}
                    onClick={() => handleToggleStatus(selectedMerchant.id, !selectedMerchant.isActive)}
                  >
                    {selectedMerchant.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
