"use client"

import React from 'react'
import { TechIcon } from './TechIcon'

interface TechStackProps {
  technologies: string[]
  size?: number
  className?: string
  showLabels?: boolean
}

export function TechStack({
  technologies,
  size = 32,
  className = "",
  showLabels = false
}: TechStackProps) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {technologies.map((tech, index) => (
        <div
          key={tech}
          className="flex flex-col items-center gap-2 group"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="relative">
            <TechIcon
              name={tech}
              size={size}
              className="transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg"
            />
            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-full bg-current opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-md scale-150" />
          </div>
          {showLabels && (
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center max-w-[60px] leading-tight">
              {tech}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

// Compact version for inline display
export function TechStackCompact({
  technologies,
  size = 20,
  className = ""
}: Omit<TechStackProps, 'showLabels'>) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {technologies.map((tech, index) => (
        <div
          key={tech}
          className="group relative"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <TechIcon
            name={tech}
            size={size}
            className="transition-transform duration-200 group-hover:scale-110"
          />
          {/* Tooltip on hover */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            {tech}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
          </div>
        </div>
      ))}
    </div>
  )
}