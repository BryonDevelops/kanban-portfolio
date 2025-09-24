"use client"

import * as React from "react"
import Link from "next/link"
import { NavMain } from "@/presentation/components/layout/nav-main"
import { sidebarConfig } from "@/presentation/components/layout/sidebar"
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton, useUser, useClerk } from "@clerk/nextjs"
import { ChevronDown, ChevronRight, Settings, LogOut, User } from "lucide-react"

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
  const { state, setOpen } = useSidebar()
  const { user } = useUser()
  const { signOut, openUserProfile } = useClerk()
  const isAdmin = useIsAdmin()
  const [adminOpen, setAdminOpen] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Handle hover to expand/collapse sidebar
  React.useEffect(() => {
    if (isHovered && state === "collapsed") {
      setOpen(true)
    } else if (!isHovered && state === "expanded") {
      // Only auto-collapse if we're not on mobile and the sidebar was expanded due to hover
      const isMobile = window.innerWidth < 768
      if (!isMobile) {
        // Add a longer delay before collapsing to allow time for user interactions like popups
        const timeout = setTimeout(() => setOpen(false), 3000)
        return () => clearTimeout(timeout)
      }
    }
  }, [isHovered, state, setOpen])

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Sidebar collapsible="icon" {...props}>
      {state === "collapsed" && (
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

          {/* Navigation Icons */}
          <div className="flex flex-col items-center py-2 space-y-2">
            {sidebarConfig.navMain.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-sidebar-accent/50 transition-colors duration-200 group"
                  title={item.title}
                >
                  {IconComponent && (
                    <IconComponent className="h-4 w-4 text-sidebar-foreground/70 group-hover:text-sidebar-foreground transition-colors duration-200" />
                  )}
                </Link>
              )
            })}
          </div>

          {isHydrated && isAdmin && sidebarConfig.navAdmin.length > 0 && (
            <div className="flex items-center justify-center py-3 border-t border-sidebar-border/30">
              <Settings className="h-4 w-4 text-red-500" />
            </div>
          )}
        </div>
      )}

      {state !== "collapsed" && (
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
      )}

      {state !== "collapsed" && (
        <SidebarContent className="px-2 pt-6">
          <NavMain items={sidebarConfig.navMain} />

          {/* User Actions */}
          {isHydrated && (
            <SignedIn>
              <div className="mt-4 space-y-1">
                <SidebarSeparator className="mb-2" />
                <button
                  onClick={() => openUserProfile()}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>View Profile</span>
                </button>
                <button
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </SignedIn>
          )}

          {sidebarConfig.navSecondary.length > 0 && (
            <>
              <SidebarSeparator />
              <NavMain items={sidebarConfig.navSecondary} />
            </>
          )}
          {isHydrated && isAdmin && sidebarConfig.navAdmin.length > 0 && (
            <>
              <SidebarSeparator />
              <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
                <CollapsibleTrigger className="flex items-center justify-between px-2 py-2 hover:bg-sidebar-accent/50 rounded-md transition-colors">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-sidebar-foreground/70" />
                    <h3 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                      Admin
                    </h3>
                  </div>
                  {adminOpen ? (
                    <ChevronDown className="h-3 w-3 text-sidebar-foreground/50" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-sidebar-foreground/50" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                  <NavMain items={sidebarConfig.navAdmin} />
                </CollapsibleContent>
              </Collapsible>
            </>
          )}
        </SidebarContent>
      )}

      <SidebarRail />
    </Sidebar>
    </div>
  )
}
