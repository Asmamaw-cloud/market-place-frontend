'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  MessageCircle, 
  Users, 
  Store, 
  BarChart3,
  Settings,
  FileText,
  Shield
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const { isMerchant, isAdmin } = useAuth()
  
  const isMerchantRoute = pathname.startsWith('/merchant')
  const isAdminRoute = pathname.startsWith('/admin')
  
  // Only show sidebar if user has the appropriate role
  if (isMerchantRoute && !isMerchant) {
    return null
  }
  
  if (isAdminRoute && !isAdmin) {
    return null
  }

  const merchantNavItems = [
    { name: 'Dashboard', href: '/merchant/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/merchant/products', icon: Package },
    { name: 'Orders', href: '/merchant/orders', icon: ShoppingBag },
    { name: 'Chat', href: '/merchant/chat', icon: MessageCircle },
    { name: 'Analytics', href: '/merchant/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/merchant/settings', icon: Settings },
  ]

  const adminNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Merchants', href: '/admin/merchants', icon: Store },
    { name: 'Reports', href: '/admin/chat/reports', icon: FileText },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'System', href: '/admin/system', icon: Shield },
  ]

  const navItems = isMerchantRoute ? merchantNavItems : adminNavItems

  return (
    <aside className="w-64 bg-muted/50 border-r min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="h-8 w-8 rounded bg-primary"></div>
          <span className="text-xl font-bold">
            {isMerchantRoute ? 'Merchant' : 'Admin'} Panel
          </span>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
