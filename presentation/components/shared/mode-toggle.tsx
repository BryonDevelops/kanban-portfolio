"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
<<<<<<< HEAD
import { Button } from "@/presentation/components/ui/button"
=======
import { Button } from "../ui/button"
>>>>>>> origin/master

type Theme = "light" | "dark"

export function ModeToggle() {
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as Theme | null) ?? null
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const initial: Theme = stored ?? (prefersDark ? "dark" : "light")
    applyTheme(initial)
  }, [])

  const applyTheme = (next: Theme) => {
    setTheme(next)
    const root = document.documentElement
    if (next === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    localStorage.setItem("theme", next)
  }

  const toggle = () => applyTheme(theme === "dark" ? "light" : "dark")

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="size-5 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
