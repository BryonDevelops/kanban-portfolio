"use client"

import React, { useEffect, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, ChevronDown } from 'lucide-react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Project } from '../../../../domain/board/schemas/project.schema'

type Props = {
  project: Project
  fromCol: string
  index: number
  onDelete?: (projectId: string) => void
  onOpenEditModal?: (project: Project) => void
  onMoveToColumn?: (projectId: string, targetColumn: string) => void
  isDragOverlay?: boolean
}

export default function Card({ project, fromCol, index, onDelete, onOpenEditModal, onMoveToColumn, isDragOverlay = false }: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const [showMobileColumnSheet, setShowMobileColumnSheet] = useState(false)

  const sortableData = useSortable({
    id: project.id,
    data: {
      type: 'card',
      project,
      fromCol,
      index,
    },
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = sortableData;

  const style = isDragOverlay ? {} : {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Close mobile column sheet when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showMobileColumnSheet) {
        setShowMobileColumnSheet(false)
      }
    }

    if (showMobileColumnSheet) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMobileColumnSheet])

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(project.id)
    }
  }

  const handleMobileColumnSheetToggle = () => {
    setShowMobileColumnSheet(!showMobileColumnSheet)
  }

  const handleMoveToColumn = (targetColumn: string) => {
    if (onMoveToColumn && targetColumn !== fromCol) {
      onMoveToColumn(project.id, targetColumn)
    }
    setShowMobileColumnSheet(false)
  }

  const handleCardClick = () => {
    if (onOpenEditModal) {
      onOpenEditModal(project)
    }
  }

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={isDragOverlay ? {} : style}
      {...(isDragOverlay ? {} : attributes)}
      data-card-id={project.id}
      className={`
        relative rounded-xl border border-border
        bg-card
        backdrop-blur-sm
        shadow-[0_8px_32px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.08)]
        dark:shadow-[0_8px_32px_rgba(255,255,255,0.08),0_4px_16px_rgba(255,255,255,0.04)]
        p-3 sm:p-4 md:p-5 select-none
        transition-all duration-300 ease-out
        ${!isDragOverlay ? `
          hover:shadow-[0_12px_40px_rgba(0,0,0,0.15),0_6px_20px_rgba(0,0,0,0.1)]
          dark:hover:shadow-[0_12px_40px_rgba(255,255,255,0.12),0_6px_20px_rgba(255,255,255,0.06)]
          group
        ` : ''}
        ${isDragging && !isDragOverlay
          ? 'opacity-30 pointer-events-none'
          : ''
        }
        ${isDragOverlay
          ? 'shadow-2xl ring-2 ring-primary/50 bg-card/95'
          : ''
        }
      `}
    >
      {/* Header area - no longer draggable */}
      <div className={isDragOverlay ? "" : ""}>
        {/* Card content */}
        <div className="relative z-10">
          {/* Modern Header with gradient background */}
          <div className="relative mb-4 sm:mb-5 md:mb-6">
            {/* Subtle header background */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent/30 via-accent/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Header content */}
            <div className="relative flex items-center justify-between gap-3 p-2 sm:p-3 rounded-lg">
              {/* Left side - Drag handle and title */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Enhanced drag indicator */}
                <div
                  {...(isDragOverlay ? {} : listeners)}
                  className={`flex flex-col gap-0.5 p-2 rounded-md transition-all duration-200 ${
                    isDragOverlay
                      ? ""
                      : "cursor-move touch-manipulation hover:bg-accent/60 active:bg-accent/80 group-hover:bg-accent/40"
                  }`}
                  title="Drag to move"
                >
                  <div className="w-4 h-0.5 bg-muted-foreground/70 rounded-full"></div>
                  <div className="w-4 h-0.5 bg-muted-foreground/70 rounded-full"></div>
                  <div className="w-4 h-0.5 bg-muted-foreground/70 rounded-full"></div>
                </div>

                {/* Title with better typography */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-card-foreground text-sm sm:text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
                    {project.title}
                  </h4>
                </div>
              </div>

              {/* Right side - Action buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Mobile Column Switcher - only visible on mobile */}
                <div className="relative md:hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMobileColumnSheetToggle()
                    }}
                    className="px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-200 flex items-center gap-1.5 text-xs font-medium"
                    title="Move to column"
                  >
                    <span>Move</span>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>

                  {showMobileColumnSheet && typeof window !== 'undefined' && createPortal(
                    <>
                      {/* Backdrop */}
                      <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={() => setShowMobileColumnSheet(false)} />

                      {/* Centered Modal */}
                      <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
                        <div className="w-full max-w-sm bg-background border border-border rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-foreground">Move Card</h3>
                              <button
                                onClick={() => setShowMobileColumnSheet(false)}
                                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                              >
                                ✕
                              </button>
                            </div>

                            <div className="space-y-2">
                              <button
                                onClick={() => handleMoveToColumn('ideas')}
                                disabled={fromCol === 'ideas'}
                                className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-4 ${
                                  fromCol === 'ideas'
                                    ? 'border-muted bg-muted/50 text-muted-foreground cursor-not-allowed'
                                    : 'border-border bg-card hover:bg-accent hover:border-accent-foreground active:bg-accent/80'
                                }`}
                              >
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                                  💡
                                </div>
                                <div>
                                  <div className="font-medium">Ideas</div>
                                  <div className="text-sm text-muted-foreground">Planning phase</div>
                                </div>
                                {fromCol === 'ideas' && (
                                  <div className="ml-auto text-sm text-muted-foreground">Current</div>
                                )}
                              </button>

                              <button
                                onClick={() => handleMoveToColumn('in-progress')}
                                disabled={fromCol === 'in-progress'}
                                className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-4 ${
                                  fromCol === 'in-progress'
                                    ? 'border-muted bg-muted/50 text-muted-foreground cursor-not-allowed'
                                    : 'border-border bg-card hover:bg-accent hover:border-accent-foreground active:bg-accent/80'
                                }`}
                              >
                                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-bold">
                                  🚧
                                </div>
                                <div>
                                  <div className="font-medium">In Progress</div>
                                  <div className="text-sm text-muted-foreground">Active development</div>
                                </div>
                                {fromCol === 'in-progress' && (
                                  <div className="ml-auto text-sm text-muted-foreground">Current</div>
                                )}
                              </button>

                              <button
                                onClick={() => handleMoveToColumn('completed')}
                                disabled={fromCol === 'completed'}
                                className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-4 ${
                                  fromCol === 'completed'
                                    ? 'border-muted bg-muted/50 text-muted-foreground cursor-not-allowed'
                                    : 'border-border bg-card hover:bg-accent hover:border-accent-foreground active:bg-accent/80'
                                }`}
                              >
                                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                                  ✅
                                </div>
                                <div>
                                  <div className="font-medium">Completed</div>
                                  <div className="text-sm text-muted-foreground">Finished projects</div>
                                </div>
                                {fromCol === 'completed' && (
                                  <div className="ml-auto text-sm text-muted-foreground">Current</div>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>,
                    document.body
                  )}
                </div>

              {/* Ellipsis menu */}
              <div className="relative menu-container">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(!showMenu)
                  }}
                  className="p-2 sm:p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 min-w-[32px] min-h-[32px] flex items-center justify-center"
                  title="More options"
                >
                  <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>

                {/* Dropdown menu */}
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-popover backdrop-blur-sm border border-border rounded-lg shadow-xl z-[100]">
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowMenu(false)
                          if (onOpenEditModal) {
                            onOpenEditModal(project)
                          }
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:text-popover-foreground hover:bg-accent transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowMenu(false)
                          handleDelete(e)
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                      >
                        Archive Project
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Clickable content area - separate from drag handle */}
      <div onClick={handleCardClick} className="cursor-pointer">
        <div className="relative z-10">
          {/* Status Badge */}
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
            <div className={`px-2 py-1 text-xs rounded-full font-medium ${
              project.status === 'completed'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : project.status === 'in-progress'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : project.status === 'planning'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : project.status === 'on-hold'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
            }`}>
              {project.status === 'in-progress' ? 'In Progress' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </div>

            {/* Task Count */}
            {project.tasks && project.tasks.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="font-medium">{project.tasks.length}</span>
                <span>tasks</span>
                <div className="flex gap-0.5 ml-1">
                  {project.tasks.filter(t => t.status === 'done').length > 0 && (
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400" title={`${project.tasks.filter(t => t.status === 'done').length} completed`} />
                  )}
                  {project.tasks.filter(t => t.status === 'in-progress').length > 0 && (
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-400" title={`${project.tasks.filter(t => t.status === 'in-progress').length} in progress`} />
                  )}
                  {project.tasks.filter(t => t.status === 'todo').length > 0 && (
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-400" title={`${project.tasks.filter(t => t.status === 'todo').length} todo`} />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Project Image - Only show if image exists */}
          {project.image && (
            <div className="relative mb-3 sm:mb-4 md:mb-5 -mx-1">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/50 bg-muted/30">
                <Image
                  src={project.image}
                  alt={`${project.title} preview`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={(e) => {
                    // Hide image on error
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          )}

          {/* Technologies */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1 sm:mb-2">
              {project.technologies.slice(0, 3).map((tech, i) => (
                <span
                  key={i}
                  className="px-1.5 sm:px-2 py-0.5 text-xs rounded-md bg-secondary text-secondary-foreground border border-border"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="px-1.5 sm:px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground">
                  +{project.technologies.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="px-1.5 sm:px-2 py-0.5 text-xs rounded-md bg-accent text-accent-foreground border border-border"
                >
                  #{tag}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className="px-1.5 sm:px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground">
                  +{project.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  )
}
