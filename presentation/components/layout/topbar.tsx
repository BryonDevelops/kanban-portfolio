"use client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/presentation/components/ui/dropdown-menu";
import {
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs"
import { ModeToggle } from "@/presentation/components/shared/mode-toggle"
import { Button } from "@/presentation/components/ui/button"
import { SidebarTrigger } from "@/presentation/components/ui/sidebar"
import Link from "next/link"
import { ArrowRight, Zap, Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState } from "react"

export function Topbar() {
  const pathname = usePathname()
  const isContactPage = pathname === "/contact"
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex w-full items-center justify-between px-2 py-2 md:px-4 md:py-3 bg-transparent backdrop-blur-0">
      {/* Mobile Menu Button - Only visible on mobile */}
      <div className="flex items-center md:hidden">
        <SidebarTrigger className="mr-2" />
      </div>

      {/* Desktop Navigation - Hidden on mobile */}
      <div className="hidden md:flex items-center gap-4">
        <SidebarTrigger />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1 sm:gap-2 ml-auto">
        {!isContactPage && (
          <Link href="/contact" className="hidden sm:block">
            <div className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 dark:from-purple-400/10 dark:to-purple-500/10 border border-purple-200/50 dark:border-purple-300/20 hover:from-purple-600/30 hover:to-purple-700/30 dark:hover:from-purple-500/20 dark:hover:to-purple-600/20 hover:border-purple-300/60 dark:hover:border-purple-400/30 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-700 dark:text-white/90 font-medium">Contact</span>
              <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 transition-transform group-hover:translate-x-0.5 flex-shrink-0 opacity-70" />
            </div>
          </Link>
        )}

        {/* Mobile Contact Button */}
        {!isContactPage && (
          <Link href="/contact" className="sm:hidden">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </Button>
          </Link>
        )}

        <ModeToggle />

        {/* Desktop Auth Buttons */}
        <SignedOut>
          <div className="hidden sm:flex items-center gap-1 sm:gap-2">
            <SignInButton>
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 h-8">Sign in</Button>
            </SignInButton>
            <SignUpButton>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 h-8">Sign up</Button>
            </SignUpButton>
          </div>
        </SignedOut>

        {/* Mobile Auth Menu */}
        <SignedOut>
          <div className="sm:hidden">
            <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <SignInButton>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Sign in
                  </DropdownMenuItem>
                </SignInButton>
                <SignUpButton>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Sign up
                  </DropdownMenuItem>
                </SignUpButton>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SignedOut>
      </div>
    </div>
  )
}
