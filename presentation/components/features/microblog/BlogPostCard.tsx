"use client"

import React from "react"
import { Portal } from "../../shared/Portal"
import { BlogPostContent, BlogPost } from "./BlogPostPortal"
import { Badge } from "../../ui/badge"
import { ArrowRight, X } from "lucide-react"

type BlogPostCardVariant = "default" | "featured"

interface BlogPostCardProps {
  post: BlogPost
  variant?: BlogPostCardVariant
  isAdmin?: boolean
  renderAdminButtons?: (post: BlogPost) => React.ReactNode
  className?: string
}

export function BlogPostCard({
  post,
  variant = "default",
  isAdmin = false,
  renderAdminButtons,
  className
}: BlogPostCardProps) {
  const [isPortalOpen, setIsPortalOpen] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  const openPortal = React.useCallback(() => {
    setIsPortalOpen(true)
  }, [])

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      setIsPortalOpen(true)
    }
  }, [])

  const handleOpenChange = React.useCallback((open: boolean) => {
    setIsPortalOpen(open)
    if (!open) setIsFullscreen(false)
  }, [])

  const handleToggleFullscreen = React.useCallback(() => {
    setIsFullscreen((prev) => !prev)
  }, [])

  const publishedDate = new Date(post.publishedAt)
  const defaultDateLabel = publishedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const featuredDateLabel = publishedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  const readTime = post.readTime || 5

  const baseClassName =
    variant === "featured"
      ? "group relative overflow-hidden bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-pink-200/50 dark:border-white/10 rounded-2xl hover:border-pink-300/50 dark:hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-200/20 dark:hover:shadow-white/5 cursor-pointer"
      : "group relative p-6 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-pink-200/50 dark:border-white/10 hover:border-pink-300/50 dark:hover:border-white/20 transition-all duration-300 hover:scale-[1.01] cursor-pointer"
  const combinedClassName = className ? `${baseClassName} ${className}` : baseClassName
  const tagsToDisplay = variant === "featured" ? post.tags.slice(0, 3) : post.tags.slice(0, 2)
  const adminButtonPosition = variant === "featured" ? "absolute top-4 left-4 z-10" : "absolute top-4 right-4 z-10"

  // Modal classes: fullscreen disables border-radius and max-width
  const modalClass = isFullscreen
    ? "h-screen max-h-screen w-screen flex flex-col rounded-none shadow-none bg-white/90 dark:bg-neutral-900/95 backdrop-blur-xl border-0"
    : "h-screen max-h-screen flex flex-col w-full sm:w-auto rounded-2xl shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-border"

  return (
    <>
      <div
        className={combinedClassName}
        role="button"
        tabIndex={0}
        onClick={openPortal}
        onKeyDown={handleKeyDown}
        aria-label={`Read blog post ${post.title}`}
      >
        {variant === "featured" && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 dark:from-yellow-500 dark:to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Featured
            </div>
          </div>
        )}

        {isAdmin && renderAdminButtons && (
          <div className={adminButtonPosition}>
            {renderAdminButtons(post)}
          </div>
        )}

        {variant === "featured" ? (
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-slate-500 dark:text-gray-400">
                {featuredDateLabel}
              </span>
              <span className="text-xs text-slate-500 dark:text-gray-400">&bull;</span>
              <span className="text-xs text-slate-500 dark:text-gray-400">{readTime} min read</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-3 group-hover:text-pink-600 dark:group-hover:text-blue-300 transition-colors">
              {post.title}
            </h3>

            <p className="text-slate-600 dark:text-gray-300 leading-relaxed mb-4 line-clamp-3">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {tagsToDisplay.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100/50 dark:bg-white/10 text-slate-700 dark:text-white/80 text-xs"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-gray-400">
                By {post.author}
              </span>
              <span className="text-pink-600 dark:text-blue-400 text-sm font-medium group-hover:underline">
                Read More {'->'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-slate-500 dark:text-gray-400">
                  {defaultDateLabel}
                </span>
                <span className="text-xs text-slate-500 dark:text-gray-400">|</span>
                <span className="text-xs text-slate-500 dark:text-gray-400">{readTime} min read</span>
              </div>

              <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-pink-600 dark:group-hover:text-blue-300 transition-colors">
                {post.title}
              </h4>

              <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed mb-3 line-clamp-2">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap gap-1">
                {tagsToDisplay.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100/50 dark:bg-white/10 text-slate-700 dark:text-white/70 text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="text-pink-600 dark:text-blue-400 hover:text-pink-700 dark:hover:text-blue-300">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        )}
      </div>

      <Portal
        open={isPortalOpen}
        onOpenChange={handleOpenChange}
        title={post.title}
        maxWidth={isFullscreen ? undefined : "max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl"}
        bringToTop
        className={modalClass}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      >
        {/* Modal Header - title + tags/category only */}
        <div className={`flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-border ${isFullscreen ? "bg-background/90" : "bg-background/80"} backdrop-blur ${isFullscreen ? "rounded-none" : "rounded-t-2xl"} sticky top-0 z-10`}>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-semibold truncate text-foreground pr-2 sm:pr-4">{post.title}</h2>
            <div className="mt-1 flex items-center gap-2 overflow-x-auto whitespace-nowrap pr-2">
              {post.tags?.slice(0, 6).map((tag) => (
                <Badge key={tag} variant="secondary" className="px-2 py-0.5 text-[10px] sm:text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <button
            onClick={() => handleOpenChange(false)}
            aria-label="Close"
            className="p-2 rounded-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring flex-shrink-0"
            type="button"
          >
            <X className="h-5 w-5 text-foreground/70" />
          </button>
        </div>
        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-4 sm:py-8">
          <BlogPostContent post={post} />
        </div>
      </Portal>
    </>
  )
}
