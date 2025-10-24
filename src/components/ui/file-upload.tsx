'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  File, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Eye,
  Download
} from 'lucide-react'
import { uploadService } from '@/services/upload'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  type: 'product' | 'merchant' | 'kyc' | 'chat' | 'review'
  multiple?: boolean
  maxFiles?: number
  maxSize?: number
  acceptedTypes?: string[]
  onUpload: (files: { url: string; filename: string; size: number; mimeType: string }[]) => void
  onError?: (error: string) => void
  className?: string
  disabled?: boolean
  existingFiles?: { url: string; filename: string; size: number; mimeType: string }[]
  onRemoveFile?: (index: number) => void
}

interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
  result?: { url: string; filename: string; size: number; mimeType: string }
}

export function FileUpload({
  type,
  multiple = false,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*'],
  onUpload,
  onError,
  className,
  disabled = false,
  existingFiles = [],
  onRemoveFile
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files)
    
    // Validate files
    for (const file of fileArray) {
      const validation = uploadService.validateFile(file, 'image')
      if (!validation.valid) {
        onError?.(validation.error || 'Invalid file')
        return
      }
    }

    // Check max files limit
    if (existingFiles.length + fileArray.length > maxFiles) {
      onError?.(`Maximum ${maxFiles} files allowed`)
      return
    }

    // Add files to uploading state
    const newUploadingFiles: UploadingFile[] = fileArray.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }))

    setUploadingFiles(prev => [...prev, ...newUploadingFiles])

    // Upload files
    try {
      const results = await uploadService.uploadFiles(
        fileArray,
        type,
        (progress) => {
          setUploadingFiles(prev => 
            prev.map(uploadingFile => 
              uploadingFile.file === fileArray[0] 
                ? { ...uploadingFile, progress: progress.percentage }
                : uploadingFile
            )
          )
        }
      )

      // Update uploading files with results
      setUploadingFiles(prev => 
        prev.map((uploadingFile, index) => {
          const result = results[index]
          if (result) {
            return {
              ...uploadingFile,
              status: 'success',
              progress: 100,
              result
            }
          }
          return uploadingFile
        })
      )

      // Call onUpload with all successful uploads
      const successfulUploads = results.filter(Boolean)
      if (successfulUploads.length > 0) {
        onUpload(successfulUploads)
      }

      // Clear uploading files after a delay
      setTimeout(() => {
        setUploadingFiles([])
      }, 2000)

    } catch (error) {
      console.error('Upload failed:', error)
      onError?.('Upload failed. Please try again.')
      
      setUploadingFiles(prev => 
        prev.map(uploadingFile => ({
          ...uploadingFile,
          status: 'error',
          error: 'Upload failed'
        }))
      )
    }
  }, [type, maxFiles, existingFiles.length, onUpload, onError])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect, disabled])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  const handleRemoveFile = useCallback((index: number) => {
    onRemoveFile?.(index)
  }, [onRemoveFile])

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />
    }
    return <File className="h-8 w-8 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const totalFiles = existingFiles.length + uploadingFiles.length
  const canUploadMore = totalFiles < maxFiles

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {isDragOver ? 'Drop files here' : 'Upload Files'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop files here, or click to select files
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Accepted types: {acceptedTypes.join(', ')}</p>
            <p>Max size: {formatFileSize(maxSize)}</p>
            <p>Max files: {maxFiles}</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={acceptedTypes.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploading Files</h4>
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center space-x-3">
                {getFileIcon(uploadingFile.file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadingFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadingFile.file.size)}
                  </p>
                  {uploadingFile.status === 'uploading' && (
                    <Progress value={uploadingFile.progress} className="mt-2" />
                  )}
                  {uploadingFile.status === 'error' && (
                    <p className="text-xs text-destructive mt-1">
                      {uploadingFile.error}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {uploadingFile.status === 'uploading' && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {uploadingFile.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {uploadingFile.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {existingFiles.map((file, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-start space-x-3">
                  {getFileIcon(file.mimeType)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {file.filename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* File Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {totalFiles} of {maxFiles} files
        </span>
        {!canUploadMore && (
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            Max files reached
          </Badge>
        )}
      </div>
    </div>
  )
}
