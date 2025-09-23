"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MailIcon } from "lucide-react"
import { ModeToggle } from "@/presentation/components/shared/mode-toggle"

export function FloatingActionContainer() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show the floating container when scrolled past 100px (when topbar is likely hidden)
      const scrollY = window.scrollY
      setIsVisible(scrollY > 100)
    }

    // Check initial scroll position
    handleScroll()

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col gap-3">
        {/* Contact Button */}
        <Link href="/contact">
          <div className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-purple-500/90 to-purple-600/90 dark:from-purple-400/80 dark:to-purple-500/80 border border-purple-200/50 dark:border-purple-300/30 hover:from-purple-600 hover:to-purple-700 dark:hover:from-purple-500 dark:hover:to-purple-600 hover:border-purple-300/60 dark:hover:border-purple-400/40 transition-all duration-300 transform hover:scale-110 cursor-pointer shadow-lg hover:shadow-xl backdrop-blur-sm">
            <MailIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white flex-shrink-0" />
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Ready to collaborate?
              {/* Arrow */}
              <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
            </div>
          </div>
        </Link>

        {/* Mode Toggle */}
        <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl backdrop-blur-sm">
          <ModeToggle />
        </div>
      </div>
    </div>
  )
}