import { useRef, useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { cn } from '../../lib/utils.ts'
import { createTweet } from '../../lib/tweetService'
import { apiFetch } from '../../lib/api'
import { buildApiUrl } from '../../lib/apiConfig'
import { useAuth } from '../../auth/useAuth'
import { getCurrentUser, type CurrentUser } from '../../lib/userService'
import { FiPaperclip, FiX, FiUploadCloud } from 'react-icons/fi'
import Avatar from './atoms/Avatar'

interface TweetComposerProps {
  onTweetCreated?: (newTweet: any) => void
  onError?: (error: string) => void
  placeholder?: string
  maxChars?: number
  className?: string
}

export default function TweetComposer({
  onTweetCreated,
  onError,
  placeholder = "Partage ta pensée...",
  maxChars = 500,
  className,
}: TweetComposerProps) {
  const { isAuthenticated } = useAuth()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([])
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Load current user
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentUser(null)
      return
    }
    
    const loadUser = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
      } catch (err) {
        // Silently fail - show composer without user info
        console.debug('Could not load current user for avatar:', err)
        setCurrentUser(null)
      }
    }

    loadUser()
  }, [isAuthenticated])

  const charCount = content.length
  const remainingChars = maxChars - charCount
  const isOverLimit = remainingChars < 0
  const isNearLimit = remainingChars < 50

  // Allowed MIME types including modern formats
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heic-sequence',
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ]

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files || [])
    processFiles(files)
  }

  // Process files (from input or drag-drop)
  const processFiles = async (files: File[]) => {
    setMediaError(null)

    // Validate count
    if (mediaFiles.length + files.length > 4) {
      setMediaError('Maximum 4 files allowed per tweet')
      return
    }

    // Validate types and create previews
    const validFiles: File[] = []
    const newPreviews: string[] = []

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setMediaError(`Unsupported file type: ${file.type}. Only images and videos allowed.`)
        continue
      }

      validFiles.push(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        newPreviews.push(event.target?.result as string)
        if (newPreviews.length === validFiles.length) {
          setMediaFiles((prev) => [...prev, ...validFiles])
          setMediaPreviews((prev) => [...prev, ...newPreviews])
          setCurrentPreviewIndex(0)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle file input selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processFiles(files)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Remove media by index
  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index))
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index))
    if (currentPreviewIndex >= mediaFiles.length - 1 && currentPreviewIndex > 0) {
      setCurrentPreviewIndex(currentPreviewIndex - 1)
    }
  }

  // Upload media files
  const uploadMediaFiles = async (files: File[]): Promise<number[]> => {
    setIsUploadingMedia(true)
    setMediaError(null)
    setUploadProgress({})

    try {
      const uploadPromises = files.map(async (file, index) => {
        const formData = new FormData()
        formData.append('file', file)

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => ({
            ...prev,
            [index]: Math.min((prev[index] || 0) + Math.random() * 30, 90),
          }))
        }, 100)

        const response = await apiFetch(buildApiUrl('/api/media'), {
          method: 'POST',
          body: formData,
        })

        clearInterval(progressInterval)
        setUploadProgress((prev) => ({
          ...prev,
          [index]: 100,
        }))

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `Upload failed with status ${response.status}`)
        }

        return data.id
      })

      const mediaIds = await Promise.all(uploadPromises)
      return mediaIds
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload media'
      setMediaError(errorMsg)
      throw err
    } finally {
      setIsUploadingMedia(false)
      setTimeout(() => setUploadProgress({}), 500)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setMediaError(null)

    if (!content.trim()) {
      setError('Tweet cannot be empty.')
      return
    }

    if (isOverLimit) {
      setError(`Tweet is too long. Max ${maxChars} characters.`)
      return
    }

    try {
      setIsLoading(true)

      // Upload media files if any
      let mediaIds: number[] = []
      if (mediaFiles.length > 0) {
        mediaIds = await uploadMediaFiles(mediaFiles)
      }

      // Create tweet with mediaIds
      const newTweet = await createTweet({
        content: content.trim(),
        mediaIds,
      })

      setContent('')
      setMediaFiles([])
      setMediaPreviews([])
      setCurrentPreviewIndex(0)
      onTweetCreated?.(newTweet)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create tweet.'
      setError(message)
      onError?.(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'w-[325px] ui-surface bg-white rounded-[10px] overflow-hidden',
        className
      )}
    >
      {/* Header avec Avatar */}
      <div className='flex items-start gap-3 p-4 border-b border-gray-200'>
        <Avatar
          url={currentUser?.avatar_url}
          username={currentUser?.username || 'User'}
          size='md'
        />
        <div className='flex-1 min-w-0'>
          <p className='font-semibold text-gray-900 truncate'>
            {currentUser?.username || 'Utilisateur'}
          </p>
          <p className='text-xs text-gray-500'>@{currentUser?.username || 'username'}</p>
        </div>
      </div>

      {/* Textarea with Drag-Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'px-4 pt-4 pb-2 transition-all',
          isDragOver && 'bg-blue-50'
        )}
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          maxLength={maxChars}
          disabled={isLoading}
          className='w-full resize-none bg-transparent text-lg text-gray-900 placeholder-gray-400 focus:outline-none'
          rows={5}
        />
      </div>

      {/* Drag-drop zone indicator */}
      {isDragOver && (
        <div className='mx-4 p-4 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50 flex flex-col items-center justify-center gap-2'>
          <FiUploadCloud size={24} className='text-blue-500' />
          <p className='text-sm font-medium text-blue-700'>Drop your media here</p>
        </div>
      )}

      {/* Permanent Drop Zone */}
      <div
        ref={dropZoneRef}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'mx-4 mt-3 p-6 border-2 border-dashed rounded-lg transition-all text-center cursor-pointer',
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'
        )}
      >
        <FiUploadCloud
          size={32}
          className={cn('mx-auto mb-2', isDragOver ? 'text-blue-500' : 'text-gray-400')}
        />
        <p className='text-sm font-medium text-gray-700'>Glisse tes médias ici</p>
        <p className='text-xs text-gray-500 mt-1'>ou clique pour sélectionner</p>
        <p className='text-xs text-gray-500 mt-3 font-mono leading-relaxed'>
          📷 JPEG • PNG • WebP • GIF • HEIC<br />
          🎬 MP4 • WebM • MOV<br />
          <span className='text-gray-400'>Max 5 MB par fichier</span>
        </p>
      </div>

      {/* Upload Progress Bars */}
      {isUploadingMedia && Object.keys(uploadProgress).length > 0 && (
        <div className='px-4 py-3 border-t border-gray-100 bg-gray-50'>
          <p className='text-xs font-semibold text-gray-600 mb-3'>Téléchargement en cours...</p>
          <div className='space-y-2'>
            {mediaFiles.map((file, index) => (
              <div key={index}>
                <div className='flex items-center justify-between mb-1'>
                  <p className='text-xs text-gray-700 truncate flex-1'>{file.name}</p>
                  <p className='text-xs font-medium text-gray-600 ml-2'>
                    {Math.round(uploadProgress[index] || 0)}%
                  </p>
                </div>
                <div className='w-full h-2 bg-gray-200 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out'
                    style={{ width: `${uploadProgress[index] || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Preview */}
      {mediaPreviews.length > 0 && (
        <div className='px-4 py-3 border-t border-gray-100'>
          <div className='relative w-full bg-gray-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center mb-2'>
            {mediaPreviews[currentPreviewIndex]?.startsWith('data:image') ? (
              <img
                src={mediaPreviews[currentPreviewIndex]}
                alt={`Preview ${currentPreviewIndex + 1}`}
                className='max-w-full max-h-full object-cover'
              />
            ) : (
              <video
                src={mediaPreviews[currentPreviewIndex]}
                className='max-w-full max-h-full object-cover'
                controls
              />
            )}

            {/* Close Button */}
            <button
              type='button'
              onClick={() => removeMedia(currentPreviewIndex)}
              className='absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1'
              aria-label='Supprimer ce média'
            >
              <FiX size={16} />
            </button>

            {/* Navigation Buttons */}
            {mediaPreviews.length > 1 && (
              <>
                <button
                  type='button'
                  onClick={() => setCurrentPreviewIndex((prev) => (prev > 0 ? prev - 1 : mediaPreviews.length - 1))}
                  className='absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white px-2 py-1 rounded text-sm'
                >
                  ←
                </button>
                <button
                  type='button'
                  onClick={() => setCurrentPreviewIndex((prev) => (prev < mediaPreviews.length - 1 ? prev + 1 : 0))}
                  className='absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white px-2 py-1 rounded text-sm'
                >
                  →
                </button>
              </>
            )}
          </div>

          {/* Media Counter */}
          <div className='flex items-center justify-between text-xs text-gray-500'>
            <span>{currentPreviewIndex + 1}/{mediaPreviews.length}</span>
            <div className='flex gap-1'>
              {mediaPreviews.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'h-1 rounded-full transition-colors',
                    idx === currentPreviewIndex ? 'w-3 bg-gray-400' : 'w-1.5 bg-gray-300'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {error && (
        <div className='mx-4 mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700'>
          {error}
        </div>
      )}
      {mediaError && (
        <div className='mx-4 mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700'>
          {mediaError}
        </div>
      )}

      {/* Actions & Submit */}
      <div className='px-4 py-3 border-t border-gray-200 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          {/* Add Media Button */}
          <button
            type='button'
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isUploadingMedia}
            className='p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50'
            title='Ajouter un média'
          >
            <FiPaperclip size={18} />
          </button>
        </div>

        <div className='flex items-center gap-3'>
          <span
            className={cn('text-xs font-medium', {
              'text-gray-400': content.length === 0,
              'text-gray-600': content.length > 0 && remainingChars >= 50,
              'text-amber-600': isNearLimit && !isOverLimit,
              'text-red-600': isOverLimit,
            })}
          >
            {charCount}/{maxChars}
          </span>

          <button
            type='submit'
            disabled={isLoading || isUploadingMedia || !content.trim() || isOverLimit}
            className='px-5 py-2 bg-[#ea4098] hover:bg-[#d63881] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-full transition-colors'
          >
            {isLoading || isUploadingMedia ? 'Publication...' : 'Publier'}
          </button>
        </div>
      </div>

      {/* File Input (hidden) */}
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept='image/*,video/*'
        className='hidden'
      />
    </form>
  )
}
