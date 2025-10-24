'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from './navigation'
import { Footer } from './footer'
import { Sidebar } from './sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  
  const isMerchantRoute = pathname.startsWith('/merchant')
  const isAdminRoute = pathname.startsWith('/admin')
  const isAuthRoute = pathname.startsWith('/login')
  
  // Don't show navigation for auth pages
  if (isAuthRoute) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex flex-1">
        {/* Sidebar for merchant and admin routes */}
        {(isMerchantRoute || isAdminRoute) && <Sidebar />}
        
        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
      
      {/* Footer only for customer routes */}
      {!isMerchantRoute && !isAdminRoute && <Footer />}
    </div>
  )
}
