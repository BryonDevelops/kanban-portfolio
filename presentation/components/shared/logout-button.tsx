"use client"

import { LogOut } from "lucide-react"
import { getSupabase } from '../../../infrastructure/database/supabaseClient'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
<<<<<<<< HEAD:presentation/components/shared/logout-button.tsx
} from "@/presentation/components/ui/sidebar"
========
} from "../ui/sidebar"
>>>>>>>> origin/master:presentation/components/user/logout-button.tsx

export function LogoutButton() {
  const onLogout = async () => {
    const client = getSupabase()
    if (!client) {
      alert("Auth is not configured. Set Supabase env vars to enable logout.")
      return
    }
    try {
      await client.auth.signOut()
      // Optionally refresh the page or route to home
      window.location.reload()
    } catch (err) {
      console.error(err)
      alert("Failed to log out. See console for details.")
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={onLogout} tooltip="Log out">
          <LogOut />
          <span>Log out</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
