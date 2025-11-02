'use client'

import React from 'react'
import { useNotionPage } from '@/presentation/hooks/use-notion-page'
import { NotionPageRenderer } from '@/presentation/components/shared/notion-renderer'
import { Loader2, AlertCircle } from 'lucide-react'

interface NotionBlogPostContentProps {
  notionPageId: string
  className?: string
}

/**
 * Component to render a blog post from a Notion page ID
 * This replaces the previous HTML content rendering
 */
export function NotionBlogPostContent({ notionPageId, className }: NotionBlogPostContentProps) {
  console.log('[NotionBlogPostContent] Rendering with pageId:', notionPageId)
  const { recordMap, isLoading, error } = useNotionPage({
    pageId: notionPageId,
    enabled: !!notionPageId
  })
  
  console.log('[NotionBlogPostContent] State:', { 
    isLoading, 
    hasError: !!error, 
    error: error?.message,
    hasRecordMap: !!recordMap 
  })

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400 mb-4" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    const isNotFound = error.message.includes('not found') || error.message.includes('404');
    return (
      <div className={`p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20 ${className}`}>
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Error loading content</span>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
          {error.message}
        </p>
        {isNotFound && (
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium mb-1">
              Page Not Publicly Accessible
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              To view this post, the Notion page needs to be publicly shared. In Notion, open the page, click "Share" → "Share to web" and enable public access.
            </p>
          </div>
        )}
      </div>
    )
  }

  if (!recordMap) {
    return (
      <div className={`p-4 text-center text-slate-500 dark:text-slate-400 ${className}`}>
        <p>No content available</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <NotionPageRenderer recordMap={recordMap} />
    </div>
  )
}

