'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useChat } from '@/hooks/useChat'
import { useNotifications } from '@/hooks/useNotifications'
import { MobileNavigation } from './mobile-navigation'
import { NotificationCenter } from '@/components/notifications/notification-center'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ShoppingCart,
  User,
  Menu,
  Search,
  Bell,
  MessageCircle,
  Store,
  Settings,
  LogOut,
  Heart,
  MapPin,
  CreditCard,
  Truck,
  Star,
  HelpCircle,
  ChevronDown,
  Package,
  BarChart3,
  FileText,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, logout, isUser, isMerchant, isAdmin } = useAuth()
  const { totalItems } = useCart()
  const { unreadCount } = useChat()
  const { unreadCount: notificationCount } = useNotifications()

  const isCustomerRoute = pathname.startsWith('/') && !pathname.startsWith('/merchant') && !pathname.startsWith('/admin')
  const isMerchantRoute = pathname.startsWith('/merchant')
  const isAdminRoute = pathname.startsWith('/admin')

  const customerNavItems = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Merchants', href: '/merchants' },
  ]

  const customerAccountItems = [
    { name: 'Orders', href: '/orders', icon: Truck },
    { name: 'Wishlist', href: '/wishlist', icon: Heart },
    { name: 'Addresses', href: '/profile/addresses', icon: MapPin },
    { name: 'Loyalty', href: '/profile/loyalty', icon: Star },
    { name: 'Reviews', href: '/profile/reviews', icon: Star },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ]

  const merchantNavItems = [
    { name: 'Dashboard', href: '/merchant/dashboard' },
    { name: 'Products', href: '/merchant/products' },
    { name: 'Orders', href: '/merchant/orders' },
    { name: 'Chat', href: '/merchant/chat' },
  ]

  const merchantAccountItems = [
    { name: 'Analytics', href: '/merchant/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/merchant/settings', icon: Settings },
  ]

  const adminNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Merchants', href: '/admin/merchants' },
    { name: 'Reports', href: '/admin/chat/reports' },
  ]

  const adminAccountItems = [
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'System', href: '/admin/system', icon: Shield },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const getNavItems = () => {
    if (isAdminRoute) return adminNavItems
    if (isMerchantRoute) return merchantNavItems
    return customerNavItems
  }

  const getAccountItems = () => {
    if (isAdminRoute) return adminAccountItems
    if (isMerchantRoute) return merchantAccountItems
    return customerAccountItems
  }

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 ">
          <Image 
            src="/logo.svg" 
            alt="MAJET" 
            width={34} 
            height={8} 
            className="h-10 w-full"
          />
          {/* <span className="text-xl font-bold">Ethiopian E-commerce</span> */}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {getNavItems().map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
          
          {/* Additional navigation items for customers */}
          {isCustomerRoute && isAuthenticated && (
            <>
              <Link href="/orders">
                <Button variant="ghost" size="sm" className="text-sm">
                  <Truck className="h-4 w-4 mr-2" />
                  Orders
                </Button>
              </Link>
              <Link href="/wishlist">
                <Button variant="ghost" size="sm" className="text-sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist
                </Button>
              </Link>
              <Link href="/help">
                <Button variant="ghost" size="sm" className="text-sm">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help
                </Button>
              </Link>
            </>
          )}

          {/* Additional navigation items for merchants */}
          {isMerchantRoute && isAuthenticated && (
            <>
              <Link href="/merchant/analytics">
                <Button variant="ghost" size="sm" className="text-sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Link href="/merchant/settings">
                <Button variant="ghost" size="sm" className="text-sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </>
          )}

          {/* Additional navigation items for admins */}
          {isAdminRoute && isAuthenticated && (
            <>
              <Link href="/admin/analytics">
                <Button variant="ghost" size="sm" className="text-sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Link href="/admin/system">
                <Button variant="ghost" size="sm" className="text-sm">
                  <Shield className="h-4 w-4 mr-2" />
                  System
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>

          {/* Cart (only for customers) */}
          {isCustomerRoute && (
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
          )}

          {/* Chat (for all authenticated users) */}
          {isAuthenticated && (
            <Link href={isMerchantRoute ? "/merchant/chat" : "/chat"}>
              <Button variant="ghost" size="icon" className="relative">
                <MessageCircle className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
          )}

          {/* Notifications */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsNotificationOpen(true)}
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {notificationCount}
                </Badge>
              )}
            </Button>
          )}

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium hidden lg:block">{user?.name || user?.email}</span>
              
              {/* Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Account Items */}
                  {getAccountItems().map((item) => {
                    const Icon = item.icon
                    return (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link href={item.href} className="flex items-center">
                          <Icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                  
                  <DropdownMenuSeparator />
                  
                  {/* Quick Actions */}
                  {isCustomerRoute && (
                    <DropdownMenuItem asChild>
                      <Link href="/merchant/register" className="flex items-center">
                        <Store className="h-4 w-4 mr-2" />
                        Become a Merchant
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <MobileNavigation />
        </div>
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </header>
  )
}
