import { z } from 'zod'

// Auth schemas
export const requestOtpSchema = z.object({
  email: z.string().email('Valid email address is required'),
})

export const verifyOtpSchema = z.object({
  email: z.string().email('Valid email address is required'),
  code: z.string().min(6, 'OTP code must be 6 digits').max(6, 'OTP code must be 6 digits'),
})

// Address schemas
export const addressSchema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  region: z.string().optional(),
  country: z.string().optional().default('ET'),
  postalCode: z.string().optional(),
  plusCode: z.string().optional(),
  landmark: z.string().optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
})

export type AddressFormData = z.infer<typeof addressSchema>

// Product schemas
export const skuSchema = z.object({
  name: z.string().min(1, 'SKU name is required'),
  unitType: z.enum(['PIECE', 'KG', 'LITER', 'METER']),
  unitIncrement: z.number().min(0.01, 'Unit increment must be greater than 0'),
  packageSize: z.number().optional(),
  pricePerCanonicalUnit: z.number().min(1, 'Price must be greater than 0'),
  currency: z.string().default('ETB'),
  active: z.boolean().default(true),
})

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  images: z.array(z.string()).default([]),
  skus: z.array(skuSchema).min(1, 'At least one SKU is required'),
})

// Cart schemas
export const addToCartSchema = z.object({
  skuId: z.string().min(1, 'SKU ID is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
})

// Order schemas
export const createOrderSchema = z.object({
  addressId: z.string().min(1, 'Address is required'),
  paymentProvider: z.enum(['telebirr', 'chapa', 'amole', 'cod']),
})

// Merchant schemas
export const merchantSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  legalName: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  serviceAreas: z.array(z.string()).default([]),
})

// Review schemas
export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().optional(),
  images: z.array(z.string()).default([]),
})

// Q&A schemas
export const questionSchema = z.object({
  question: z.string().min(1, 'Question is required'),
})

export const answerSchema = z.object({
  answer: z.string().min(1, 'Answer is required'),
})

// Chat schemas
export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  type: z.enum(['TEXT', 'SIGNAL']).default('TEXT'),
  attachments: z.array(z.string()).default([]),
})

// User profile schemas
export const userProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
})

// Payment schemas
export const paymentInitiateSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  provider: z.enum(['telebirr', 'chapa', 'amole', 'cod']),
})

// Search schemas
export const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  merchant: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  unitType: z.enum(['PIECE', 'KG', 'LITER', 'METER']).optional(),
  rating: z.number().min(1).max(5).optional(),
  sortBy: z.enum(['price', 'rating', 'newest', 'distance']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

// Filter schemas
export const productFiltersSchema = z.object({
  category: z.string().optional(),
  merchant: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  unitType: z.enum(['PIECE', 'KG', 'LITER', 'METER']).optional(),
  rating: z.number().min(1).max(5).optional(),
  inStock: z.boolean().optional(),
})

// File upload schemas
export const fileUploadSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, 'At least one file is required'),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
})

// Pagination schemas
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

// Location schemas
export const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  radiusKm: z.number().min(0.1).max(1000).default(10),
})

// Notification schemas
export const notificationSchema = z.object({
  type: z.enum(['order', 'message', 'payment', 'shipment', 'general']),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  data: z.any().optional(),
})

// WebSocket event schemas
export const socketMessageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(['TEXT', 'SIGNAL']).default('TEXT'),
  attachments: z.array(z.string()).default([]),
})

export const socketTypingSchema = z.object({
  conversationId: z.string().min(1),
  isTyping: z.boolean(),
})

// Form validation helpers
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
} {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      error.issues.forEach((err) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: ['Validation failed'] } }
  }
}

// Common validation rules
export const validationRules = {
  phone: z.string().regex(/^(\+251|0)?[79]\d{8}$/, 'Invalid Ethiopian phone number'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  required: (field: string) => z.string().min(1, `${field} is required`),
  optional: (field: string) => z.string().optional(),
  positiveNumber: z.number().min(0, 'Must be a positive number'),
  positiveInteger: z.number().int().min(1, 'Must be a positive integer'),
  rating: z.number().min(1).max(5),
  url: z.string().url('Invalid URL'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
}
