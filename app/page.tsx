"use client"

import { ArrowRight, Code, Palette, Zap, Layers } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react";
import { FeatureHighlightCard } from "../presentation/components/shared/FeatureHighlightCard";

// Typewriter component for cycling through words
function Typewriter({ words, className }: { words: string[], className?: string }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(125)

  useEffect(() => {
    const currentWord = words[currentWordIndex]

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        setCurrentText(currentWord.substring(0, currentText.length + 1))
        setTypingSpeed(typingSpeed)

        if (currentText === currentWord) {
          // Finished typing, wait before deleting
          setTimeout(() => setIsDeleting(true), 3000)
        }
      } else {
        // Deleting
        setCurrentText(currentWord.substring(0, currentText.length - 1))
        setTypingSpeed(100)

        if (currentText === "") {
          // Finished deleting, move to next word
          setIsDeleting(false)
          setCurrentWordIndex((prev) => (prev + 1) % words.length)
        }
      }
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed])

  return (
    <span className={className}>
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Full screen background - extends completely behind everything */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50/80 via-blue-50/60 to-purple-50/80 dark:from-slate-950 dark:via-purple-950/30 dark:to-slate-950 -z-15" />

      {/* Enhanced Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary gradient orbs */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-purple-300/20 via-purple-400/20 to-pink-300/20 dark:from-purple-500/10 dark:via-purple-600/10 dark:to-pink-500/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-purple-300/20 via-blue-300/20 to-purple-400/20 dark:from-purple-500/10 dark:via-blue-500/10 dark:to-purple-600/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Secondary accent orbs */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-r from-purple-300/15 to-purple-400/15 dark:from-purple-500/5 dark:to-purple-600/5 blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-2 sm:mb-4 lg:mb-8 xl:mb-12">
            {/* Sleek Brand Header */}
            <div className="relative mb-2 sm:mb-4">
              <div className="relative inline-block">
                {/* Main header container */}
                <div className="px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-slate-50/80 via-white/90 to-slate-50/80 dark:from-slate-800/80 dark:via-slate-900/90 dark:to-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                  {/* Animated underline */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent w-0 group-hover:w-full transition-all duration-700 ease-out" />

                  {/* Brand text */}
                  <h2 className="text-2xl sm:text-3xl lg:text-6xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                    <span className="relative">
                      Bryon
                      {/* Subtle glow effect */}
                      <span className="absolute inset-0 text-slate-800/20 dark:text-slate-100/20 blur-sm scale-105" />
                    </span>
                    <span className="text-purple-600 dark:text-purple-400 ml-2 sm:ml-3">
                      Bauer
                    </span>
                  </h2>

                  {/* Minimal accent elements */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>

                {/* Subtle shadow/glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 dark:from-purple-400/5 dark:via-transparent dark:to-blue-400/5 blur-xl scale-105 -z-10" />
              </div>
            </div>

            {/* Hero Image */}
            <div className="mb-2 sm:mb-4 lg:mb-6 relative">
              <div className="relative mx-auto w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 2xl:w-96 2xl:h-96">
                {/* Glow effect behind image */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-pink-400/10 blur-2xl sm:blur-3xl scale-110 animate-pulse" />
                <Image
                  src="/heroimg_dark_optimized.webp"
                  alt="Hero illustration"
                  fill
                  sizes="(max-width: 640px) 160px, (max-width: 768px) 224px, (max-width: 1024px) 256px, (max-width: 1280px) 288px, (max-width: 1536px) 320px, 384px"
                  className="object-contain drop-shadow-xl sm:drop-shadow-2xl relative z-10 transform hover:scale-105 transition-transform duration-500"
                  priority
                  quality={85}
                />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-1 sm:mb-2 relative">
              <span className="relative inline-block">
                <span className="text-purple-600 dark:text-purple-400">
                  Building{" "}
                </span>
                <Typewriter
                  words={["Digital", "Modern", "Scalable", "Beautiful", "Innovative"]}
                  className="text-purple-600 dark:text-purple-400"
                />
                {/* Glow effect */}
                <span className="absolute inset-0 text-purple-600/20 dark:text-purple-400/20 blur-xl scale-110 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </span>
              <br />
              <span className="relative inline-block text-gray-900 dark:text-white/90 drop-shadow-lg">
                Experiences
                {/* Subtle glow for second line */}
                <span className="absolute inset-0 text-gray-900/20 dark:text-white/10 blur-sm scale-105" />
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-2 sm:mb-4 px-2 sm:px-0">
              Full-stack developer crafting modern web applications with Next.js, TypeScript, and cutting-edge technologies.
              Passionate about clean code, beautiful design, and exceptional user experiences.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-4 sm:mb-6">
              <Link href="/projects">
                <button className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 hover:from-purple-500 hover:via-purple-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg w-full sm:w-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center justify-center gap-2">
                    <Code className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">View My Work</span>
                  </div>
                </button>
              </Link>

              <Link href="/about">
                <button className="group flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg border-2 border-purple-600/60 dark:border-purple-400/60 bg-white/90 dark:bg-white/5 backdrop-blur-sm text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-700 dark:hover:border-purple-300 transition-all duration-300 w-full sm:w-auto">
                  <Palette className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">Learn More</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 flex-shrink-0" />
                </button>
              </Link>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-4 sm:mt-6 lg:mt-8">
            <FeatureHighlightCard
              icon={Code}
              title="Full-Stack Development"
              description="Building end-to-end solutions with modern frameworks like Next.js, React, and Node.js."
              gradientFrom="from-purple-500"
              gradientTo="to-purple-700"
            />

            <FeatureHighlightCard
              icon={Palette}
              title="UI/UX Design"
              description="Creating beautiful, accessible interfaces with Tailwind CSS and modern design principles."
              gradientFrom="from-purple-600"
              gradientTo="to-purple-800"
            />

            <FeatureHighlightCard
              icon={Layers}
              title="Cloud Infrastructure"
              description="Designing scalable, secure cloud architectures on platforms like AWS and Azure."
              gradientFrom="from-purple-700"
              gradientTo="to-purple-900"
            />
          </div>

          {/* Call to Action */}
          <div className="text-center mt-4 sm:mt-6 lg:mt-8 px-4 sm:px-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 px-2">
              Let&apos;s Build Something Amazing
            </h2>

            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-2 sm:mb-4 leading-relaxed text-sm sm:text-base px-4 sm:px-0">
              Whether you have a project in mind or just want to connect, I&apos;d love to hear from you.
              Use the sidebar to explore my work or get in touch.
            </p>

            <Link href="/contact">
              <div className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 dark:from-purple-400/10 dark:to-purple-500/10 border border-purple-200/50 dark:border-purple-300/20 hover:from-purple-600/30 hover:to-purple-700/30 dark:hover:from-purple-500/20 dark:hover:to-purple-600/20 hover:border-purple-300/60 dark:hover:border-purple-400/30 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl">
                <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span className="text-base sm:text-lg text-gray-700 dark:text-white/90 font-medium">Ready to collaborate?</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 flex-shrink-0 ml-1" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
