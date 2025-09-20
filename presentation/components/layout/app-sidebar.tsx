"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

<<<<<<<< HEAD:presentation/components/layout/app-sidebar.tsx
import { NavMain } from "@/presentation/components/layout/nav-main"
import { NavUser } from "@/presentation/components/layout/nav-user"
========
import { NavMain } from "./nav-main"
import { NavUser } from "../user/nav-user"
>>>>>>>> origin/master:presentation/components/shared/app-sidebar.tsx

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
<<<<<<<< HEAD:presentation/components/layout/app-sidebar.tsx
} from "@/presentation/components/ui/sidebar"
========
} from "../ui/sidebar"
>>>>>>>> origin/master:presentation/components/shared/app-sidebar.tsx

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Projects",
      url: "/projects",
      icon: Frame,
    },
    {
      title: "API",
      url: "/api-docs",
      icon: BookOpen,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
