'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { ExtendedRecordMap } from 'notion-types'

// Dynamically import react-notion-x to avoid SSR issues
const NotionRenderer = dynamic(
  () => import('react-notion-x').then((mod) => mod.NotionRenderer),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-slate-400"></div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading Notion page...</p>
        </div>
      </div>
    )
  }
)

// Import Notion styles
import 'react-notion-x/src/styles.css'
// Import custom Notion styles
import './notion-renderer.css'

interface NotionPageRendererProps {
  recordMap: ExtendedRecordMap
  className?: string
}

export function NotionPageRenderer({ recordMap, className }: NotionPageRendererProps) {
  const { theme, systemTheme } = useTheme()
  const [isDarkMode, setIsDarkMode] = React.useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  
  // Determine if dark mode is active and update reactively
  React.useEffect(() => {
    if (theme === 'dark') {
      setIsDarkMode(true)
    } else if (theme === 'light') {
      setIsDarkMode(false)
    } else {
      // For 'system' theme, check systemTheme or use window matchMedia
      const systemIsDark = systemTheme === 'dark' || 
        (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      setIsDarkMode(systemIsDark)
    }
  }, [theme, systemTheme])
  
  // Detect if we're in a fullscreen container by checking parent width and classes
  React.useEffect(() => {
    if (!wrapperRef.current) return
    
    const checkFullscreen = () => {
      const element = wrapperRef.current
      if (!element) return
      
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      // Check if any parent has fullscreen indicators
      let parent = element.parentElement
      let foundFullscreen = false
      
      while (parent && parent !== document.body) {
        const computedStyle = window.getComputedStyle(parent)
        const parentWidth = parent.getBoundingClientRect().width
        const parentHeight = parent.getBoundingClientRect().height
        
        // Check for fullscreen classes, styles, or dimensions
        if (parent.classList.contains('w-screen') || 
            parent.classList.contains('h-screen') ||
            parent.style.width === '100vw' ||
            parent.style.height === '100vh' ||
            computedStyle.width === '100vw' ||
            computedStyle.height === '100vh' ||
            (Math.abs(parentWidth - viewportWidth) < 10 && parentWidth > viewportWidth * 0.95) ||
            (Math.abs(parentHeight - viewportHeight) < 10 && parentHeight > viewportHeight * 0.95)) {
          foundFullscreen = true
          break
        }
        parent = parent.parentElement
      }
      
      if (foundFullscreen) {
        setIsFullscreen(true)
        return
      }
      
      // Check if container width is close to viewport width (> 95%)
      const rect = element.getBoundingClientRect()
      const isWide = viewportWidth > 0 && rect.width / viewportWidth > 0.95
      setIsFullscreen(isWide)
    }
    
    // Initial check with slight delay to ensure DOM is ready
    setTimeout(checkFullscreen, 100)
    
    // Use ResizeObserver to detect container size changes
    const resizeObserver = new ResizeObserver(() => {
      // Small delay to ensure styles have applied
      setTimeout(checkFullscreen, 50)
    })
    
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current)
      
      // Also observe all parent containers
      let parent = wrapperRef.current.parentElement
      while (parent && parent !== document.body) {
        resizeObserver.observe(parent)
        parent = parent.parentElement
      }
    }
    
    // Watch for class and style changes on parent elements
    const mutationObserver = new MutationObserver(checkFullscreen)
    let parent = wrapperRef.current?.parentElement
    while (parent && parent !== document.body) {
      mutationObserver.observe(parent, {
        attributes: true,
        attributeFilter: ['class', 'style'],
        childList: false,
        subtree: false
      })
      parent = parent.parentElement
    }
    
    // Also check on window resize
    window.addEventListener('resize', checkFullscreen)
    
    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      window.removeEventListener('resize', checkFullscreen)
    }
  }, [])

  // Extract cover image from recordMap
  const coverImage = React.useMemo(() => {
    if (!recordMap || !recordMap.block) return null
    
    try {
      // Find the page block (usually has type 'page')
      const blocks = recordMap.block
      let pageBlock: any = null
      let pageBlockId: string | null = null
      
      for (const blockId in blocks) {
        const block = blocks[blockId]?.value
        if (block && block.type === 'page') {
          pageBlock = block
          pageBlockId = blockId
          break
        }
      }
      
      // If no page block found, try the first block
      if (!pageBlock) {
        const blockIds = Object.keys(blocks)
        if (blockIds.length > 0) {
          pageBlockId = blockIds[0]
          pageBlock = blocks[blockIds[0]]?.value
        }
      }
      
      if (!pageBlock || !pageBlockId) return null
      
      // Extract cover from format.page_cover property
      const cover = pageBlock.format?.page_cover
      if (!cover) return null
      
      // Handle different cover formats
      let coverUrl: string | null = null
      
      if (typeof cover === 'string') {
        coverUrl = cover
      } else if (cover && typeof cover === 'object') {
        coverUrl = cover.url || cover.src || null
      }
      
      if (!coverUrl) return null
      
      // Check if URL needs to be mapped through signed_urls
      if (recordMap.signed_urls && pageBlockId && recordMap.signed_urls[pageBlockId]) {
        const signedUrls = recordMap.signed_urls[pageBlockId] as unknown as Record<string, string>
        if (signedUrls && coverUrl && signedUrls[coverUrl]) {
          return signedUrls[coverUrl]
        }
      }
      
      // Return direct URL if it's already a full URL
      if (coverUrl.startsWith('http://') || coverUrl.startsWith('https://')) {
        return coverUrl
      }
      
      // For relative URLs, might need to construct full URL
      // Note: Notion covers might be served from their CDN
      if (coverUrl.startsWith('/')) {
        return `https://www.notion.so${coverUrl}`
      }
      
      return coverUrl
    } catch (error) {
      console.warn('[NotionPageRenderer] Error extracting cover image:', error)
      return null
    }
  }, [recordMap])

  if (!recordMap) {
    return (
      <div className={className}>
        <div className="p-4 text-slate-600 dark:text-slate-400">No content to display</div>
      </div>
    )
  }

  return (
    <div 
      ref={wrapperRef}
      className={`notion-wrapper ${isFullscreen ? 'fullscreen' : ''} ${className || ''}`}
    >
      {/* Cover/Banner Image */}
      {coverImage && (
        <div className="notion-cover-container">
          <div className="notion-cover-image-wrapper">
            <Image
              src={coverImage}
              alt="Cover"
              width={1200}
              height={400}
              className="notion-cover-image"
              priority
              unoptimized
            />
          </div>
        </div>
      )}
      
      <div className="notion-content-container">
        <NotionRenderer
          recordMap={recordMap}
          fullPage={false}
          darkMode={isDarkMode}
          previewImages={true}
          showTableOfContents={true}
          minTableOfContentsItems={3}
          mapPageUrl={(pageId) => `/notion/${pageId}`}
        />
      </div>
    </div>
  )
}


