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
  MessageSquare,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Flag,
  Shield
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

// Mock data - in a real app, this would come from the API
const mockReports = [
  {
    id: '1',
    messageId: 'msg_123',
    reporterId: 'user_456',
    reporterName: 'John Doe',
    reportedUserId: 'user_789',
    reportedUserName: 'Jane Smith',
    reason: 'SPAM',
    description: 'User is sending repeated promotional messages',
    status: 'PENDING',
    createdAt: '2024-01-20T10:30:00Z',
    message: {
      content: 'Check out my new product! 50% off today only!',
      timestamp: '2024-01-20T10:25:00Z'
    }
  },
  {
    id: '2',
    messageId: 'msg_124',
    reporterId: 'user_101',
    reporterName: 'Alice Johnson',
    reportedUserId: 'user_789',
    reportedUserName: 'Jane Smith',
    reason: 'HARASSMENT',
    description: 'Inappropriate language and personal attacks',
    status: 'RESOLVED',
    createdAt: '2024-01-19T15:45:00Z',
    message: {
      content: 'You are such an idiot! Your products are terrible!',
      timestamp: '2024-01-19T15:40:00Z'
    }
  },
  {
    id: '3',
    messageId: 'msg_125',
    reporterId: 'user_202',
    reporterName: 'Bob Wilson',
    reportedUserId: 'user_303',
    reportedUserName: 'Mike Brown',
    reason: 'INAPPROPRIATE_CONTENT',
    description: 'Sharing inappropriate images',
    status: 'PENDING',
    createdAt: '2024-01-18T09:15:00Z',
    message: {
      content: '[Image removed by moderator]',
      timestamp: '2024-01-18T09:10:00Z'
    }
  }
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <AlertCircle className="h-4 w-4" />
    case 'RESOLVED':
      return <CheckCircle className="h-4 w-4" />
    case 'DISMISSED':
      return <XCircle className="h-4 w-4" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'RESOLVED':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'DISMISSED':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getReasonColor = (reason: string) => {
  switch (reason) {
    case 'SPAM':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'HARASSMENT':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'INAPPROPRIATE_CONTENT':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'FRAUD':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function AdminChatReportsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [reasonFilter, setReasonFilter] = useState('')
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)

  const { isAuthenticated, isAdmin } = useAuth()

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportedUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || report.status === statusFilter
    const matchesReason = !reasonFilter || report.reason === reasonFilter
    
    return matchesSearch && matchesStatus && matchesReason
  })

  const handleViewReport = (report: any) => {
    setSelectedReport(report)
    setIsReportDialogOpen(true)
  }

  const handleResolveReport = async (reportId: string) => {
    // TODO: Implement report resolution API call
    console.log('Resolve report:', reportId)
  }

  const handleDismissReport = async (reportId: string) => {
    // TODO: Implement report dismissal API call
    console.log('Dismiss report:', reportId)
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
            <h1 className="text-3xl font-bold">Chat Reports</h1>
            <p className="text-muted-foreground">
              Review and moderate reported chat messages
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{mockReports.length}</p>
              <p className="text-sm text-muted-foreground">Total Reports</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {mockReports.filter(r => r.status === 'PENDING').length}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {mockReports.filter(r => r.status === 'RESOLVED').length}
              </p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">
                {mockReports.filter(r => r.status === 'DISMISSED').length}
              </p>
              <p className="text-sm text-muted-foreground">Dismissed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports by user names or description..."
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
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="DISMISSED">Dismissed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={reasonFilter} onValueChange={setReasonFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Reasons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Reasons</SelectItem>
                  <SelectItem value="SPAM">Spam</SelectItem>
                  <SelectItem value="HARASSMENT">Harassment</SelectItem>
                  <SelectItem value="INAPPROPRIATE_CONTENT">Inappropriate Content</SelectItem>
                  <SelectItem value="FRAUD">Fraud</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reported Message</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Reported User</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm font-medium line-clamp-2">
                          {report.message.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(report.message.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{report.reporterName}</p>
                        <p className="text-xs text-muted-foreground">ID: {report.reporterId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{report.reportedUserName}</p>
                        <p className="text-xs text-muted-foreground">ID: {report.reportedUserId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("border", getReasonColor(report.reason))}>
                        {report.reason.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("border", getStatusColor(report.status))}>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(report.status)}
                          <span>{report.status}</span>
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewReport(report)}
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

        {/* Report Details Dialog */}
        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-6">
                {/* Report Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Reporter</Label>
                      <p className="text-sm">{selectedReport.reporterName}</p>
                      <p className="text-xs text-muted-foreground">ID: {selectedReport.reporterId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Reported User</Label>
                      <p className="text-sm">{selectedReport.reportedUserName}</p>
                      <p className="text-xs text-muted-foreground">ID: {selectedReport.reportedUserId}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Reason</Label>
                      <div className="mt-1">
                        <Badge className={cn("border", getReasonColor(selectedReport.reason))}>
                          {selectedReport.reason.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">
                        <Badge className={cn("border", getStatusColor(selectedReport.status))}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(selectedReport.status)}
                            <span>{selectedReport.status}</span>
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedReport.description}
                    </p>
                  </div>
                </div>

                {/* Reported Message */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Reported Message</Label>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">{selectedReport.message.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Sent: {new Date(selectedReport.message.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {selectedReport.status === 'PENDING' && (
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button
                      onClick={() => handleResolveReport(selectedReport.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDismissReport(selectedReport.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
