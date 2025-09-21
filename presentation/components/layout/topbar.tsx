"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/presentation/components/ui/dropdown-menu"

import { Avatar, AvatarFallback, AvatarImage } from "@/presentation/components/ui/avatar"
import { ModeToggle } from "@/presentation/components/shared/mode-toggle"
import { LogOut, User } from "lucide-react"
import { Button } from "@/presentation/components/ui/button"
import { SidebarTrigger } from "@/presentation/components/ui/sidebar"
import ContactModal from "./ContactModal"

export function Topbar() {
  return (
    <div className="flex w-full items-center gap-4 p-2">
      <SidebarTrigger />
      <div className="ml-auto flex items-center gap-4">
        <ContactModal>
          <Button className="animate-pulse bg-accent text-white" aria-label="Contact me">Get in touch</Button>
        </ContactModal>
      </div>
      <ModeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button aria-label="User menu" className="rounded-full focus:outline-none focus-visible:ring-2 ring-ring/50">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/shadcn.jpg" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52 rounded-lg">
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2" /> Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Button variant="destructive" className="w-full text-left inline-flex items-center">
              <LogOut className="mr-2" /> Sign out
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
