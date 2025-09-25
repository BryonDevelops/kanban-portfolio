"use client"

import { BlogPostPortal, BlogPost } from '../../presentation/components/features/blog/BlogPostPortal'

import { Badge } from '../../presentation/components/ui/badge'
import { Clock, ArrowRight, BookOpen, Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/presentation/components/ui/button"
import { SectionBadge } from "@/presentation/components/shared/section-badge"
import { recentPosts } from './data/blog-posts'
import { featuredPosts } from './data/blog-post-featured'
import { categories } from './data/blog-post-categories'
import { AdminControls } from '../../presentation/components/features/blog/AdminControls'

export default function MicroblogPage() {
  // Admin handlers (these would typically update state or make API calls)
  const handleCreatePost = (post: Omit<BlogPost, 'id'>) => {
    console.log('Creating post:', post)
    // TODO: Implement post creation logic
    // This could update local state, make API calls, etc.
  }

  const handleEditPost = (postId: string, updates: Partial<BlogPost>) => {
    console.log('Editing post:', postId, updates)
    // TODO: Implement post editing logic
  }

  const handleDeletePost = (postId: string) => {
    console.log('Deleting post:', postId)
    // TODO: Implement post deletion logic
  }

  // Get admin components
  const adminControls = AdminControls({
    onCreatePost: handleCreatePost,
    onEditPost: handleEditPost,
    onDeletePost: handleDeletePost
  })

  return (
    <div className="relative min-h-screen">
      {/* Full screen background */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-50/80 via-blue-50/60 to-purple-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -z-10" />

      {/* Enhanced Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary gradient orbs */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-pink-300/20 via-purple-300/20 to-blue-300/20 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-cyan-300/20 via-emerald-300/20 to-teal-300/20 dark:from-emerald-500/20 dark:via-cyan-500/20 dark:to-blue-500/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Secondary accent orbs */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-r from-violet-300/15 to-fuchsia-300/15 dark:from-violet-500/10 dark:to-fuchsia-500/10 blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-16 sm:mb-20 lg:mb-24">
            <SectionBadge text="Microblog" className="mb-6" />

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-800 via-pink-600 to-purple-600 dark:from-white dark:via-blue-100 dark:to-purple-200 bg-clip-text text-transparent">
                Thoughts & Insights
              </span>
              <br />
              <span className="text-slate-800 dark:text-white/90">From Code to Creation</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Sharing my journey through web development, design principles, and the latest in technology.
              Quick insights, deep dives, and everything in between.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button className="group relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-600 dark:from-blue-600 dark:via-purple-600 dark:to-pink-600 hover:from-pink-400 hover:via-purple-500 hover:to-cyan-500 dark:hover:from-blue-500 dark:hover:via-purple-500 dark:hover:to-pink-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-3">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium">Read Latest</span>
                </div>
              </Button>

              {adminControls.isAdmin && (
                <adminControls.CreatePostButton />
              )}

              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400">
                <TrendingUp className="h-4 w-4" />
                <span>Weekly insights on web development</span>
              </div>
            </div>
          </div>

          {/* Featured Posts */}
          <div className="mb-16 sm:mb-20 lg:mb-24">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="h-6 w-6 text-pink-500 dark:text-yellow-400" />
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Featured Posts</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {featuredPosts.map((post) => (
                <BlogPostPortal
                  key={post.id}
                  post={post}
                  trigger={
                    <div className="group relative overflow-hidden bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-pink-200/50 dark:border-white/10 rounded-2xl hover:border-pink-300/50 dark:hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-200/20 dark:hover:shadow-white/5 cursor-pointer">
                      {/* Featured badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <div className="bg-gradient-to-r from-pink-500 to-purple-600 dark:from-yellow-500 dark:to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          Featured
                        </div>
                      </div>

                      {/* Admin buttons */}
                      {adminControls.isAdmin && (
                        <div className="absolute top-4 left-4 z-10">
                          <adminControls.PostAdminButtons post={post} />
                        </div>
                      )}

                      <div className="p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs text-slate-500 dark:text-gray-400">
                            {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-gray-400">•</span>
                          <span className="text-xs text-slate-500 dark:text-gray-400">{post.readTime} min read</span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-3 group-hover:text-pink-600 dark:group-hover:text-blue-300 transition-colors">
                          {post.title}
                        </h3>

                        <p className="text-slate-600 dark:text-gray-300 leading-relaxed mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tag) => (
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
                            Read More →
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                />
              ))}
            </div>
          </div>

          {/* Categories & Recent Posts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Categories</h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div
                      key={category.name}
                      className="group flex items-center justify-between p-4 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-pink-200/50 dark:border-white/10 hover:border-pink-300/50 dark:hover:border-white/20 transition-all duration-300 hover:scale-105 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${category.color}`} />
                        <span className="text-slate-700 dark:text-white/90 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                          {category.name}
                        </span>
                      </div>
                      <span className="text-xs text-slate-600 dark:text-white/60 bg-pink-100/50 dark:bg-white/10 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <Clock className="h-5 w-5 text-pink-500 dark:text-blue-400" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Recent Posts</h3>
              </div>

              <div className="space-y-6">
                {recentPosts.map((post) => (
                  <BlogPostPortal
                    key={post.id}
                    post={post}
                    trigger={
                      <div className="group relative p-6 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-pink-200/50 dark:border-white/10 hover:border-pink-300/50 dark:hover:border-white/20 transition-all duration-300 hover:scale-[1.01] cursor-pointer">
                        {/* Admin buttons */}
                        {adminControls.isAdmin && (
                          <div className="absolute top-4 right-4 z-10">
                            <adminControls.PostAdminButtons post={post} />
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-slate-500 dark:text-gray-400">
                                {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-gray-400">•</span>
                              <span className="text-xs text-slate-500 dark:text-gray-400">{post.readTime} min read</span>
                            </div>

                            <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-pink-600 dark:group-hover:text-blue-300 transition-colors">
                              {post.title}
                            </h4>

                            <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed mb-3 line-clamp-2">
                              {post.excerpt}
                            </p>

                            <div className="flex flex-wrap gap-1">
                              {post.tags.slice(0, 2).map((tag) => (
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
                      </div>
                    }
                  />
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-8">
                <Button variant="outline" className="border-pink-200/50 dark:border-white/20 bg-white/80 dark:bg-white/5 hover:bg-pink-50 dark:hover:bg-white/10 text-slate-700 dark:text-white px-6 py-3">
                  Load More Posts
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Edit Dialog */}
      {adminControls.isAdmin && <adminControls.EditPostDialog />}
    </div>
  )
}