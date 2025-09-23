"use client"

import {
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs"
import { ModeToggle } from "@/presentation/components/shared/mode-toggle"
import { Button } from "@/presentation/components/ui/button"
import { SidebarTrigger } from "@/presentation/components/ui/sidebar"
import Link from "next/link"
import { ArrowRight, Zap } from "lucide-react"
import { usePathname } from "next/navigation"

export function Topbar() {
  const pathname = usePathname()
  const isContactPage = pathname === "/contact"

  return (
    <div className="flex w-full items-center gap-2 sm:gap-4 px-2 md:pb-6 bg-transparent backdrop-blur-0">

      <div className="ml-auto flex items-center justify-center gap-2 sm:gap-4 pr-2 sm:pr-4">
        {!isContactPage && (
          <Link href="/contact">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 dark:from-purple-400/10 dark:to-purple-500/10 border border-purple-200/50 dark:border-purple-300/20 hover:from-purple-600/30 hover:to-purple-700/30 dark:hover:from-purple-500/20 dark:hover:to-purple-600/20 hover:border-purple-300/60 dark:hover:border-purple-400/30 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl">
              <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-white/90 font-medium hidden sm:inline">Contact</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 flex-shrink-0 opacity-70" />
            </div>
          </Link>
        )}
        <ModeToggle />
        <SignedOut>
          <div className="flex items-center gap-1 sm:gap-2">
            <SignInButton>
              <Button variant="ghost" size="sm" className="text-sm px-2 sm:px-3">Sign in</Button>
            </SignInButton>
            <SignUpButton>
              <Button variant="outline" size="sm" className="text-sm px-2 sm:px-3">Sign up</Button>
            </SignUpButton>
          </div>
        </SignedOut>
      </div>
    </div>
  )
}
