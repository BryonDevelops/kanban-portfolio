"use client"

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { TechStack } from './TechStack'
import { useIsAdmin } from './ProtectedRoute'
import { Edit, Trash2, MoreVertical } from 'lucide-react'

export interface ShowcasedProject {
  id?: string
  title: string
  description: string
  technologies: string[]
  image?: string
  link?: string
  github?: string
  featured?: boolean
  isCompletedKanbanProject?: boolean
}

interface ProjectCardProps extends ShowcasedProject {
  onEdit?: (project: ShowcasedProject) => void
  onDelete?: (project: ShowcasedProject) => void
}

export function ProjectCard({
  id,
  title,
  description,
  technologies,
  image,
  link,
  github,
  featured = false,
  isCompletedKanbanProject = false,
  onEdit,
  onDelete
}: ProjectCardProps) {
  const isAdmin = useIsAdmin()
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAdminMenu(false)
      }
    }

    if (showAdminMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAdminMenu])

  const project: ShowcasedProject = {
    id,
    title,
    description,
    technologies,
    image,
    link,
    github,
    featured,
    isCompletedKanbanProject
  }

  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-white/95 dark:bg-white/8 backdrop-blur-md border border-gray-200/80 dark:border-white/15 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-gray-300/30 dark:hover:shadow-white/10 ${
      featured ? 'ring-2 ring-blue-500/50 dark:ring-blue-400/50' : ''
    }`}>
      {/* Admin Controls */}
      {isAdmin && (
        <div className="absolute top-4 left-4 z-20">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowAdminMenu(!showAdminMenu)}
              className="p-2 bg-black/20 hover:bg-black/30 dark:bg-white/20 dark:hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-all duration-200"
              title="Admin controls"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {showAdminMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 overflow-hidden min-w-[120px]">
                <button
                  onClick={() => {
                    onEdit?.(project)
                    setShowAdminMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this project?')) {
                      onDelete?.(project)
                    }
                    setShowAdminMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status badges */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {featured && (
          <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold rounded-full shadow-lg">
            Featured
          </span>
        )}
        {isCompletedKanbanProject && (
          <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold rounded-full shadow-lg">
            Completed
          </span>
        )}
      </div>

      {/* Project image */}
      {image && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
          {description}
        </p>

        {/* Tech Stack */}
        <div className="mb-4">
          <TechStack
            technologies={technologies}
            size={24}
            className="justify-start"
          />
        </div>

        {/* Links */}
        <div className="flex gap-3">
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Project
            </a>
          )}
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          )}
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  )
}