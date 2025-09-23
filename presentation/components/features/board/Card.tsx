"use client"
import React, { useEffect, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, MoreHorizontal, GripVertical } from 'lucide-react'
import { Project } from '../../../../domain/board/schemas/project.schema'

type Props = {
  project: Project
  fromCol: string
  index: number
  onDelete?: (projectId: string) => void
  onOpenEditModal?: (project: Project) => void
  isDragOverlay?: boolean
}

export default function Card({ project, fromCol, index, onDelete, onOpenEditModal, isDragOverlay = false }: Props) {
  const [showMenu, setShowMenu] = useState(false)

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && !(event.target as Element).closest('.menu-container')) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(project.id)
    }
  }

  const handleCardClick = () => {
    if (onOpenEditModal) {
      onOpenEditModal(project)
    }
  }

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={style}
      {...(isDragOverlay ? {} : attributes)}
      className={`
        relative rounded-xl border border-border
        bg-card
        backdrop-blur-sm
        shadow-[0_8px_32px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.08)]
        dark:shadow-[0_8px_32px_rgba(255,255,255,0.08),0_4px_16px_rgba(255,255,255,0.04)]
        p-3 sm:p-4 select-none
        transition-all duration-300 ease-out
        hover:shadow-[0_12px_40px_rgba(0,0,0,0.15),0_6px_20px_rgba(0,0,0,0.1)]
        dark:hover:shadow-[0_12px_40px_rgba(255,255,255,0.12),0_6px_20px_rgba(255,255,255,0.06)]
        ${isDragging && !isDragOverlay
          ? 'opacity-50 scale-95 shadow-2xl rotate-2'
          : ''
        }
      `}
    >
      {/* Drag handle - only this area initiates drag */}
      <div {...(isDragOverlay ? {} : listeners)} className={isDragOverlay ? "" : "cursor-move"}>
        {/* Card content */}
        <div className="relative z-10">
          {/* Header with title and action buttons */}
          <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-border/50">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <GripVertical className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
              <h4 className="font-semibold text-card-foreground text-sm leading-tight line-clamp-2">
                {project.title}
              </h4>
            </div>

            {/* Action buttons in header */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Delete button */}
              <button
                onClick={handleDelete}
                className="p-1 sm:p-1.5 rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                title="Archive project (can be restored later)"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>

              {/* Ellipsis menu */}
              <div className="relative menu-container">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(!showMenu)
                  }}
                  className="p-1 sm:p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
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
          <div className="flex items-center justify-between mb-2 sm:mb-3">
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
  )
}
