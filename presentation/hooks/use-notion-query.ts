'use client'

import { useState, useEffect } from 'react'

interface NotionPage {
  id: string
  url: string
  created_time: string
  last_edited_time: string
  properties: {
    Title?: string
    Status?: string
    Author?: string
    Tags?: string[]
    Excerpt?: string
    [key: string]: any
  }
}

interface UseNotionQueryOptions {
  databaseId: string
  filterProperty?: string
  filterValue?: string
  enabled?: boolean
}

interface UseNotionQueryResult {
  pages: NotionPage[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useNotionQuery({ 
  databaseId, 
  filterProperty, 
  filterValue, 
  enabled = true 
}: UseNotionQueryOptions): UseNotionQueryResult {
  const [pages, setPages] = useState<NotionPage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPages = async () => {
    if (!enabled || !databaseId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        action: 'query',
        databaseId,
      })

      if (filterProperty && filterValue) {
        params.append('filterProperty', filterProperty)
        params.append('filterValue', filterValue)
      }

      const response = await fetch(`/api/notion?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to query Notion database: ${response.statusText}`)
      }

      const data = await response.json()
      setPages(data.results || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPages()
  }, [databaseId, filterProperty, filterValue, enabled])

  return { 
    pages, 
    isLoading, 
    error,
    refetch: fetchPages
  }
}

