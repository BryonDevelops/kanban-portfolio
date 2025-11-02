'use client'

import { useState, useEffect } from 'react'
import { ExtendedRecordMap } from 'notion-types'

interface UseNotionPageOptions {
  pageId: string
  enabled?: boolean
}

interface UseNotionPageResult {
  recordMap: ExtendedRecordMap | null
  isLoading: boolean
  error: Error | null
}

export function useNotionPage({ pageId, enabled = true }: UseNotionPageOptions): UseNotionPageResult {
  const [recordMap, setRecordMap] = useState<ExtendedRecordMap | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled || !pageId) {
      setIsLoading(false)
      return
    }

    const fetchPage = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log('[useNotionPage] Fetching Notion page:', pageId)
        const url = `/api/notion?action=render&pageId=${encodeURIComponent(pageId)}`
        console.log('[useNotionPage] Fetch URL:', url)
        
        const response = await fetch(url)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('[useNotionPage] Fetch failed:', response.status, errorText)
          throw new Error(`Failed to fetch Notion page: ${response.statusText}`)
        }

        const data = await response.json()
        console.log('[useNotionPage] Fetched recordMap, has data:', !!data.recordMap)
        setRecordMap(data.recordMap)
      } catch (err) {
        console.error('[useNotionPage] Error:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchPage()
  }, [pageId, enabled])

  return { recordMap, isLoading, error }
}

