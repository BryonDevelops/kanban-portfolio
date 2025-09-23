"use client"

import * as React from "react"
import Link from "next/link"
import { NavMain } from "@/presentation/components/layout/nav-main"
import { sidebarConfig } from "@/presentation/components/layout/sidebar"
import { SignedIn, UserButton, useUser } from "@clerk/nextjs"
import { ChevronDown, ChevronRight, Settings } from "lucide-react"

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
                  <UserButton afterSignOutUrl="/" />
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

          <div className="relative flex items-center gap-3 px-4 py-4">
            {/* User Button */}
            {isHydrated && (
              <SignedIn>
                <div className="flex items-center justify-center">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            )}
            <div className="flex flex-col min-w-0 flex-1 ml-2">
              <span className="text-sm font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent truncate">
                {user?.firstName}
              </span>
            </div>

            {/* Decorative element */}
            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 animate-pulse" />
          </div>
        </SidebarHeader>
      )}

      {state !== "collapsed" && (
        <SidebarContent className="px-2 pt-6">
          <NavMain items={sidebarConfig.navMain} />
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
