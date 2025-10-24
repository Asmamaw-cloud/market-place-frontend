'use client'

import { useState } from 'react'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AdvancedFiltersProps {
  onFiltersChange?: (filters: FilterState) => void
  className?: string
}

interface FilterState {
  priceRange: [number, number]
  categories: string[]
  merchants: string[]
  rating: number
  availability: 'all' | 'in-stock' | 'out-of-stock'
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'popularity'
  unitType: string[]
  features: string[]
  location: {
    radius: number
    coordinates?: [number, number]
  }
}

const initialFilters: FilterState = {
  priceRange: [0, 100000],
  categories: [],
  merchants: [],
  rating: 0,
  availability: 'all',
  sortBy: 'relevance',
  unitType: [],
  features: [],
  location: {
    radius: 10
  }
}

const categories = [
  'Electronics',
  'Clothing',
  'Food & Beverages',
  'Home & Garden',
  'Health & Beauty',
  'Sports & Outdoors',
  'Books & Media',
  'Automotive',
  'Toys & Games',
  'Office Supplies'
]

const unitTypes = [
  'PIECE',
  'KG',
  'LITER',
  'METER'
]

const features = [
  'Free Shipping',
  'Same Day Delivery',
  'Bulk Discount',
  'Eco Friendly',
  'Local Product',
  'Organic',
  'Sale',
  'New Arrival'
]

export function AdvancedFilters({ onFiltersChange, className }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    
    // Count active filters
    let count = 0
    if (updatedFilters.priceRange[0] > 0 || updatedFilters.priceRange[1] < 100000) count++
    if (updatedFilters.categories.length > 0) count++
    if (updatedFilters.merchants.length > 0) count++
    if (updatedFilters.rating > 0) count++
    if (updatedFilters.availability !== 'all') count++
    if (updatedFilters.unitType.length > 0) count++
    if (updatedFilters.features.length > 0) count++
    
    setActiveFiltersCount(count)
    onFiltersChange?.(updatedFilters)
  }

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    updateFilters({ categories: newCategories })
  }

  const handleUnitTypeToggle = (unitType: string) => {
    const newUnitTypes = filters.unitType.includes(unitType)
      ? filters.unitType.filter(u => u !== unitType)
      : [...filters.unitType, unitType]
    updateFilters({ unitType: newUnitTypes })
  }

  const handleFeatureToggle = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature]
    updateFilters({ features: newFeatures })
  }

  const clearAllFilters = () => {
    setFilters(initialFilters)
    setActiveFiltersCount(0)
    onFiltersChange?.(initialFilters)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={cn('space-y-6', !isExpanded && 'hidden')}>
        {/* Price Range */}
        <div>
          <Label className="text-base font-medium">Price Range (ETB)</Label>
          <div className="space-y-4 mt-2">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
              max={100000}
              step={1000}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>ETB {filters.priceRange[0].toLocaleString()}</span>
              <span>ETB {filters.priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <Label className="text-base font-medium">Categories</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <Label
                  htmlFor={category}
                  className="text-sm font-normal cursor-pointer"
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Unit Types */}
        <div>
          <Label className="text-base font-medium">Unit Types</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {unitTypes.map((unitType) => (
              <Button
                key={unitType}
                variant={filters.unitType.includes(unitType) ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleUnitTypeToggle(unitType)}
              >
                {unitType}
              </Button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <Label className="text-base font-medium">Minimum Rating</Label>
          <div className="space-y-4 mt-2">
            <Slider
              value={[filters.rating]}
              onValueChange={(value) => updateFilters({ rating: value[0] })}
              max={5}
              step={0.5}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Any rating</span>
              <span>{filters.rating} ⭐ and above</span>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div>
          <Label className="text-base font-medium">Availability</Label>
          <RadioGroup
            value={filters.availability}
            onValueChange={(value) => updateFilters({ availability: value as any })}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="text-sm font-normal cursor-pointer">
                All Products
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="in-stock" id="in-stock" />
              <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
                In Stock Only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="out-of-stock" id="out-of-stock" />
              <Label htmlFor="out-of-stock" className="text-sm font-normal cursor-pointer">
                Out of Stock
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Features */}
        <div>
          <Label className="text-base font-medium">Features</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={feature}
                  checked={filters.features.includes(feature)}
                  onCheckedChange={() => handleFeatureToggle(feature)}
                />
                <Label
                  htmlFor={feature}
                  className="text-sm font-normal cursor-pointer"
                >
                  {feature}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <Label className="text-base font-medium">Sort By</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilters({ sortBy: value as any })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="popularity">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location Radius */}
        <div>
          <Label className="text-base font-medium">Delivery Radius (km)</Label>
          <div className="space-y-4 mt-2">
            <Slider
              value={[filters.location.radius]}
              onValueChange={(value) => updateFilters({ 
                location: { ...filters.location, radius: value[0] }
              })}
              max={50}
              step={5}
              className="w-full"
            />
            <div className="text-center text-sm text-muted-foreground">
              Within {filters.location.radius} km
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
