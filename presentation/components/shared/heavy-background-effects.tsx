"use client"

export default function HeavyBackgroundEffects() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Primary gradient orbs */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-pink-300/20 via-purple-300/20 to-blue-300/20 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-cyan-300/20 via-emerald-300/20 to-teal-300/20 dark:from-emerald-500/10 dark:via-cyan-500/10 dark:to-blue-500/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Secondary accent orbs */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-r from-violet-300/15 to-fuchsia-300/15 dark:from-violet-500/5 dark:to-fuchsia-500/5 blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]" />
    </div>
  )
}