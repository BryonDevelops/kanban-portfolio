"use client"

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs"
import { ModeToggle } from "@/presentation/components/shared/mode-toggle"
import { Button } from "@/presentation/components/ui/button"
import { SidebarTrigger } from "@/presentation/components/ui/sidebar"
import ContactModal from "./ContactModal"

export function Topbar() {
  return (
    <div className="flex w-full items-center gap-4 p-2">
      <SidebarTrigger />

      <div className="ml-auto flex items-center justify-center gap-4 pr-4">
        <ContactModal>
          <Button className="animate-pulse bg-accent text-white" aria-label="Contact me">Get in touch</Button>
        </ContactModal>
        <ModeToggle />
        <SignedOut>
          <div className="flex items-center gap-2">
            <SignInButton>
              <Button variant="ghost">Sign in</Button>
            </SignInButton>
            <SignUpButton>
              <Button variant="outline">Sign up</Button>
            </SignUpButton>
          </div>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center justify-center pl-5">
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </div>
    </div>
  )
}
