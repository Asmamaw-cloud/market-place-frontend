'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Navigation } from './navigation'
import { Footer } from './footer'
import { Sidebar } from './sidebar'
import { useAuth } from '@/hooks/useAuth'
import { useMerchants } from '@/hooks/useMerchants'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isMerchant, isAdmin } = useAuth()
  const { currentMerchant, loadMerchantById } = useMerchants()
  
  const isMerchantRoute = pathname.startsWith('/merchant')
  const isAdminRoute = pathname.startsWith('/admin')
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/register')
  const isCustomerRoute = !isMerchantRoute && !isAdminRoute && !isAuthRoute
  
  // Fetch merchant data when merchant logs in
  useEffect(() => {
    if (isAuthenticated && isMerchant && !currentMerchant) {
      console.log('Merchant logged in, fetching merchant data...')
      loadMerchantById('current').catch(error => {
        console.error('Failed to load merchant data:', error)
      })
    }
  }, [isAuthenticated, isMerchant, currentMerchant, loadMerchantById])
  
  // Redirect merchants away from customer routes to their dashboard
  useEffect(() => {
    if (isAuthenticated && isMerchant && isCustomerRoute && !pathname.startsWith('/products') && !pathname.startsWith('/merchants')) {
      router.push('/merchant/dashboard')
    }
  }, [isAuthenticated, isMerchant, isCustomerRoute, pathname, router])
  
  // Determine if sidebar should be shown based on role
  const showSidebar = (isMerchantRoute && isMerchant) || (isAdminRoute && isAdmin)
  
  // Don't show navigation for auth pages
  if (isAuthRoute) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex flex-1 ">
        {/* Sidebar for merchant and admin routes - only if user has appropriate role */}
        {showSidebar && <Sidebar />}
        
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
