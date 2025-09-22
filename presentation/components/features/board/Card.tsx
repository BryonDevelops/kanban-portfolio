"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { Trash2, MoreHorizontal } from 'lucide-react'
import { Project } from '../../../../domain/board/schemas/project.schema'

type Props = {
  project: Project
  fromCol: string
  index: number
  onDelete?: (projectId: string) => void
  onOpenEditModal?: (project: Project) => void
  onMoveCard?: (dragIndex: number, hoverIndex: number) => void
}

interface DragItem {
  id: string
  index: number
  fromCol: string
  type: string
}

export default function Card({ project, fromCol, index, onDelete, onOpenEditModal, onMoveCard }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [showMenu, setShowMenu] = useState(false)

  const [, drop] = useDrop<DragItem>({
    accept: 'CARD',
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Only handle hover if we're in the same column
      if (item.fromCol !== fromCol) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      onMoveCard?.(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: 'CARD',
    item: () => {
      return { id: project.id, index, fromCol, type: 'CARD' }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  drag(drop(ref))

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && !(event.target as Element).closest('.menu-container')) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  })

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
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={`
        relative rounded-xl border border-white/10
        bg-gradient-to-br from-white/[0.08] to-white/[0.04]
        backdrop-blur-sm
        shadow-[0_8px_32px_rgba(0,0,0,0.3),0_4px_16px_rgba(0,0,0,0.2)]
        hover:shadow-[0_12px_40px_rgba(0,0,0,0.4),0_6px_20px_rgba(0,0,0,0.3)]
        p-3 sm:p-4 cursor-move select-none
        transition-all duration-300 ease-out
        transform hover:-translate-y-1
        ${isDragging
          ? 'opacity-50 scale-95 shadow-2xl rotate-2'
          : 'hover:scale-[1.02] hover:bg-gradient-to-br hover:from-white/[0.12] hover:to-white/[0.06]'
        }
      `}
      onClick={handleCardClick}
    >
        {/* Subtle hover glow */}
        <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-200" />

        {/* Card content */}
        <div className="relative z-10">
          {/* Header with title and action buttons */}
          <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white text-sm leading-tight line-clamp-2">
                {project.title}
              </h4>
            </div>

            {/* Always visible action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Delete button */}
              <button
                onClick={handleDelete}
                className="p-1 sm:p-1.5 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
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
                  className="p-1 sm:p-1.5 rounded-lg text-white/50 hover:text-white/70 hover:bg-white/10 transition-all duration-200"
                  title="More options"
                >
                  <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>

                {/* Dropdown menu */}
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-slate-800/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl z-50">
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowMenu(false)
                          if (onOpenEditModal) {
                            onOpenEditModal(project)
                          }
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowMenu(false)
                          handleDelete(e)
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200"
                      >
                        Archive Project
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

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
              <div className="flex items-center gap-1 text-xs text-white/60">
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
                  className="px-1.5 sm:px-2 py-0.5 text-xs rounded-md bg-white/10 text-white/80 border border-white/20"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="px-1.5 sm:px-2 py-0.5 text-xs rounded-md bg-white/5 text-white/60">
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
                  className="px-1.5 sm:px-2 py-0.5 text-xs rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30"
                >
                  #{tag}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className="px-1.5 sm:px-2 py-0.5 text-xs rounded-md bg-purple-500/10 text-purple-400/60">
                  +{project.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
    </div>
  )
}
