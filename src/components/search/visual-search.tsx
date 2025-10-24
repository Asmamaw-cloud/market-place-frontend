'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, Search, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface VisualSearchProps {
  onSearchResults?: (results: any[]) => void
  className?: string
}

export function VisualSearch({ onSearchResults, className }: VisualSearchProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleCameraCapture = () => {
    // This would integrate with device camera
    fileInputRef.current?.click()
  }

  const handleVisualSearch = async () => {
    if (!selectedImage) return

    setIsSearching(true)
    try {
      // This would call the visual search API
      const formData = new FormData()
      formData.append('image', selectedImage)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock results
      const mockResults = [
        {
          id: '1',
          name: 'Similar Product 1',
          image: '/placeholder-product.jpg',
          price: 15000,
          similarity: 0.95,
          merchant: 'Test Merchant'
        },
        {
          id: '2',
          name: 'Similar Product 2',
          image: '/placeholder-product.jpg',
          price: 12000,
          similarity: 0.87,
          merchant: 'Test Merchant 2'
        },
        {
          id: '3',
          name: 'Similar Product 3',
          image: '/placeholder-product.jpg',
          price: 18000,
          similarity: 0.82,
          merchant: 'Test Merchant 3'
        }
      ]
      
      setSearchResults(mockResults)
      onSearchResults?.(mockResults)
    } catch (error) {
      console.error('Visual search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleTextSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      // This would call the text search API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock results
      const mockResults = [
        {
          id: '1',
          name: `Search result for "${searchQuery}"`,
          image: '/placeholder-product.jpg',
          price: 15000,
          merchant: 'Test Merchant'
        }
      ]
      
      setSearchResults(mockResults)
      onSearchResults?.(mockResults)
    } catch (error) {
      console.error('Text search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSelectedImage(null)
    setPreviewUrl(null)
    setSearchQuery('')
    setSearchResults([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Visual Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Image Upload Area */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-xs max-h-48 mx-auto rounded-lg"
                  />
                  <div className="flex justify-center space-x-2">
                    <Button onClick={handleVisualSearch} disabled={isSearching}>
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Search Similar Products
                    </Button>
                    <Button variant="outline" onClick={clearSearch}>
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium">Upload an image to search</p>
                    <p className="text-sm text-muted-foreground">
                      Take a photo or upload an image to find similar products
                    </p>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <Button onClick={handleCameraCapture}>
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Text Search Alternative */}
            <div className="border-t pt-4">
              <Label htmlFor="textSearch">Or search with text</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  id="textSearch"
                  placeholder="Describe what you're looking for..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTextSearch()
                    }
                  }}
                />
                <Button onClick={handleTextSearch} disabled={isSearching || !searchQuery.trim()}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((result, index) => (
                <div key={result.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <img
                      src={result.image}
                      alt={result.name}
                      className="w-full h-32 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-medium line-clamp-2">{result.name}</h4>
                      <p className="text-sm text-muted-foreground">{result.merchant}</p>
                      <p className="font-medium">ETB {(result.price / 100).toFixed(2)}</p>
                      {result.similarity && (
                        <Badge variant="secondary" className="mt-2">
                          {(result.similarity * 100).toFixed(0)}% match
                        </Badge>
                      )}
                    </div>
                    <Button className="w-full" size="sm">
                      View Product
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Search Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">For Best Results:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use clear, well-lit photos</li>
                <li>• Focus on the main product</li>
                <li>• Avoid blurry or dark images</li>
                <li>• Include multiple angles if possible</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Supported Formats:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• JPEG, PNG, WebP images</li>
                <li>• Maximum file size: 10MB</li>
                <li>• Recommended resolution: 800x600+</li>
                <li>• Works with product photos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
