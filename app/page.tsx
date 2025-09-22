"use client"

import { ArrowRight, Code, Palette, Zap } from "lucide-react"
import Link from "next/link"

export default function Home() {
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

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 xl:py-20">
        <div className="mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 xl:mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
              <span className="text-sm text-white/80 font-medium">Portfolio</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Building Digital
              </span>
              <br />
              <span className="text-white/90">Experiences</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2 sm:px-0">
              Full-stack developer crafting modern web applications with Next.js, TypeScript, and cutting-edge technologies.
              Passionate about clean code, beautiful design, and exceptional user experiences.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
              <Link href="/projects">
                <button className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg w-full sm:w-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center justify-center gap-2">
                    <Code className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">View My Work</span>
                  </div>
                </button>
              </Link>

              <Link href="/about">
                <button className="group flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 transition-all duration-300 w-full sm:w-auto">
                  <Palette className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">Learn More</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 flex-shrink-0" />
                </button>
              </Link>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="group p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 flex-shrink-0">
                  <Code className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white leading-tight">Full-Stack Development</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed break-words">
                Building end-to-end solutions with modern frameworks like Next.js, React, and Node.js.
              </p>
            </div>

            <div className="group p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 flex-shrink-0">
                  <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white leading-tight">UI/UX Design</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed break-words">
                Creating beautiful, accessible interfaces with Tailwind CSS and modern design principles.
              </p>
            </div>

            <div className="group p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 flex-shrink-0">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white leading-tight">Performance Focus</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed break-words">
                Optimizing applications for speed, accessibility, and exceptional user experiences.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12 sm:mt-16 lg:mt-24 px-4 sm:px-0">
            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 mb-4 sm:mb-6">
              <Zap className="h-4 w-4 text-blue-400 flex-shrink-0" />
              <span className="text-sm text-white/80">Ready to collaborate?</span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 px-2">
              Let&apos;s Build Something Amazing
            </h2>

            <p className="text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base px-4 sm:px-0">
              Whether you have a project in mind or just want to connect, I&apos;d love to hear from you.
              Use the sidebar to explore my work or get in touch.
            </p>

            <Link href="/contact">
              <button className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto">
                <span className="text-sm sm:text-base">Get In Touch</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 flex-shrink-0" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
