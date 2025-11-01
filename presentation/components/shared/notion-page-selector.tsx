'use client'

import React, { useState } from 'react'
import { useNotionQuery } from '@/presentation/hooks/use-notion-query'
import { useNotionPage } from '@/presentation/hooks/use-notion-page'
import { NotionPageRenderer } from './notion-renderer'
import { Button } from '@/presentation/components/ui/button'
import { Loader2, Search, FileText, X } from 'lucide-react'

interface NotionPageSelectorProps {
  databaseId: string
  selectedPageId?: string
  onPageSelect: (pageId: string) => void
  placeholder?: string
  className?: string
  showPreview?: boolean
}

export function NotionPageSelector({
  databaseId,
  selectedPageId,
  onPageSelect,
  placeholder = 'Select a Notion page...',
  className,
  showPreview = false
}: NotionPageSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)

  // Query published pages from Notion
  const { pages, isLoading, error } = useNotionQuery({
    databaseId,
    filterProperty: 'Status',
    filterValue: 'Published',
    enabled: !!databaseId && isSelectorOpen
  })

  // Fetch the selected page content for preview
  const { recordMap, isLoading: isLoadingPage } = useNotionPage({
    pageId: selectedPageId || '',
    enabled: !!selectedPageId && showPreview
  })

  const filteredPages = pages.filter(page => 
    !searchTerm || 
    page.properties.Title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedPage = pages.find(p => p.id === selectedPageId)

  if (error) {
    return (
      <div className={`p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20 ${className}`}>
        <p className="text-sm text-red-700 dark:text-red-300">
          Error loading Notion pages: {error.message}
        </p>
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
          Make sure NOTION_API_KEY and NOTION_DATABASE_ID are set correctly.
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Page Selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {selectedPage ? (
            <>
              <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white flex-1">
                {selectedPage.properties.Title || 'Untitled Page'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onPageSelect('')
                  setIsSelectorOpen(false)
                }}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsSelectorOpen(!isSelectorOpen)}
              className="w-full justify-start"
            >
              <FileText className="h-4 w-4 mr-2" />
              {placeholder}
            </Button>
          )}
        </div>

        {/* Page Selection Dropdown */}
        {isSelectorOpen && (
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 shadow-lg max-h-96 overflow-hidden flex flex-col">
            {/* Search */}
            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search pages..."
                  className="w-full pl-8 pr-2 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Page List */}
            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-slate-400" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Loading pages...</p>
                </div>
              ) : filteredPages.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  {searchTerm ? 'No pages found' : 'No published pages available'}
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredPages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => {
                        onPageSelect(page.id)
                        setIsSelectorOpen(false)
                        setSearchTerm('')
                      }}
                      className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="font-medium text-slate-900 dark:text-white text-sm">
                        {page.properties.Title || 'Untitled Page'}
                      </div>
                      {page.properties.Excerpt && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {page.properties.Excerpt}
                        </div>
                      )}
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {new Date(page.last_edited_time).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Page Preview */}
      {showPreview && selectedPageId && (
        <div className="mt-4 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          {isLoadingPage ? (
            <div className="p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Loading page preview...</p>
            </div>
          ) : recordMap ? (
            <div className="max-h-[600px] overflow-y-auto">
              <NotionPageRenderer recordMap={recordMap} />
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

