'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Star, 
  ArrowLeft,
  Edit,
  Trash2,
  Image as ImageIcon,
  ThumbsUp,
  MessageCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, getRatingStars } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

interface Review {
  id: string
  productId: string
  product: {
    id: string
    name: string
    images: string[]
  }
  rating: number
  comment: string
  images: string[]
  createdAt: string
  helpfulCount: number
  isHelpful?: boolean
}

// Mock data - in a real app, this would come from the API
const mockReviews: Review[] = [
  {
    id: '1',
    productId: 'prod1',
    product: {
      id: 'prod1',
      name: 'Fresh Organic Tomatoes',
      images: ['/placeholder-tomatoes.jpg']
    },
    rating: 5,
    comment: 'Excellent quality! Fresh and delicious. Will definitely order again.',
    images: ['/review1.jpg'],
    createdAt: '2024-01-15T10:00:00Z',
    helpfulCount: 12,
    isHelpful: false
  },
  {
    id: '2',
    productId: 'prod2',
    product: {
      id: 'prod2',
      name: 'Premium Coffee Beans',
      images: ['/placeholder-coffee.jpg']
    },
    rating: 4,
    comment: 'Good coffee, but the packaging could be better. The taste is great though.',
    images: [],
    createdAt: '2024-01-10T14:30:00Z',
    helpfulCount: 8,
    isHelpful: true
  },
  {
    id: '3',
    productId: 'prod3',
    product: {
      id: 'prod3',
      name: 'Artisan Bread',
      images: ['/placeholder-bread.jpg']
    },
    rating: 5,
    comment: 'Amazing bread! Freshly baked and delivered warm. Perfect for breakfast.',
    images: ['/review3-1.jpg', '/review3-2.jpg'],
    createdAt: '2024-01-08T09:15:00Z',
    helpfulCount: 15,
    isHelpful: false
  }
]

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all')

  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      // Simulate API call
      setTimeout(() => {
        setReviews(mockReviews)
        setIsLoading(false)
      }, 1000)
    }
  }, [isAuthenticated])

  const handleHelpfulToggle = (reviewId: string) => {
    setReviews(prev => prev.map(review => {
      if (review.id === reviewId) {
        const newIsHelpful = !review.isHelpful
        return {
          ...review,
          isHelpful: newIsHelpful,
          helpfulCount: newIsHelpful 
            ? review.helpfulCount + 1 
            : review.helpfulCount - 1
        }
      }
      return review
    }))
  }

  const handleDeleteReview = (reviewId: string) => {
    setReviews(prev => prev.filter(review => review.id !== reviewId))
  }

  const filteredReviews = reviews.filter(review => 
    filter === 'all' || review.rating.toString() === filter
  )

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <Star className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Please Login</h1>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to view your reviews
            </p>
            <Link href="/login">
              <Button>Login to Continue</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  const averageRating = getAverageRating()
  const ratingDistribution = getRatingDistribution()

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/profile">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">My Reviews</h1>
            <p className="text-muted-foreground">
              Manage your product reviews and ratings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Reviews List */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">Filter by rating:</span>
                  <div className="flex space-x-2">
                    {[
                      { value: 'all', label: 'All', count: reviews.length },
                      { value: '5', label: '5 Stars', count: ratingDistribution[5] },
                      { value: '4', label: '4 Stars', count: ratingDistribution[4] },
                      { value: '3', label: '3 Stars', count: ratingDistribution[3] },
                      { value: '2', label: '2 Stars', count: ratingDistribution[2] },
                      { value: '1', label: '1 Star', count: ratingDistribution[1] },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={filter === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(option.value as any)}
                      >
                        {option.label} ({option.count})
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                          <Skeleton className="w-16 h-16 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/4" />
                          </div>
                        </div>
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <Star className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Reviews Found</h2>
                <p className="text-muted-foreground mb-6">
                  {filter === 'all' 
                    ? 'You haven\'t written any reviews yet'
                    : `No ${filter}-star reviews found`
                  }
                </p>
                <Link href="/products">
                  <Button>
                    Browse Products
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Product Info */}
                        <div className="flex items-start space-x-4">
                          <div className="relative w-16 h-16 flex-shrink-0">
                            {review.product.images && review.product.images.length > 0 ? (
                              <Image
                                src={review.product.images[0]}
                                alt={review.product.name}
                                fill
                                className="object-cover rounded-lg"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full bg-muted rounded-lg">
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <Link href={`/products/${review.product.id}`}>
                              <h3 className="font-medium hover:text-primary transition-colors">
                                {review.product.name}
                              </h3>
                            </Link>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center space-x-1">
                                {getRatingStars(review.rating).map((star, index) => (
                                  <span key={index} className="text-yellow-400">{star}</span>
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteReview(review.id)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteReview(review.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Review Content */}
                        <div className="space-y-3">
                          <p className="text-sm">{review.comment}</p>
                          
                          {/* Review Images */}
                          {review.images && review.images.length > 0 && (
                            <div className="flex space-x-2">
                              {review.images.map((image, index) => (
                                <div key={index} className="relative w-20 h-20">
                                  <Image
                                    src={image}
                                    alt={`Review image ${index + 1}`}
                                    fill
                                    className="object-cover rounded-lg"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Helpful Button */}
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleHelpfulToggle(review.id)}
                              className={review.isHelpful ? 'bg-green-50 border-green-200' : ''}
                            >
                              <ThumbsUp className={`h-3 w-3 mr-1 ${review.isHelpful ? 'text-green-600' : ''}`} />
                              Helpful ({review.helpfulCount})
                            </Button>
                            
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Review Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Review Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    {getRatingStars(averageRating).map((star, index) => (
                      <span key={index} className="text-yellow-400">{star}</span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {reviews.length} reviews written
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Rating Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm w-8">{rating}★</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ 
                          width: `${reviews.length > 0 ? (ratingDistribution[rating as keyof typeof ratingDistribution] / reviews.length) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">
                      {ratingDistribution[rating as keyof typeof ratingDistribution]}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Review Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Review Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>• Be specific about your experience</p>
                <p>• Include photos when helpful</p>
                <p>• Mention delivery and packaging</p>
                <p>• Be honest and constructive</p>
                <p>• Help other customers decide</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
