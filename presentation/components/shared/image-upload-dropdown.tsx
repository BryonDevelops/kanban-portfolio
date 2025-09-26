"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/presentation/components/ui/dropdown-menu'
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
  const [isUnsplashOpen, setIsUnsplashOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  return (
    <>
      <div className="flex gap-2">
        <Input
          value={value || ''}
          placeholder={placeholder}
          readOnly
          className="flex-1 h-8 text-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="shrink-0 h-8 w-8 p-0">
              <ImageIcon className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 z-[10000]" side="bottom">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              <Upload className="mr-2 h-4 w-4" />
              Upload from device
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleClipboardPaste(); }}>
              <Clipboard className="mr-2 h-4 w-4" />
              Paste from clipboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsUnsplashOpen(true); }}>
              <Search className="mr-2 h-4 w-4" />
              Browse Unsplash
            </DropdownMenuItem>
            {value && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleClear(); }}>
                <X className="mr-2 h-4 w-4" />
                Clear image
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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