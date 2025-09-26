"use client"

import * as React from "react"
import Link from "next/link"
import { NavMain } from "@/presentation/components/layout/nav-main"
import { sidebarConfig } from "@/presentation/components/layout/sidebar"
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton, useUser, useClerk } from "@clerk/nextjs"
import { ChevronDown, ChevronRight, Settings, LogOut, User, Pin, PinOff, Monitor, Minimize2 } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/presentation/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/presentation/components/ui/collapsible"
import { useIsAdmin } from "@/presentation/components/shared/ProtectedRoute"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, setOpen, isMobile, openMobile, setOpenMobile } = useSidebar()
  const { user } = useUser()
  const { signOut, openUserProfile } = useClerk()
  const isAdmin = useIsAdmin()
  const [adminOpen, setAdminOpen] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  const [isHydrated, setIsHydrated] = React.useState(false)
  const [userPreference, setUserPreference] = React.useState<'auto' | 'pinned' | 'collapsed'>('auto')

  React.useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Load user preference from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('sidebar_preference')
    if (saved) {
      setUserPreference(saved as 'auto' | 'pinned' | 'collapsed')
    }
  }, [])

  // Save user preference to localStorage
  const savePreference = React.useCallback((preference: 'auto' | 'pinned' | 'collapsed') => {
    setUserPreference(preference)
    localStorage.setItem('sidebar_preference', preference)
  }, [])

  // Enhanced hover behavior with user preference awareness
  React.useEffect(() => {
    if (userPreference === 'pinned') return // Don't auto-collapse if pinned
    if (userPreference === 'collapsed') return // Don't auto-expand if collapsed

    if (isHovered && state === "collapsed" && !isMobile) {
      setOpen(true)
    } else if (!isHovered && state === "expanded" && !isMobile) {
      // Shorter delay for better UX
      const timeout = setTimeout(() => setOpen(false), 1500)
      return () => clearTimeout(timeout)
    }
  }, [isHovered, state, setOpen, isMobile, userPreference])

  // Enhanced keyboard shortcuts with preference cycling
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + B to toggle sidebar
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault()
        if (isMobile) {
          setOpenMobile(!openMobile)
        } else {
          setOpen(state === 'expanded' ? false : true)
        }
      }

      // Ctrl/Cmd + Shift + B to cycle through sidebar preferences
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'b') {
        event.preventDefault()
        const preferences: ('auto' | 'pinned' | 'collapsed')[] = ['auto', 'pinned', 'collapsed']
        const currentIndex = preferences.indexOf(userPreference)
        const nextIndex = (currentIndex + 1) % preferences.length
        const nextPreference = preferences[nextIndex]

        savePreference(nextPreference)

        // Apply the preference immediately
        switch (nextPreference) {
          case 'auto':
            setOpen(false)
            break
          case 'pinned':
            setOpen(true)
            break
          case 'collapsed':
            setOpen(false)
            break
        }
      }

      // Escape to close sidebar (mobile)
      if (event.key === 'Escape' && isMobile && openMobile) {
        setOpenMobile(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [state, setOpen, isMobile, openMobile, setOpenMobile, userPreference, savePreference])

  // Touch/swipe handling for mobile
  const touchStartRef = React.useRef<number | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const touchEnd = e.changedTouches[0].clientX
    const deltaX = touchEnd - touchStartRef.current

    // Swipe right to open (from left edge)
    if (deltaX > 50 && touchStartRef.current < 50 && !openMobile) {
      setOpenMobile(true)
    }
    // Swipe left to close
    else if (deltaX < -50 && openMobile) {
      setOpenMobile(false)
    }

    touchStartRef.current = null
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Sidebar collapsible="icon" {...props}>
      {/* Show full content on mobile when sidebar is open, or on desktop when not collapsed */}
      {(isMobile ? openMobile : state !== "collapsed") && (
        <>
          <SidebarHeader className="relative overflow-hidden border-b border-sidebar-border/30 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 dark:from-pink-500/20 dark:via-purple-500/20 dark:to-blue-500/20">
            {/* Subtle animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />

            <div className="relative flex flex-col gap-3 px-4 py-4">
              {/* Signed In User */}
              {isHydrated && (
                <SignedIn>
                  <div className="flex items-center justify-center w-full">
                    <div className="flex items-center gap-2">
                      <UserButton />
                      <span className="text-lg font-bold text-pink-600 dark:text-pink-400 truncate">
                        {user?.fullName}
                      </span>
                    </div>
                  </div>
                </SignedIn>
              )}

              {/* Signed Out - Auth Buttons */}
              {isHydrated && (
                <SignedOut>
                  <div className="flex flex-col gap-2">
                    <div className="text-center">
                      <h3 className="text-sm font-medium text-sidebar-foreground/80 mb-3">Welcome!</h3>
                    </div>
                    <div className="flex flex-col gap-2">
                      <SignInButton>
                        <button className="w-full px-3 py-2 text-sm font-medium text-sidebar-foreground bg-sidebar-accent/50 hover:bg-sidebar-accent/70 border border-sidebar-border/50 rounded-md transition-colors">
                          Sign In
                        </button>
                      </SignInButton>
                      <SignUpButton>
                        <button className="w-full px-3 py-2 text-sm font-medium text-sidebar-foreground bg-gradient-to-r from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 border border-purple-400/30 rounded-md transition-all duration-200">
                          Sign Up
                        </button>
                      </SignUpButton>
                    </div>
                  </div>
                </SignedOut>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 pt-6">
            {/* Main Navigation with enhanced styling */}
            <div className="space-y-2">
              <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-3">
                Navigation
              </h3>
              <NavMain items={sidebarConfig.navMain} />
            </div>

            {/* User Actions */}
            {isHydrated && (
              <SignedIn>
                <div className="mt-6 space-y-1">
                  <SidebarSeparator className="mb-3" />
                  <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-3">
                    Account
                  </h3>
                  <button
                    onClick={() => openUserProfile()}
                    className="group flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-purple-500/10 dark:hover:from-blue-500/10 dark:hover:to-purple-500/10 hover:text-pink-600 dark:hover:text-blue-400 rounded-lg transition-all duration-200 hover:shadow-sm"
                  >
                    <User className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>View Profile</span>
                    <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </button>
                  <button
                    onClick={() => signOut({ redirectUrl: "/" })}
                    className="group flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-gradient-to-r hover:from-red-500/10 hover:to-pink-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all duration-200 hover:shadow-sm"
                  >
                    <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>Log Out</span>
                    <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </button>
                </div>
              </SignedIn>
            )}

            {/* Sidebar Preferences - Desktop Only */}
            {!isMobile && (
              <div className="mt-6 space-y-1">
                <SidebarSeparator className="mb-3" />
                <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-3">
                  Sidebar
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      savePreference('auto')
                      setOpen(false)
                    }}
                    className={`group flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-sm ${
                      userPreference === 'auto'
                        ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 dark:from-blue-500/20 dark:to-purple-500/20 text-pink-600 dark:text-blue-400'
                        : 'text-sidebar-foreground hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-purple-500/10 dark:hover:from-blue-500/10 dark:hover:to-purple-500/10 hover:text-pink-600 dark:hover:text-blue-400'
                    }`}
                  >
                    <Monitor className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>Auto (Hover)</span>
                    {userPreference === 'auto' && <div className="ml-auto w-2 h-2 bg-pink-500 dark:bg-blue-500 rounded-full" />}
                  </button>
                  <button
                    onClick={() => {
                      savePreference('pinned')
                      setOpen(true)
                    }}
                    className={`group flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-sm ${
                      userPreference === 'pinned'
                        ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 dark:from-blue-500/20 dark:to-purple-500/20 text-pink-600 dark:text-blue-400'
                        : 'text-sidebar-foreground hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-purple-500/10 dark:hover:from-blue-500/10 dark:hover:to-purple-500/10 hover:text-pink-600 dark:hover:text-blue-400'
                    }`}
                  >
                    <Pin className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>Always Open</span>
                    {userPreference === 'pinned' && <div className="ml-auto w-2 h-2 bg-pink-500 dark:bg-blue-500 rounded-full" />}
                  </button>
                  <button
                    onClick={() => {
                      savePreference('collapsed')
                      setOpen(false)
                    }}
                    className={`group flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-sm ${
                      userPreference === 'collapsed'
                        ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 dark:from-blue-500/20 dark:to-purple-500/20 text-pink-600 dark:text-blue-400'
                        : 'text-sidebar-foreground hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-purple-500/10 dark:hover:from-blue-500/10 dark:hover:to-purple-500/10 hover:text-pink-600 dark:hover:text-blue-400'
                    }`}
                  >
                    <Minimize2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>Always Closed</span>
                    {userPreference === 'collapsed' && <div className="ml-auto w-2 h-2 bg-pink-500 dark:bg-blue-500 rounded-full" />}
                  </button>
                </div>
              </div>
            )}

            {sidebarConfig.navSecondary.length > 0 && (
              <>
                <SidebarSeparator className="mt-6" />
                <div className="space-y-2">
                  <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-3">
                    Tools
                  </h3>
                  <NavMain items={sidebarConfig.navSecondary} />
                </div>
              </>
            )}
            {isHydrated && isAdmin && sidebarConfig.navAdmin.length > 0 && (
              <>
                <SidebarSeparator className="mt-6" />
                <div className="space-y-2">
                  <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
                    <CollapsibleTrigger className="group flex items-center justify-between w-full px-3 py-2 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-pink-500/10 rounded-lg transition-all duration-200">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-red-500 group-hover:scale-110 transition-transform duration-200" />
                        <h3 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                          Admin Panel
                        </h3>
                      </div>
                      {adminOpen ? (
                        <ChevronDown className="h-3 w-3 text-sidebar-foreground/50 group-hover:text-red-500 transition-colors duration-200" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-sidebar-foreground/50 group-hover:text-red-500 transition-colors duration-200" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 mt-2 ml-4 border-l-2 border-red-500/20 pl-4">
                      <NavMain items={sidebarConfig.navAdmin} />
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </>
            )}
          </SidebarContent>
        </>
      )}

      {/* Show collapsed state only on desktop when not mobile */}
      {!isMobile && state === "collapsed" && (
        <div>
          <SidebarHeader className="border-b border-sidebar-border/30">
            <div className="flex items-center justify-center py-3">
              {isHydrated && (
                <SignedIn>
                  <UserButton />
                </SignedIn>
              )}
            </div>
          </SidebarHeader>

          {/* Navigation Icons - Enhanced */}
          <div className="flex flex-col items-center py-4 space-y-1">
            {sidebarConfig.navMain.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className="group relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-500/20 dark:hover:from-blue-500/20 dark:hover:to-purple-500/20 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/25 dark:hover:shadow-blue-500/25"
                  title={item.title}
                  aria-label={item.description || item.title}
                >
                  {IconComponent && (
                    <IconComponent className="h-5 w-5 text-sidebar-foreground/60 group-hover:text-pink-500 dark:group-hover:text-blue-400 transition-all duration-300 group-hover:scale-110" />
                  )}
                  {/* Active indicator */}
                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-pink-500 to-purple-500 dark:from-blue-500 dark:to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Tooltip on hover */}
                  <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                    {item.title}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-slate-800 dark:border-r-slate-700"></div>
                  </div>
                </Link>
              )
            })}
          </div>

          {isHydrated && isAdmin && sidebarConfig.navAdmin.length > 0 && (
            <div className="flex items-center justify-center py-3 border-t border-sidebar-border/30">
              <div className="group relative">
                <Settings className="h-5 w-5 text-red-500 hover:text-red-400 transition-colors duration-200 hover:scale-110 cursor-pointer" />
                {/* Tooltip for admin indicator */}
                <div className="absolute left-full ml-3 px-2 py-1 bg-red-800 dark:bg-red-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  Admin Panel
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-red-800 dark:border-r-red-700"></div>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Settings - Only show when Always Closed */}
          {userPreference === 'collapsed' && (
            <div className="flex flex-col items-center py-3 border-t border-sidebar-border/30 space-y-2 mt-auto">
              {/* Current mode indicator */}
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
              </div>

              {/* Settings button */}
              <div className="group relative">
                <button
                  onClick={() => setOpen(true)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-500/20 dark:hover:from-blue-500/20 dark:hover:to-purple-500/20 transition-all duration-300 hover:scale-110"
                  aria-label="Open sidebar settings"
                >
                  <Settings className="h-4 w-4 text-sidebar-foreground/60 group-hover:text-pink-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                </button>
                {/* Tooltip */}
                <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  Open sidebar settings
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-slate-800 dark:border-r-slate-700"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <SidebarRail />
    </Sidebar>
    </div>
  )
}
