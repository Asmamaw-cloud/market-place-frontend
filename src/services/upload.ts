import api from './api'

export interface UploadResponse {
  url: string
  filename: string
  size: number
  mimeType: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export const uploadService = {
  // Upload single file
  async uploadFile(
    file: File, 
    type: 'product' | 'merchant' | 'kyc' | 'chat' | 'review',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await api.post('/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total)
          })
        }
      }
    })

    return response.data
  },

  // Upload multiple files
  async uploadFiles(
    files: File[], 
    type: 'product' | 'merchant' | 'kyc' | 'chat' | 'review',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse[]> {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    formData.append('type', type)

    const response = await api.post('/storage/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total)
          })
        }
      }
    })

    return response.data
  },

  // Get pre-signed URL for upload
  async getPresignedUrl(filename: string, type: string): Promise<{ url: string; fields: any }> {
    const response = await api.post('/storage/presigned-url', { filename, type })
    return response.data
  },

  // Delete file
  async deleteFile(url: string): Promise<void> {
    await api.delete('/storage/delete', { data: { url } })
  },

  // Compress image
  async compressImage(file: File, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        const maxWidth = 1920
        const maxHeight = 1080
        let { width, height } = img

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          'image/jpeg',
          quality
        )
      }

      img.src = URL.createObjectURL(file)
    })
  },

  // Validate file
  validateFile(file: File, type: 'image' | 'document' | 'any'): { valid: boolean; error?: string } {
    const maxSize = type === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024 // 10MB for images, 50MB for documents
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${maxSize / (1024 * 1024)}MB`
      }
    }

    if (type === 'image' && !allowedImageTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only JPEG, PNG, WebP, and GIF images are allowed'
      }
    }

    if (type === 'document' && !allowedDocumentTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only PDF and Word documents are allowed'
      }
    }

    return { valid: true }
  }
}
