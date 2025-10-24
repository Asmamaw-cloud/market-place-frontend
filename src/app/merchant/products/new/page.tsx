'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Package
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProducts } from '@/hooks/useProducts'
import { productSchema } from '@/lib/validators'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const categories = [
  'electronics',
  'clothing',
  'food',
  'books',
  'home',
  'beauty',
  'sports',
  'automotive',
  'other'
]


export default function CreateProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const router = useRouter()
  const { isAuthenticated, isMerchant } = useAuth()
  const { createProduct } = useProducts()

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue
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
  }

  const removeSku = (index: number) => {
    remove(index)
  }

  const watchedName = watch('name')

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newPreviews: string[] = []
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string)
        if (newPreviews.length === files.length) {
          setImagePreviews(prev => [...prev, ...newPreviews])
          setValue('images', [...imagePreviews, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImagePreviews(newPreviews)
    setValue('images', newPreviews)
  }


  const onSubmit = async (data: any) => {
    if (!isAuthenticated || !isMerchant) {
      router.push('/login')
      return
    }

    setIsSubmitting(true)
    try {
      // Auto-generate slug if not provided
      if (!data.slug && data.name) {
        data.slug = generateSlug(data.name)
      }

      await createProduct(data)
      router.push('/merchant/products')
    } catch (error) {
      console.error('Failed to create product:', error)
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
              You need to be a merchant to create products
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
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/merchant/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Create New Product</h1>
            <p className="text-muted-foreground">
              Add a new product to your store
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter product name"
                      {...register('name')}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      placeholder="product-url-slug"
                      {...register('slug')}
                    />
                    <p className="text-xs text-muted-foreground">
                      Auto-generated from name if left empty
                    </p>
                    {errors.slug && (
                      <p className="text-sm text-destructive">{errors.slug.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product..."
                    rows={4}
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => setValue('categoryId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-sm text-destructive">{errors.categoryId.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Upload Images</Label>
                  <div className="border-2 border-dashed border-muted-foreground rounded-lg p-6">
                    <input
                      type="file"
                      id="images"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Label htmlFor="images" className="cursor-pointer">
                      <div className="text-center">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-lg font-medium mb-2">
                          Click to upload images
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PNG, JPG up to 10MB each
                        </p>
                      </div>
                    </Label>
                  </div>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Images</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SKUs */}
            <Card>
              <CardHeader>
                <CardTitle>Product Variants (SKUs)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Variant {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSku(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`skus.${index}.name`}>SKU Name *</Label>
                        <Input
                          {...register(`skus.${index}.name`)}
                          placeholder="e.g., Small, Medium, Large"
                        />
                        {errors.skus?.[index]?.name && (
                          <p className="text-sm text-destructive">{errors.skus[index]?.name?.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`skus.${index}.unitType`}>Unit Type *</Label>
                        <Select
                          value={field.unitType}
                          onValueChange={(value: 'PIECE' | 'KG' | 'LITER' | 'METER') => setValue(`skus.${index}.unitType`, value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                        <Label htmlFor={`skus.${index}.unitIncrement`}>Unit Increment *</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          placeholder="1"
                          {...register(`skus.${index}.unitIncrement`, { valueAsNumber: true })}
                        />
                        {errors.skus?.[index]?.unitIncrement && (
                          <p className="text-sm text-destructive">{errors.skus[index]?.unitIncrement?.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`skus.${index}.packageSize`}>Package Size</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          placeholder="1"
                          {...register(`skus.${index}.packageSize`, { valueAsNumber: true })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`skus.${index}.pricePerCanonicalUnit`}>Price (ETB) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...register(`skus.${index}.pricePerCanonicalUnit`, { valueAsNumber: true })}
                        />
                        {errors.skus?.[index]?.pricePerCanonicalUnit && (
                          <p className="text-sm text-destructive">{errors.skus[index]?.pricePerCanonicalUnit?.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`skus.${index}.currency`}>Currency</Label>
                        <Select
                          value={field.currency}
                          onValueChange={(value) => setValue(`skus.${index}.currency`, value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ETB">ETB</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`skus.${index}.active`}
                        checked={field.active}
                        onChange={(e) => setValue(`skus.${index}.active`, e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor={`skus.${index}.active`} className="text-sm">
                        Active (available for purchase)
                      </Label>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addSku}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Variant
                </Button>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/merchant/products')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Product...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Product
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}
