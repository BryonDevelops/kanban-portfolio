"use client"

import { ChevronDown } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Board from "@/components/Board"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

export default function Home() {
  const mainRef = useRef<HTMLElement | null>(null)
  const [active, setActive] = useState<"hero" | "projects">("hero")
  const [snapped, setSnapped] = useState<"hero" | "projects" | null>("hero")
  const scrollEndTimer = useRef<number | null>(null)
  const routeDelayTimer = useRef<number | null>(null)
  const router = useRouter()

  const scrollToSection = useCallback((id: string) => {
    const container = mainRef.current
    const el = document.getElementById(id)
    if (!container || !el) return
    const target = el.offsetTop
    const start = container.scrollTop
    const distance = target - start
    const duration = 800
    const startTime = performance.now()
    const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration)
      const eased = easeInOutQuad(t)
      container.scrollTop = start + distance * eased
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [])

  useEffect(() => {
    const container = mainRef.current
    if (!container) return

    const onScroll = () => {
      const hero = document.getElementById('hero')
      const projects = document.getElementById('projects')
      if (!hero || !projects) return
      const cTop = container.scrollTop
      const cH = container.clientHeight
      const heroMid = hero.offsetTop + hero.clientHeight / 2
      const projMid = projects.offsetTop + projects.clientHeight / 2
      const distHero = Math.abs(heroMid - (cTop + cH / 2))
      const distProj = Math.abs(projMid - (cTop + cH / 2))
      const isHero = distHero <= distProj
      setActive(isHero ? 'hero' : 'projects')
      // Set body class immediately based on active section
      if (isHero) {
        document.body.classList.add('hero-active')
      } else {
        document.body.classList.remove('hero-active')
      }
      // Debounced check for snap completion (scroll idle)
      if (scrollEndTimer.current) window.clearTimeout(scrollEndTimer.current)
      scrollEndTimer.current = window.setTimeout(() => {
        const near = (a: number, b: number, tol = 1) => Math.abs(a - b) <= tol
        if (near(container.scrollTop, projects.offsetTop)) {
          setSnapped('projects')
        } else if (near(container.scrollTop, hero.offsetTop)) {
          setSnapped('hero')
        } else {
          setSnapped(null)
        }
      }, 120)
    }
    onScroll()
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', onScroll)
      if (scrollEndTimer.current) window.clearTimeout(scrollEndTimer.current)
    }
  }, [])

  // Toggle a body class so the sidebar only fades in when snapped to Projects
  // Remove scroll-based sidebar fade logic; now handled by route in PageTransition

  // When home snaps to Projects, transition to the /projects route after a short delay
  useEffect(() => {
    if (routeDelayTimer.current) {
      window.clearTimeout(routeDelayTimer.current)
      routeDelayTimer.current = null
    }
    if (snapped === 'projects') {
      routeDelayTimer.current = window.setTimeout(() => {
        router.push('/projects')
      }, 400)
    }
    return () => {
      if (routeDelayTimer.current) window.clearTimeout(routeDelayTimer.current)
    }
  }, [snapped, router])

  return (
  <main ref={mainRef} className="no-scrollbar h-screen overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth">
      {/* Snap indicators */}
      {(() => {
        const sections = [
          { id: "hero", label: "Hero" },
          { id: "projects", label: "Projects" },
        ] as const
        const DOT = 12 // px (visual size only)
        const PADDING_REM = 1.5 // ~24px top/bottom padding
        const activeIndex = sections.findIndex((s) => s.id === active)
        const ratio = sections.length > 1 ? (activeIndex / (sections.length - 1)) : 0
        const progressPct = `${Math.round(Math.max(0, Math.min(100, ratio * 100)))}%`
        return (
          <div className="fixed right-4 top-1/2 z-30 -translate-y-1/2">
            {/* Wrapper is nearly full viewport height with subtle padding */}
            <div className="relative flex items-center" style={{ height: `calc(80vh - ${PADDING_REM * 2}rem)` }}>
              {/* Rail (fainter, wider) with subtle gradient + glow */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-[6px] rounded-full bg-gradient-to-b from-white/0 via-white/15 to-white/0 shadow-[0_0_12px_rgba(255,255,255,0.08)]" />
              {/* Progress line (animated) with vibrant gradient + glow */}
              <div
                className="absolute left-1/2 top-0 -translate-x-1/2 w-[4px] rounded-full bg-gradient-to-b from-sky-400 via-white to-violet-400 shadow-[0_0_12px_rgba(96,165,250,0.45),0_0_18px_rgba(167,139,250,0.35)] transition-[height] duration-500 ease-out"
                style={{ height: progressPct }}
              />
              {/* Dots evenly spaced with top/bottom padding */}
              <div className="absolute inset-0 flex flex-col items-center justify-between py-6">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    aria-label={`Go to ${s.label}`}
                    className={`h-3 w-3 rounded-full border transition-all duration-200 focus:outline-none focus-visible:ring-2 ${
                      active === s.id
                        ? "bg-white/90 border-white/70 ring-white/30 shadow-[0_0_10px_rgba(255,255,255,0.25)] scale-110"
                        : "bg-white/8 border-white/20 hover:bg-white/15"
                    }`}
                    title={s.label}
                    style={{ minWidth: DOT, minHeight: DOT }}
                  />
                ))}
              </div>
            </div>
          </div>
        )
      })()}
      {/* Hero section */}
      <section id="hero" className="relative min-h-screen snap-start flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="max-w-2xl w-full flex flex-col items-center gap-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            Welcome to My Portfolio
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-xl mx-auto">
            I build modern web applications with Next.js, Supabase, Tailwind CSS, and more. Explore my projects, skills, and experience below.
          </p>
          <a
            href="#projects"
            aria-label="Scroll to projects"
            onClick={(e) => {
              e.preventDefault()
              scrollToSection("projects")
            }}
            className="mt-4 rounded-full border border-white/20 bg-white/10 p-3 text-white shadow-lg backdrop-blur transition-colors duration-200 hover:bg-white/20 focus:outline-none focus-visible:ring-2 ring-white/40"
          >
            <ChevronDown className="h-6 w-6 animate-bounce" style={{ animationDuration: "1.8s" }} />
          </a>
        </div>
      </section>

      {/* Projects section */}
      <section id="projects" className="relative min-h-screen snap-start flex items-center justify-center px-4 py-12">
        <div className="text-center text-gray-300">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white/80" />
          <p className="text-sm">Opening Projects…</p>
        </div>
      </section>
    </main>
  )
}
