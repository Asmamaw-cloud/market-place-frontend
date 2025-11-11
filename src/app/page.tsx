'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Truck, Shield, Star } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
  const { isAuthenticated, isMerchant, isAdmin } = useAuth()
  const router = useRouter()

  // Redirect authenticated merchants and admins to their dashboards
  // Regular users stay on the home page to browse products
  useEffect(() => {
    if (isAuthenticated) {
      if (isMerchant) {
        router.push('/merchant/dashboard')
      } else if (isAdmin) {
        router.push('/admin/dashboard')
      }
      // Regular authenticated users can browse the home page and products
    }
  }, [isAuthenticated, isMerchant, isAdmin, router])

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto text-center px-6">
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-6">
                Ethiopia's Premier Marketplace Platform
              </h1>
              <p className="text-base sm:text-xl text-muted-foreground mb-8">
                Shop with local merchants, pay with Telebirr, Chapa, or Amole. 
                Unit-aware catalog with KG, Liter, and Meter measurements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                  <Button size="lg" className="w-full sm:w-auto">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Start Shopping
                  </Button>
                </Link>
                <Link href="/merchants">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Find Merchants
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-14">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Why Choose Us?</h2>
              <p className="text-base sm:text-xl text-muted-foreground">
                Built specifically for Ethiopia with local payment methods and measurements
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Local Payments</CardTitle>
                  <CardDescription>
                    Pay with Telebirr, Chapa, Amole, or Cash on Delivery
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Unit-Aware Catalog</CardTitle>
                  <CardDescription>
                    Shop by KG, Liter, Meter, or Piece with proper measurements
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Escrow Protection</CardTitle>
                  <CardDescription>
                    Your money is protected until delivery is confirmed
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Local Merchants</CardTitle>
                  <CardDescription>
                    Support local businesses and find nearby merchants
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-muted py-20">
          <div className="container mx-auto">
            <div className="max-w-2xl mx-auto text-center px-6">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
              <p className="text-base sm:text-xl text-muted-foreground mb-8">
                Join thousands of customers who trust Ethiopia E-commerce for their shopping needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started
                  </Button>
                </Link>
                <Link href="/merchants">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Become a Merchant
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}