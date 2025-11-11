'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft,
  Upload,
  Trash2,
  Plus,
  Save,
  Loader2,
  AlertCircle,
  Package,
  X
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProducts } from '@/hooks/useProducts'
import { productSchema } from '@/lib/validators'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { UploadButton } from '@/components/uploadthing'
import { categoriesApi } from '@/lib/api'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [skuIdMap, setSkuIdMap] = useState<Map<number, string>>(new Map()) // Maps field index to SKU ID

  const { isAuthenticated, isMerchant } = useAuth()
  const { products, isLoading, error, fetchProducts, updateProduct } = useProducts()

  const product = products?.find(p => p.id === productId)

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
    reset
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      categoryId: '',
      images: [],
      skus: [
        {
          name: '',
          unitType: 'PIECE',
          unitIncrement: 1,
          packageSize: 1,
          pricePerCanonicalUnit: 0,
          currency: 'ETB',
          active: true
        }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skus'
  })

  const watchedName = watch('name')

  useEffect(() => {
    if (isAuthenticated && isMerchant && !products) {
      fetchProducts({ merchant: 'current' })
    }
  }, [isAuthenticated, isMerchant, products, fetchProducts])

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true)
      try {
        const response = await categoriesApi.list()
        setCategories(response.data.data || [])
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    if (isAuthenticated && isMerchant) {
      fetchCategories()
    }
  }, [isAuthenticated, isMerchant])

  useEffect(() => {
    if (product) {
      // Map SKUs properly, ensuring all fields are included
      const mappedSkus: Array<{
        name: string;
        unitType: 'PIECE' | 'KG' | 'LITER' | 'METER';
        unitIncrement: number;
        packageSize: number;
        pricePerCanonicalUnit: number;
        currency: string;
        active: boolean;
      }> = product.skus?.length 
        ? product.skus.map(sku => ({
            name: sku.name || '',
            unitType: (sku.unitType as 'PIECE' | 'KG' | 'LITER' | 'METER') || 'PIECE',
            unitIncrement: sku.unitIncrement || 1,
            packageSize: sku.packageSize ?? 1,
            pricePerCanonicalUnit: sku.pricePerCanonicalUnit || 0,
            currency: sku.currency || 'ETB',
            active: sku.active ?? true
          }))
        : [
          {
            name: '',
            unitType: 'PIECE' as const,
            unitIncrement: 1,
            packageSize: 1,
            pricePerCanonicalUnit: 0,
            currency: 'ETB',
            active: true
          }
        ]

      // Store SKU ID mapping for later use in submission
      const idMap = new Map<number, string>()
      if (product.skus?.length) {
        product.skus.forEach((sku, index) => {
          idMap.set(index, sku.id)
        })
      }
      setSkuIdMap(idMap)

      reset({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        categoryId: product.categoryId || '',
        images: product.images || [],
        skus: mappedSkus
      })
      setImageUrls(product.images || [])
    }
  }, [product, reset])

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const addSku = () => {
    append({
      name: '',
      unitType: 'PIECE',
      unitIncrement: 1,
      packageSize: 1,
      pricePerCanonicalUnit: 0,
      currency: 'ETB',
      active: true
    })
    // New SKUs don't have IDs (will be created on backend)
  }

  const removeSku = (index: number) => {
    remove(index)
  }

  const handleImageUpload = (res: any[] | undefined) => {
    if (res && res.length > 0) {
      const newUrls = res.map(file => file.url)
      const updatedUrls = [...imageUrls, ...newUrls]
      setImageUrls(updatedUrls)
      setValue('images', updatedUrls)
    }
  }

  const removeImage = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index)
    setImageUrls(newUrls)
    setValue('images', newUrls)
  }

  const onSubmit = async (data: any) => {
    if (!isAuthenticated || !isMerchant || !product) {
      router.push('/login')
      return
    }

    setIsSubmitting(true)
    try {
      // Auto-generate slug if not provided
      if (!data.slug && data.name) {
        data.slug = generateSlug(data.name)
      }

      // Add SKU IDs to the submission data for update tracking
      if (data.skus && Array.isArray(data.skus)) {
        data.skus = data.skus.map((sku: any, index: number) => {
          const skuId = skuIdMap.get(index)
          return {
            ...sku,
            ...(skuId ? { id: skuId } : {}) // Include ID if it exists (existing SKU)
          }
        })
      }

      console.log('Submitting product update with data:', {
        productId: product.id,
        data: {
          ...data,
          skus: data.skus?.map((sku: any, index: number) => ({
            index,
            id: sku.id,
            name: sku.name,
            unitType: sku.unitType,
            pricePerCanonicalUnit: sku.pricePerCanonicalUnit,
            currency: sku.currency
          }))
        }
      })
      
      await updateProduct(product.id, data)
      router.push(`/merchant/products/${product.id}`)
    } catch (error: any) {
      console.error('Failed to update product:', error)
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      })
      // You might want to show a user-friendly error message here
      alert(`Failed to update product: ${error?.response?.data?.message || error?.message || 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated || !isMerchant) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You need to be a merchant to edit products
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
                  {error || 'The product you\'re looking for doesn\'t exist or you don\'t have permission to edit it.'}
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
              <Link href={`/merchant/products/${product.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit Product</h1>
              <p className="text-muted-foreground">
                Update your product information and pricing
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    {...register('slug')}
                    placeholder="Auto-generated from name"
                  />
                  {errors.slug && (
                    <p className="text-sm text-destructive">{errors.slug.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe your product"
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select 
                  value={watch('categoryId') || ''} 
                  onValueChange={(value) => setValue('categoryId', value)}
                  disabled={isLoadingCategories}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-sm text-destructive">{errors.categoryId.message}</p>
                )}
                {isLoadingCategories && (
                  <p className="text-xs text-muted-foreground">Loading categories...</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Images</Label>
                <div className="border-2 border-dashed border-muted-foreground rounded-lg p-6">
                  <UploadButton
                    endpoint="productImages"
                    onClientUploadComplete={handleImageUpload}
                    onUploadError={(error: Error) => {
                      console.error('Upload error:', error)
                      alert('Failed to upload images. Please try again.')
                    }}
                    appearance={{
                      button: "w-full text-center",
                      allowedContent: "text-sm text-muted-foreground"
                    }}
                  />
                </div>
              </div>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <img
                          src={url}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SKUs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>SKUs & Pricing</CardTitle>
                <Button type="button" onClick={addSku} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add SKU
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">SKU {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSku(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`skus.${index}.name`}>SKU Name</Label>
                      <Input
                        {...register(`skus.${index}.name`)}
                        placeholder="e.g., Small, Medium, Large"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`skus.${index}.unitType`}>Unit Type</Label>
                      <Select
                        value={watch(`skus.${index}.unitType`) || 'PIECE'}
                        onValueChange={(value: 'PIECE' | 'KG' | 'LITER' | 'METER') => setValue(`skus.${index}.unitType`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PIECE">Piece</SelectItem>
                          <SelectItem value="KG">Kilogram (KG)</SelectItem>
                          <SelectItem value="LITER">Liter (L)</SelectItem>
                          <SelectItem value="METER">Meter (M)</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.skus?.[index]?.unitType && (
                        <p className="text-sm text-destructive">{errors.skus[index]?.unitType?.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`skus.${index}.unitIncrement`}>Unit Increment</Label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        {...register(`skus.${index}.unitIncrement`, { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`skus.${index}.packageSize`}>Package Size</Label>
                      <Input
                        type="number"
                        min="1"
                        {...register(`skus.${index}.packageSize`, { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`skus.${index}.pricePerCanonicalUnit`}>Price (ETB)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...register(`skus.${index}.pricePerCanonicalUnit`, { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`skus.${index}.currency`}>Currency</Label>
                      <Select
                        value={watch(`skus.${index}.currency`) || 'ETB'}
                        onValueChange={(value) => setValue(`skus.${index}.currency`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ETB">ETB</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href={`/merchant/products/${product.id}`}>
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Update Product
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
