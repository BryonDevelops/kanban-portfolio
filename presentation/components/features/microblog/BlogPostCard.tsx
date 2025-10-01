"use client"

import React from 'react'
import Image from 'next/image'
import { BlogPostPortal, BlogPost } from './BlogPostPortal'
import { Card } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Calendar, User, Clock } from 'lucide-react'

interface BlogPostCardProps {
  post: BlogPost
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <BlogPostPortal
      post={post}
      trigger={
        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
          <div className="p-6 space-y-4">
            {post.imageUrl && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-xl font-semibold line-clamp-2 hover:text-blue-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-muted-foreground line-clamp-3">
                {post.excerpt}
              </p>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime || 5} min</span>
                </div>
              </div>
            </div>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {post.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{post.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Card>
      }
    />
  )
}