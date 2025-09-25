"use client"

import React from 'react'

interface SectionBadgeProps {
  text: string
  className?: string
  dotColor?: string
  textColor?: string
  bgColor?: string
  borderColor?: string
}

export function SectionBadge({
  text,
  className = "",
  dotColor = "from-blue-500 to-purple-500",
  textColor = "text-gray-700 dark:text-white/80",
  bgColor = "bg-white/90 dark:bg-white/5",
  borderColor = "border-gray-200/60 dark:border-white/10"
}: SectionBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${bgColor} backdrop-blur-sm border ${borderColor} ${className}`}>
      <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${dotColor} animate-pulse`} />
      <span className={`text-sm ${textColor} font-medium`}>{text}</span>
    </div>
  )
}