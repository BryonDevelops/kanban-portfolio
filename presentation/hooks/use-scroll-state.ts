"use client"

import { useEffect, useState } from "react"

export function useScrollState() {
  const [isTopbarHidden, setIsTopbarHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Hide topbar when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsTopbarHidden(true)
      } else if (currentScrollY < lastScrollY) {
        setIsTopbarHidden(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

  return { isTopbarHidden }
}