"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Upload, Image as ImageIcon, Clipboard, X, Search } from 'lucide-react'
import { success, error } from '@/presentation/utils/toast'
import { UnsplashImagePicker } from '@/presentation/components/shared/unsplash-image-picker'

interface ImageUploadDropdownProps {
  value?: string
  onChange: (value: string | undefined) => void
  placeholder?: string
}

export const ImageUploadDropdown: React.FC<ImageUploadDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select or upload image..."
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isUnsplashOpen, setIsUnsplashOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      error('Invalid file type', 'Please select an image file.')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      error('File too large', 'Please select an image smaller than 5MB.')
      return
    }

    try {
      // Convert to base64 for storage
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        onChange(base64)
        success('Image uploaded successfully')
      }
      reader.readAsDataURL(file)
    } catch {
      error('Upload failed', 'Failed to process the image.')
    }
  }

  const handleClipboardPaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read()
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type)
            // Validate size
            if (blob.size > 5 * 1024 * 1024) {
              error('Image too large', 'Please paste an image smaller than 5MB.')
              return
            }
            // Convert to base64
            const reader = new FileReader()
            reader.onload = () => {
              const base64 = reader.result as string
              onChange(base64)
              success('Image pasted from clipboard')
            }
            reader.readAsDataURL(blob)
            return
          }
        }
      }
      error('No image found', 'Please copy an image to your clipboard first.')
    } catch {
      error('Paste failed', 'Failed to paste image from clipboard.')
    }
  }

  const handleUnsplashSelect = (imageUrl: string) => {
    onChange(imageUrl)
    setIsUnsplashOpen(false)
    success('Image selected from Unsplash')
  }

  const handleClear = () => {
    onChange(undefined)
    success('Image cleared')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <>
      <div className="relative">
        <div className="flex gap-2">
          <Input
            value={value || ''}
            placeholder={placeholder}
            readOnly
            className="flex-1 h-8 text-sm"
          />
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 h-8 w-8 p-0 hover:bg-primary/10 focus:ring-2 focus:ring-primary/50"
            onClick={() => setIsOpen(!isOpen)}
          >
            <ImageIcon className="h-3 w-3" />
          </Button>
        </div>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[99999] py-1"
          >
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                fileInputRef.current?.click();
              }}
            >
              <Upload className="h-4 w-4" />
              Upload from device
            </button>
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                handleClipboardPaste();
              }}
            >
              <Clipboard className="h-4 w-4" />
              Paste from clipboard
            </button>
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                setIsUnsplashOpen(true);
              }}
            >
              <Search className="h-4 w-4" />
              Browse Unsplash
            </button>
            {value && (
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  handleClear();
                }}
              >
                <X className="h-4 w-4" />
                Clear image
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Unsplash Image Picker Dialog */}
      <UnsplashImagePicker
        isOpen={isUnsplashOpen}
        onClose={() => setIsUnsplashOpen(false)}
        onSelect={handleUnsplashSelect}
      />
    </>
  )
}