"use client"

import React from 'react'
import Image from 'next/image'
import { MarkdownRenderer } from '@/presentation/utils/markdown'
import { Portal } from '../../shared/Portal'
import { Badge } from '../../ui/badge'
import { Calendar, User, Tag } from 'lucide-react'

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  publishedAt: string
  tags: string[]
  readTime: number
  imageUrl?: string
  featured: boolean
  categories: string[] // Array of category IDs
}

interface BlogPostPortalProps {
  post: BlogPost
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BlogPostContent({ post }: { post: BlogPost }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <User className="h-4 w-4" />
          <span>{post.author}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
        </div>
        <span>{post.readTime || 5} min read</span>
      </div>
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      )}
      <div className="space-y-6">
        {post.imageUrl && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <MarkdownRenderer
          content={post.content}
          className="prose prose-slate dark:prose-invert max-w-none"
        />
      </div>
    </div>
  )
}

export function BlogPostPortal({ post, open, onOpenChange }: BlogPostPortalProps) {
  return (
    <Portal open={open} onOpenChange={onOpenChange} title={post.title} maxWidth="max-w-4xl">
      <BlogPostContent post={post} />
    </Portal>
  )
}
