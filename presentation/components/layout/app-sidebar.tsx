"use client"

import * as React from "react"
import { NavMain } from "@/presentation/components/layout/nav-main"
import { NavUser } from "@/presentation/components/layout/nav-user"
import { sidebarConfig } from "@/presentation/components/layout/sidebar"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/presentation/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon" {...props}>
      {state !== "collapsed" && (
        <SidebarHeader className="border-b border-sidebar-border/50">
          <div className="flex items-center gap-4 px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">

            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-sidebar-foreground truncate">Portfolio</span>
              <span className="text-xs text-sidebar-foreground/70 truncate">Developer</span>
            </div>
          </div>
        </SidebarHeader>
      )}

      <SidebarContent className="px-2 pt-6">
        <NavMain items={sidebarConfig.navMain} />
        {sidebarConfig.navSecondary.length > 0 && (
          <>
            <SidebarSeparator />
            <NavMain items={sidebarConfig.navSecondary} />
          </>
        )}
      </SidebarContent>

      {/* <SidebarFooter className="border-t border-sidebar-border/50">
        <NavUser user={sidebarConfig.user} />
      </SidebarFooter> */}

      <SidebarRail />
    </Sidebar>
  )
}
