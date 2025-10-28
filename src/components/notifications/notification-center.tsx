'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  ShoppingCart, 
  MessageSquare,
  Package,
  CreditCard,
  X,
  Check,
  Trash2
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { Notification } from '@/types'
import { cn } from '@/lib/utils'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'order':
      return <ShoppingCart className="h-4 w-4" />
    case 'message':
      return <MessageSquare className="h-4 w-4" />
    case 'payment':
      return <CreditCard className="h-4 w-4" />
    case 'shipment':
      return <Package className="h-4 w-4" />
    case 'system':
      return <Info className="h-4 w-4" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'order':
      return 'text-blue-600'
    case 'message':
      return 'text-green-600'
    case 'payment':
      return 'text-purple-600'
    case 'shipment':
      return 'text-orange-600'
    case 'system':
      return 'text-gray-600'
    default:
      return 'text-gray-600'
  }
}

export function NotificationCenter({ isOpen, onClose, className }: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState('all')
  const { isAuthenticated } = useAuth()
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAllNotifications 
  } = useNotifications()

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      // Fetch notifications when center opens
      // This would typically be handled by the useNotifications hook
    }
  }, [isOpen, isAuthenticated])

  if (!isOpen) return null

  const filteredNotifications = notifications?.filter(notification => {
    switch (activeTab) {
      case 'unread':
        return !notification.read
      case 'orders':
        return notification.type === 'order'
      case 'messages':
        return notification.type === 'message'
      case 'payments':
        return notification.type === 'payment'
      case 'shipments':
        return notification.type === 'shipment'
      default:
        return true
    }
  }) || []

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId)
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const handleClearAll = async () => {
    try {
      await clearAllNotifications()
    } catch (error) {
      console.error('Failed to clear all notifications:', error)
    }
  }

  return (
    <div className={cn('fixed inset-0 z-50 ', className)}>
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-lg">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkAllAsRead}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark All Read
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="shipments">Shipments</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="flex-1 p-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {activeTab === 'unread' 
                          ? 'No unread notifications' 
                          : 'No notifications found'
                        }
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <Card 
                        key={notification.id} 
                        className={cn(
                          'cursor-pointer transition-colors hover:bg-muted/50',
                          !notification.read && 'bg-blue-50 border-blue-200'
                        )}
                        onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className={cn(
                              'flex-shrink-0 rounded-full p-2',
                              getNotificationColor(notification.type)
                            )}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium line-clamp-2">
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-1 ml-2">
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteNotification(notification.id)
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="border-t p-4">
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Notifications
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
