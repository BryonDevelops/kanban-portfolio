"use client"

import React from 'react'
import * as SimpleIcons from 'simple-icons'

// Type for Simple Icons
type SimpleIconSlug = keyof typeof SimpleIcons

interface SimpleIcon {
  title: string
  slug: string
  svg: string
  path: string
  source: string
  hex: string
}

interface TechIconProps {
  name: string
  size?: number
  className?: string
}

export function TechIcon({ name, size = 24, className = "" }: TechIconProps) {
  // Convert name to Simple Icons slug format
  // Simple Icons uses 'si' prefix + PascalCase
  const cleanName = name.replace(/[^a-zA-Z0-9\s]/g, '').trim()
  const pascalCase = cleanName
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')

  const slug = `si${pascalCase}` as SimpleIconSlug

  // Try to find the icon
  const icon = SimpleIcons[slug] as SimpleIcon | undefined

  if (!icon) {
    // Fallback: return a generic code icon or placeholder
    return (
      <div
        className={`inline-flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md ${className}`}
        style={{ width: size, height: size }}
        title={`Icon for ${name} not found`}
      >
        <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={`#${icon.hex}`}
      dangerouslySetInnerHTML={{ __html: icon.svg }}
    />
  )
}

// Helper function to get all available tech icons
export function getAvailableTechIcons(): string[] {
  return Object.keys(SimpleIcons).map(slug => {
    const icon = SimpleIcons[slug as SimpleIconSlug] as SimpleIcon
    return icon.title
  })
}

// Popular tech stacks for quick reference
export const POPULAR_TECH_STACKS = {
  frontend: ['React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'TypeScript', 'JavaScript'],
  backend: ['Node.js', 'Python', 'Java', 'Go', 'Rust', 'PHP', 'Ruby'],
  databases: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'SQLite'],
  cloud: ['AWS', 'Google Cloud', 'Azure', 'Vercel', 'Netlify', 'Heroku'],
  tools: ['Git', 'Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'Figma'],
  languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#']
} as const