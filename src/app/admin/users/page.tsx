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
  Users,
  Loader2,
  AlertCircle,
  Shield,
  User,
  Store,
  Crown,
  Eye,
  Edit,
  Ban
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

// Mock data - in a real app, this would come from the API
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+251911234567',
    role: 'USER',
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
    lastLogin: '2024-01-20T14:22:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+251911234568',
    role: 'MERCHANT',
    isActive: true,
    createdAt: '2024-01-10T09:15:00Z',
    lastLogin: '2024-01-20T16:45:00Z'
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+251911234569',
    role: 'ADMIN',
    isActive: true,
    createdAt: '2024-01-01T08:00:00Z',
    lastLogin: '2024-01-20T17:30:00Z'
  }
]

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return <Crown className="h-4 w-4" />
    case 'MERCHANT':
      return <Store className="h-4 w-4" />
    case 'USER':
      return <User className="h-4 w-4" />
    default:
      return <User className="h-4 w-4" />
  }
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'MERCHANT':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'USER':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)

  const { isAuthenticated, isAdmin } = useAuth()

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm)
    const matchesRole = !roleFilter || user.role === roleFilter
    const matchesStatus = !statusFilter || user.isActive === (statusFilter === 'active')
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleViewUser = (user: any) => {
    setSelectedUser(user)
    setIsUserDialogOpen(true)
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    // TODO: Implement role update API call
    console.log('Update role:', userId, newRole)
  }

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    // TODO: Implement status toggle API call
    console.log('Toggle status:', userId, isActive)
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
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage users, roles, and permissions
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
                    placeholder="Search users by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  <SelectItem value="USER">Users</SelectItem>
                  <SelectItem value="MERCHANT">Merchants</SelectItem>
                  <SelectItem value="ADMIN">Admins</SelectItem>
                </SelectContent>
              </Select>
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
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("border", getRoleColor(user.role))}>
                        <span className="flex items-center space-x-1">
                          {getRoleIcon(user.role)}
                          <span>{user.role}</span>
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewUser(user)}
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

        {/* User Details Dialog */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                {/* User Info */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                      <p className="text-muted-foreground">{selectedUser.email}</p>
                      <p className="text-sm text-muted-foreground">{selectedUser.phone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Role</Label>
                      <div className="mt-1">
                        <Badge className={cn("border", getRoleColor(selectedUser.role))}>
                          <span className="flex items-center space-x-1">
                            {getRoleIcon(selectedUser.role)}
                            <span>{selectedUser.role}</span>
                          </span>
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">
                        <Badge variant={selectedUser.isActive ? "default" : "secondary"}>
                          {selectedUser.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Created</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Login</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedUser.lastLogin).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateRole(selectedUser.id, 'USER')}
                    disabled={selectedUser.role === 'USER'}
                  >
                    Make User
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateRole(selectedUser.id, 'MERCHANT')}
                    disabled={selectedUser.role === 'MERCHANT'}
                  >
                    Make Merchant
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateRole(selectedUser.id, 'ADMIN')}
                    disabled={selectedUser.role === 'ADMIN'}
                  >
                    Make Admin
                  </Button>
                  <Button
                    variant={selectedUser.isActive ? "destructive" : "default"}
                    onClick={() => handleToggleStatus(selectedUser.id, !selectedUser.isActive)}
                  >
                    {selectedUser.isActive ? 'Deactivate' : 'Activate'}
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
