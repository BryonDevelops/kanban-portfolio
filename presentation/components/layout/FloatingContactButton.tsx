"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { MailIcon, User, LogOut } from "lucide-react"
import { ModeToggle } from "@/presentation/components/shared/mode-toggle"
import { useScrollState } from "@/presentation/hooks/use-scroll-state"
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  useUser,
  useClerk
} from "@clerk/nextjs"

export function FloatingActionContainer() {
  const { isTopbarHidden } = useScrollState()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user } = useUser()
  const { signOut, openUserProfile } = useClerk()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`flex flex-col gap-3 transition-all duration-300 ease-in-out ${
        isTopbarHidden
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}>
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

        {/* Auth Dropdown */}
        <div ref={dropdownRef} className="relative">
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-blue-500/90 to-blue-600/90 dark:from-blue-400/80 dark:to-blue-500/80 border border-blue-200/50 dark:border-blue-300/30 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 hover:border-blue-300/60 dark:hover:border-blue-400/40 transition-all duration-300 transform hover:scale-110 cursor-pointer shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            <User className="h-5 w-5 sm:h-6 sm:w-6 text-white flex-shrink-0" />
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Account
              {/* Arrow */}
              <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
            </div>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-xl overflow-hidden">
              <SignedOut>
                <div className="p-2 space-y-1">
                  <SignInButton>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors">
                      <User className="h-4 w-4" />
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors">
                      <User className="h-4 w-4" />
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>

              <SignedIn>
                <div className="p-2 space-y-1">
                  <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    {user?.fullName || user?.primaryEmailAddress?.emailAddress}
                  </div>
                  <button
                    onClick={() => {
                      openUserProfile()
                      setIsDropdownOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                  >
                    <User className="h-4 w-4" />
                    View Profile
                  </button>
                  <button
                    onClick={() => {
                      signOut({ redirectUrl: "/" })
                      setIsDropdownOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </SignedIn>
            </div>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl backdrop-blur-sm">
          <ModeToggle />
        </div>
      </div>
    </div>
  )
}