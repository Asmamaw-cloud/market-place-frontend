'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Plus,
  Minus
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProducts } from '@/hooks/useProducts'
import { PriceDisplay } from '@/components/ui/price-display'
import { UnitDisplay } from '@/components/ui/unit-display'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [activeTab, setActiveTab] = useState('overview')
  const [isDeleting, setIsDeleting] = useState(false)

  const { isAuthenticated, isMerchant } = useAuth()
  const { products, isLoading, error, fetchProducts, deleteProduct } = useProducts()

  const product = products?.find(p => p.id === productId)

  useEffect(() => {
    if (isAuthenticated && isMerchant && !products) {
      fetchProducts({ merchant: 'current' })
    }
  }, [isAuthenticated, isMerchant, products, fetchProducts])

  const handleDeleteProduct = async () => {
    if (!product) return

    if (window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      setIsDeleting(true)
      try {
        await deleteProduct(product.id)
        router.push('/merchant/products')
      } catch (error) {
        console.error('Failed to delete product:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const toggleSkuStatus = (skuId: string) => {
    // In a real app, this would call an API to toggle SKU status
    console.log('Toggle SKU status:', skuId)
  }

  if (!isAuthenticated || !isMerchant) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You need to be a merchant to access this page
            </p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Product Not Found</h3>
                <p className="text-muted-foreground mb-4">
                  {error || 'The product you\'re looking for doesn\'t exist or you don\'t have permission to view it.'}
                </p>
                <Button asChild>
                  <Link href="/merchant/products">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Products
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/merchant/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground">
                {product.description || 'No description provided'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/merchant/products/${product.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteProduct}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          </div>
        </div>

        {/* Product Details */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skus">SKUs & Pricing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                  {product.images && product.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {product.images.map((image, index) => (
                        <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Product Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Name</h4>
                    <p className="text-lg">{product.name}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Slug</h4>
                    <p className="font-mono text-sm">{product.slug}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Category</h4>
                    <Badge variant="outline">{product.categoryId || 'Uncategorized'}</Badge>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Description</h4>
                    <p className="text-sm">{product.description || 'No description provided'}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                    <Badge variant={product.skus?.some(sku => sku.active) ? "default" : "secondary"}>
                      {product.skus?.some(sku => sku.active) ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SKUs Tab */}
          <TabsContent value="skus" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>SKUs & Pricing</CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add SKU
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {product.skus && product.skus.length > 0 ? (
                  <div className="space-y-4">
                    {product.skus.map((sku) => (
                      <div
                        key={sku.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <h4 className="font-medium">{sku.name || 'Unnamed SKU'}</h4>
                            <Badge variant={sku.active ? "default" : "secondary"}>
                              {sku.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-6 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <UnitDisplay 
                                quantity={sku.unitIncrement} 
                                unitType={sku.unitType} 
                              />
                            </div>
                            <div className="flex items-center space-x-1">
                              <PriceDisplay amount={sku.pricePerCanonicalUnit} />
                            </div>
                            <div>
                              Package: {sku.packageSize}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSkuStatus(sku.id)}
                          >
                            {sku.active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No SKUs</h3>
                    <p className="text-muted-foreground mb-4">
                      This product doesn't have any SKUs yet
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First SKU
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Orders</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">0 ETB</p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Analytics Coming Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Detailed analytics and insights for this product will be available soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

