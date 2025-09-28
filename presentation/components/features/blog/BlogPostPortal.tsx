"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog'
import { Badge } from '../../ui/badge'
import { Calendar, User, Tag, Clock, ArrowLeft, Maximize2, Minimize2 } from 'lucide-react'

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
}

interface BlogPostPortalProps {
  post: BlogPost
  trigger: React.ReactNode
}

export function BlogPostPortal({ post, trigger }: BlogPostPortalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className={`max-w-5xl max-h-[95vh] p-0 bg-background flex flex-col ${isFullscreen ? 'max-w-[100vw] max-h-[100vh] w-screen h-screen' : ''}`}>
        {/* Header with Back Button */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between p-6">
            <button
              onClick={() => {
                const dialog = document.querySelector('[data-state="open"][role="dialog"]')
                if (dialog) {
                  const closeButton = dialog.querySelector('[data-dialog-close]') as HTMLButtonElement
                  closeButton?.click()
                }
              }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Hero Image */}
            {post.imageUrl && (
              <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-8 shadow-lg">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}

            {/* Article Header */}
            <header className="mb-8">
              <DialogTitle className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-foreground">
                {post.title}
              </DialogTitle>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{post.author}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime} min read</span>
                </div>
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs px-3 py-1 bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <Tag className="h-3 w-3 mr-1.5" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Excerpt */}
              <div className="text-lg text-muted-foreground leading-relaxed border-l-4 border-primary/20 pl-6 italic">
                {post.excerpt}
              </div>
            </header>

            {/* Article Content */}
            <article className="prose prose-slate dark:prose-invert max-w-none prose-lg">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Headings
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold mt-12 mb-6 first:mt-0 text-foreground border-b border-border pb-3">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-semibold mt-10 mb-4 text-foreground">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-medium mt-8 mb-3 text-foreground">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-lg font-medium mt-6 mb-2 text-foreground">
                      {children}
                    </h4>
                  ),

                  // Paragraphs
                  p: ({ children }) => (
                    <p className="mb-6 leading-relaxed text-foreground/90">
                      {children}
                    </p>
                  ),

                  // Links
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary/60 transition-colors font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),

                  // Code blocks
                  pre: ({ children }) => (
                    <pre className="bg-muted rounded-lg p-4 overflow-x-auto my-6 text-sm border">
                      {children}
                    </pre>
                  ),
                  code: ({ children }) => (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
                      {children}
                    </code>
                  ),

                  // Lists
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-6 space-y-2 text-foreground/90">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-6 space-y-2 text-foreground/90">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">
                      {children}
                    </li>
                  ),

                  // Blockquotes
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary/30 pl-6 py-2 my-6 italic text-muted-foreground bg-muted/30 rounded-r-lg">
                      {children}
                    </blockquote>
                  ),

                  // Tables
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6">
                      <table className="w-full border-collapse border border-border rounded-lg">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-border px-4 py-2 bg-muted font-semibold text-left">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-border px-4 py-2 text-foreground/90">
                      {children}
                    </td>
                  ),

                  // Horizontal rule
                  hr: () => (
                    <hr className="border-border my-8" />
                  ),

                  // Strong and emphasis
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-foreground/90">
                      {children}
                    </em>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </article>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}