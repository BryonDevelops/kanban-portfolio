"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/presentation/components/ui/input'
import { Button } from '@/presentation/components/ui/button'
import { Search, Loader2, X } from 'lucide-react'
import Image from 'next/image'
import { createPortal } from 'react-dom'

interface UnsplashImage {
  id: string
  urls: {
    small: string
    regular: string
  }
  alt_description: string
  user: {
    name: string
  }
}

interface UnsplashImagePickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (imageUrl: string) => void
}

export const UnsplashImagePicker: React.FC<UnsplashImagePickerProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [images, setImages] = useState<UnsplashImage[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const hasLoadedInitial = useRef(false)

  const searchImages = async (query: string) => {
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    try {
      // Try real Unsplash API first
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || 'demo'}`
      )

      if (response.ok) {
        const data = await response.json()
        setImages(data.results || [])
      } else {
        throw new Error(`API returned ${response.status}`)
      }
    } catch (err) {
      console.error('Failed to fetch from Unsplash API:', err)
      // Fallback to mock data
      const mockImages: UnsplashImage[] = [
        {
          id: '1',
          urls: {
            small: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
            regular: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
          },
          alt_description: 'Mountain landscape',
          user: { name: 'John Doe' }
        },
        {
          id: '2',
          urls: {
            small: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
            regular: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'
          },
          alt_description: 'Forest path',
          user: { name: 'Jane Smith' }
        },
        {
          id: '3',
          urls: {
            small: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400',
            regular: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800'
          },
          alt_description: 'Ocean waves',
          user: { name: 'Bob Wilson' }
        }
      ]
      setImages(mockImages)
      setError('Using demo images - API unavailable')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    searchImages(searchQuery)
  }

  const handleSelect = useCallback(() => {
    if (selectedImage) {
      onSelect(selectedImage)
    }
  }, [selectedImage, onSelect])

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setSelectedImage(null)
      setSearchQuery('')
      if (!hasLoadedInitial.current) {
        // Load some default images when opened
        searchImages('nature')
        hasLoadedInitial.current = true
      }
    } else {
      // Reset loaded state when closed
      hasLoadedInitial.current = false
    }
  }, [isOpen])

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Enter' && selectedImage) {
        handleSelect()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedImage, onClose, handleSelect])

  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-md flex items-center justify-center p-4" data-unsplash-modal>
      <div className="w-full max-w-6xl max-h-[90vh] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200/50 dark:border-slate-700/50 flex-shrink-0">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Select Image from Unsplash</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col min-h-0">
          {error && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex-shrink-0">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
            </div>
          )}

          <div className="flex gap-2 mb-6 flex-shrink-0">
            <Input
              placeholder="Search for images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 h-full overflow-y-auto">
              {loading && images.length === 0 ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-400" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Loading images...</p>
                  </div>
                </div>
              ) : images.length === 0 ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="text-center">
                    <Search className="h-8 w-8 mx-auto mb-4 text-slate-400" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">No images found</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try searching for something else</p>
                  </div>
                </div>
              ) : (
                images.map((image) => (
                  <div
                    key={image.id}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                      selectedImage === image.urls.regular ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedImage(image.urls.regular)}
                  >
                    <Image
                      src={image.urls.small}
                      alt={image.alt_description || 'Unsplash image'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white text-xs font-medium truncate">Photo by {image.user.name}</p>
                    </div>
                    {selectedImage === image.urls.regular && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <div className="bg-blue-500 text-white rounded-full p-2 shadow-lg">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 flex-shrink-0">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSelect} disabled={!selectedImage}>
              Select Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  // Render using portal to escape container bounds
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body)
  }

  return modalContent
}