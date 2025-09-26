"use client"

import React from 'react'
import Image from 'next/image'
import { BlogPostPortal, BlogPost } from './BlogPostPortal'
import { Card } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Calendar, User, Clock } from 'lucide-react'

// Sample blog posts data
const sampleBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Building Modern Web Applications with Next.js 15',
    excerpt: 'Explore the latest features in Next.js 15 and how they can improve your development workflow.',
    content: `# Building Modern Web Applications with Next.js 15

Next.js 15 brings exciting new features that make building modern web applications even more powerful and efficient.

## Key Features

### 1. App Router Enhancements
The App Router continues to evolve with better performance and developer experience improvements.

### 2. Server Components
Server Components allow you to render components on the server, reducing bundle size and improving performance.

### 3. Streaming and Suspense
Built-in support for streaming responses and React Suspense for better loading experiences.

## Getting Started

To get started with Next.js 15, make sure you have the latest version installed:

\`\`\`bash
npm install next@latest react@latest react-dom@latest
\`\`\`

## Conclusion

Next.js 15 provides a solid foundation for building modern, performant web applications. The combination of App Router, Server Components, and streaming capabilities makes it an excellent choice for your next project.`,
    author: 'Bryon Bauer',
    publishedAt: '2025-01-15',
    tags: ['Next.js', 'React', 'Web Development'],
    readTime: 5,
    imageUrl: '/heroimg_dark.png'
  },
  {
    id: '2',
    title: 'TypeScript Best Practices for Large Codebases',
    excerpt: 'Learn how to maintain type safety and code quality in growing TypeScript projects.',
    content: `# TypeScript Best Practices for Large Codebases

As your TypeScript codebase grows, maintaining type safety becomes increasingly important.

## Essential Practices

### 1. Strict Mode
Always enable strict mode in your tsconfig.json for maximum type safety.

### 2. Interface vs Type
Use interfaces for object shapes and types for unions and primitives.

### 3. Generic Constraints
Use generic constraints to ensure type safety in reusable components.

## Code Organization

### File Structure
\`\`\`typescript
src/
  types/
    index.ts
  components/
    Button/
      index.ts
      Button.tsx
\`\`\`

## Conclusion

Following these best practices will help you maintain a healthy, type-safe codebase as your project grows.`,
    author: 'Bryon Bauer',
    publishedAt: '2025-01-10',
    tags: ['TypeScript', 'Best Practices', 'Code Quality'],
    readTime: 7
  }
]

interface BlogPostCardProps {
  post: BlogPost
}

function BlogPostCard({ post }: BlogPostCardProps) {
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
                  <span>{post.readTime} min</span>
                </div>
              </div>
            </div>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((tag) => (
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

export function BlogPostGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sampleBlogPosts.map((post) => (
        <BlogPostCard key={post.id} post={post} />
      ))}
    </div>
  )
}