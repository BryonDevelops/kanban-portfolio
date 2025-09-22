"use client"

import { type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/presentation/components/ui/sidebar"
import { useIsLarge } from "@/presentation/hooks/use-large"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    description?: string
    isActive?: boolean
  }[]
}) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const isLarge = useIsLarge()

  const handleNavClick = () => {
    // Close sidebar on mobile/tablet and large screens when navigation item is clicked
    if (isMobile || isLarge) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                className="group relative overflow-hidden transition-all duration-200 hover:bg-sidebar-accent/50"
              >
                <Link href={item.url} onClick={handleNavClick} className="flex items-center gap-3 w-full min-w-0">
                  {item.icon && (
                    <item.icon className={`h-4 w-4 transition-colors duration-200 flex-shrink-0 ${
                      isActive
                        ? 'text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'
                    }`} />
                  )}
                  <span className={`transition-colors duration-200 truncate ${
                    isActive
                      ? 'text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground group-hover:text-sidebar-foreground'
                  }`}>
                    {item.title}
                  </span>
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-r-full" />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
