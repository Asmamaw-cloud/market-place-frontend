'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Menu, 
  X, 
  Home, 
  ShoppingCart, 
  Package, 
  User, 
  MessageSquare, 
  Bell,
  Store,
  Settings,
  LogOut,
  Search,
  Heart,
  MapPin,
  CreditCard,
  Truck,
  Star,
  HelpCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useNotifications } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'

interface MobileNavigationProps {
  className?: string
}

const customerNavItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Cart', href: '/cart', icon: ShoppingCart },
  { name: 'Orders', href: '/orders', icon: Truck },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Addresses', href: '/profile/addresses', icon: MapPin },
  { name: 'Loyalty', href: '/profile/loyalty', icon: Star },
  { name: 'Reviews', href: '/profile/reviews', icon: Star },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Help', href: '/help', icon: HelpCircle }
]

const merchantNavItems = [
  { name: 'Dashboard', href: '/merchant/dashboard', icon: Home },
  { name: 'Products', href: '/merchant/products', icon: Package },
  { name: 'Orders', href: '/merchant/orders', icon: Truck },
  { name: 'Chat', href: '/merchant/chat', icon: MessageSquare },
  { name: 'Profile', href: '/merchant/profile', icon: User },
  { name: 'Settings', href: '/merchant/settings', icon: Settings }
]

const adminNavItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'Users', href: '/admin/users', icon: User },
  { name: 'Merchants', href: '/admin/merchants', icon: Store },
  { name: 'Orders', href: '/admin/orders', icon: Truck },
  { name: 'Reports', href: '/admin/chat/reports', icon: MessageSquare },
  { name: 'Settings', href: '/admin/settings', icon: Settings }
]

export function MobileNavigation({ className }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, isMerchant, isAdmin, logout } = useAuth()
  const { items: cartItems } = useCart()
  const { unreadCount } = useNotifications()

  const getNavItems = () => {
    if (isAdmin) return adminNavItems
    if (isMerchant) return merchantNavItems
    return customerNavItems
  }

  const handleNavClick = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
      setIsOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const navItems = getNavItems()
  const cartItemsCount = cartItems?.length || 0

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className={cn('md:hidden', className)}>
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold">
                {isAdmin ? 'Admin Panel' : isMerchant ? 'Merchant Portal' : 'E-commerce'}
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {/* User Info */}
          {isAuthenticated && user && (
            <div className="p-4 border-b bg-muted/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                const showBadge = item.name === 'Cart' && cartItemsCount > 0
                const showNotificationBadge = item.name === 'Chat' && unreadCount > 0

                return (
                  <Button
                    key={item.name}
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start h-12',
                      isActive && 'bg-primary text-primary-foreground'
                    )}
                    onClick={() => handleNavClick(item.href)}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <span className="flex-1 text-left">{item.name}</span>
                    {showBadge && (
                      <Badge variant="destructive" className="ml-2">
                        {cartItemsCount}
                      </Badge>
                    )}
                    {showNotificationBadge && (
                      <Badge variant="destructive" className="ml-2">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                )
              })}
            </nav>

            <Separator className="my-4" />

            {/* Quick Actions */}
            <div className="p-4 space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Quick Actions
              </h3>
              
              {!isAuthenticated ? (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12"
                    onClick={() => handleNavClick('/login')}
                  >
                    <User className="h-5 w-5 mr-3" />
                    <span>Login</span>
                  </Button>
                  <Button
                    className="w-full justify-start h-12"
                    onClick={() => handleNavClick('/signup')}
                  >
                    <User className="h-5 w-5 mr-3" />
                    <span>Sign Up</span>
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12"
                    onClick={() => handleNavClick('/profile')}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    <span>Account Settings</span>
                  </Button>
                  
                  {!isMerchant && !isAdmin && (
                    <Button
                      variant="outline"
                      className="w-full justify-start h-12"
                      onClick={() => handleNavClick('/merchant/register')}
                    >
                      <Store className="h-5 w-5 mr-3" />
                      <span>Become a Merchant</span>
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 text-red-600 hover:text-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Logout</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-muted/50">
            <div className="text-xs text-muted-foreground text-center">
              <p>© 2024 E-commerce Platform</p>
              <p className="mt-1">Made for Ethiopia</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
