"use client"

import { Calendar, Clock, ArrowRight, Tag, BookOpen, Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/presentation/components/ui/button"

export default function MicroblogPage() {
  const featuredPosts = [
    {
      id: 1,
      title: "Building Modern Web Apps with Next.js 14",
      excerpt: "Exploring the latest features in Next.js 14 including server components, app router, and improved performance optimizations.",
      date: "2024-09-20",
      readTime: "5 min read",
      category: "Development",
      tags: ["Next.js", "React", "Web Development"],
      featured: true
    },
    {
      id: 2,
      title: "The Future of TypeScript in 2025",
      excerpt: "A deep dive into upcoming TypeScript features and how they're shaping the future of JavaScript development.",
      date: "2024-09-18",
      readTime: "7 min read",
      category: "Technology",
      tags: ["TypeScript", "JavaScript", "Programming"],
      featured: true
    }
  ]

  const recentPosts = [
    {
      id: 3,
      title: "Mastering Tailwind CSS Grid Layouts",
      excerpt: "Advanced techniques for creating responsive grid layouts with Tailwind CSS utility classes.",
      date: "2024-09-15",
      readTime: "4 min read",
      category: "Design",
      tags: ["Tailwind CSS", "CSS", "Frontend"]
    },
    {
      id: 4,
      title: "Optimizing React Performance",
      excerpt: "Essential techniques for improving React application performance and user experience.",
      date: "2024-09-12",
      readTime: "6 min read",
      category: "Performance",
      tags: ["React", "Performance", "JavaScript"]
    },
    {
      id: 5,
      title: "Building Accessible Web Components",
      excerpt: "Best practices for creating inclusive web components that work for everyone.",
      date: "2024-09-10",
      readTime: "5 min read",
      category: "Accessibility",
      tags: ["Accessibility", "Web Standards", "UX"]
    },
    {
      id: 6,
      title: "The Rise of Edge Computing",
      excerpt: "Understanding how edge computing is changing the way we build and deploy applications.",
      date: "2024-09-08",
      readTime: "8 min read",
      category: "Technology",
      tags: ["Edge Computing", "Cloud", "Architecture"]
    }
  ]

  const categories = [
    { name: "Development", count: 12, color: "from-blue-500 to-cyan-500" },
    { name: "Design", count: 8, color: "from-purple-500 to-pink-500" },
    { name: "Technology", count: 15, color: "from-green-500 to-emerald-500" },
    { name: "Performance", count: 6, color: "from-orange-500 to-red-500" },
    { name: "Accessibility", count: 4, color: "from-teal-500 to-blue-500" }
  ]

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.name === category)
    return cat?.color || "from-gray-500 to-gray-600"
  }

  return (
    <div className="relative min-h-screen">
      {/* Full screen background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 -z-10" />

      {/* Enhanced Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary gradient orbs */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-blue-500/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Secondary accent orbs */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-16 sm:mb-20 lg:mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
              <span className="text-sm text-white/80 font-medium">Microblog</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Thoughts & Insights
              </span>
              <br />
              <span className="text-white/90">From Code to Creation</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Sharing my journey through web development, design principles, and the latest in technology.
              Quick insights, deep dives, and everything in between.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-3">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium">Read Latest</span>
                </div>
              </Button>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <TrendingUp className="h-4 w-4" />
                <span>Weekly insights on web development</span>
              </div>
            </div>
          </div>

          {/* Featured Posts */}
          <div className="mb-16 sm:mb-20 lg:mb-24">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="h-6 w-6 text-yellow-400" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Featured Posts</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {featuredPosts.map((post) => (
                <div
                  key={post.id}
                  className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-white/5"
                >
                  {/* Featured badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      Featured
                    </div>
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getCategoryColor(post.category)} text-white text-xs font-medium`}>
                        {post.category}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </div>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-gray-300 leading-relaxed mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 text-white/80 text-xs rounded-md"
                        >
                          <Tag className="h-2 w-2" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Button variant="ghost" className="group/btn p-0 h-auto text-blue-400 hover:text-blue-300 hover:bg-transparent">
                      <span className="flex items-center gap-2">
                        Read More
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories & Recent Posts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <h3 className="text-xl font-bold text-white mb-6">Categories</h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div
                      key={category.name}
                      className="group flex items-center justify-between p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${category.color}`} />
                        <span className="text-white/90 group-hover:text-white transition-colors">
                          {category.name}
                        </span>
                      </div>
                      <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
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
                <Clock className="h-5 w-5 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Recent Posts</h3>
              </div>

              <div className="space-y-6">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="group p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`px-2 py-1 rounded-md bg-gradient-to-r ${getCategoryColor(post.category)} text-white text-xs font-medium`}>
                            {post.category}
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">{post.readTime}</span>
                        </div>

                        <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                          {post.title}
                        </h4>

                        <p className="text-gray-300 text-sm leading-relaxed mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>

                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 text-white/70 text-xs rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-white/10">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-8">
                <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white px-6 py-3">
                  Load More Posts
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}