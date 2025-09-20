"use client"
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useDrop, useDrag } from 'react-dnd'
import { X, Save, Plus, Trash2, Code, FileText, CheckSquare, Circle, CheckCircle2, GripVertical, Edit3, ExternalLink, Eye, Edit, Bold, Italic, Link, List, ListOrdered, Quote, Code2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Project } from '../../../../domain/board/schemas/project.schema'
import { createPortal } from 'react-dom'

type Props = {
  project: Project
  isOpen: boolean
  onClose: () => void
  onSave: (project: Project) => void
  onDelete: (projectId: string) => void
}

export default function EditProjectForm({ project, isOpen, onClose, onSave, onDelete }: Props) {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || '',
    url: project.url || '',
    status: project.status,
    technologies: [...project.technologies],
    tags: [...project.tags],
    tasks: [...(project.tasks || [])]
  })

  const [newTech, setNewTech] = useState('')
  const [newTag, setNewTag] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [isDescriptionPreview, setIsDescriptionPreview] = useState(false)
  const descriptionTextareaRef = React.useRef<HTMLTextAreaElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Track changes for better UX
  useEffect(() => {
    const hasChanged =
      formData.title !== project.title ||
      formData.description !== (project.description || '') ||
      formData.url !== (project.url || '') ||
      formData.status !== project.status ||
      JSON.stringify(formData.technologies) !== JSON.stringify(project.technologies) ||
      JSON.stringify(formData.tags) !== JSON.stringify(project.tags) ||
      JSON.stringify(formData.tasks) !== JSON.stringify(project.tasks || [])

    setHasChanges(hasChanged)
  }, [formData, project])

  // Close status dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isStatusDropdownOpen) {
        setIsStatusDropdownOpen(false)
      }
    }

    if (isStatusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isStatusDropdownOpen])

  const handleSave = useCallback(async () => {
    if (!formData.title.trim()) return

    setIsSaving(true)
    try {
      const updatedProject: Project = {
        ...project,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        url: formData.url.trim() || undefined,
        status: formData.status as Project['status'],
        technologies: formData.technologies,
        tags: formData.tags,
        tasks: formData.tasks,
        updated_at: new Date()
      }
      await onSave(updatedProject)
      onClose()
    } catch (error) {
      console.error('Failed to save project:', error)
    } finally {
      setIsSaving(false)
    }
  }, [formData, project, onSave, onClose])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && hasChanges) {
        handleSave()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, hasChanges, handleSave, onClose])

  const addTechnology = () => {
    if (newTech.trim() && !formData.technologies.includes(newTech.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()]
      }))
      setNewTech('')
    }
  }

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  // Task drag and drop functions
  const moveTask = (dragIndex: number, hoverIndex: number, dragStatus: string, hoverStatus: string) => {
    setFormData(prev => {
      const tasks = [...prev.tasks]

      if (dragStatus === hoverStatus) {
        // Reordering within the same column
        const statusTasks = tasks.filter(task => task.status === dragStatus)

        const [draggedTask] = statusTasks.splice(dragIndex, 1)
        statusTasks.splice(hoverIndex, 0, draggedTask)

        // Preserve original order by maintaining position of other status groups
        // Create a map to preserve the original order structure
        const reorderedTasks = [...tasks]
        let statusTaskIndex = 0

        for (let i = 0; i < reorderedTasks.length; i++) {
          if (reorderedTasks[i].status === dragStatus) {
            reorderedTasks[i] = statusTasks[statusTaskIndex]
            statusTaskIndex++
          }
        }

        return {
          ...prev,
          tasks: reorderedTasks
        }
      } else {
        // Moving between columns
        const statusTasks = tasks.filter(task => task.status === dragStatus)
        const draggedTask = statusTasks[dragIndex]
        if (!draggedTask) return prev

        const updatedTasks = tasks.map(task =>
          task.id === draggedTask.id
            ? { ...task, status: hoverStatus as 'todo' | 'in-progress' | 'done', updated_at: new Date() }
            : task
        )

        return {
          ...prev,
          tasks: updatedTasks
        }
      }
    })
  }

  const onDropTask = (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId
          ? { ...task, status: newStatus, updated_at: new Date() }
          : task
      )
    }))
  }

  const onRemoveTaskById = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId)
    }))
  }

  const updateTaskTitle = (taskId: string, newTitle: string) => {
    if (!newTitle.trim()) return

    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId
          ? { ...task, title: newTitle.trim(), updated_at: new Date() }
          : task
      )
    }))
  }

  // Get status color and styling
  const getStatusConfig = (status: Project['status']) => {
    switch (status) {
      case 'planning':
        return {
          color: 'text-yellow-700 dark:text-yellow-300',
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          border: 'border-yellow-300 dark:border-yellow-700',
          label: 'Planning'
        }
      case 'in-progress':
        return {
          color: 'text-blue-700 dark:text-blue-300',
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          border: 'border-blue-300 dark:border-blue-700',
          label: 'In Progress'
        }
      case 'completed':
        return {
          color: 'text-green-700 dark:text-green-300',
          bg: 'bg-green-100 dark:bg-green-900/30',
          border: 'border-green-300 dark:border-green-700',
          label: 'Completed'
        }
      case 'on-hold':
        return {
          color: 'text-red-700 dark:text-red-300',
          bg: 'bg-red-100 dark:bg-red-900/30',
          border: 'border-red-300 dark:border-red-700',
          label: 'On Hold'
        }
      default:
        return {
          color: 'text-slate-700 dark:text-slate-300',
          bg: 'bg-slate-100 dark:bg-slate-900/30',
          border: 'border-slate-300 dark:border-slate-700',
          label: status
        }
    }
  }

  // Markdown formatting helper function
  const formatText = (format: string) => {
    const textarea = descriptionTextareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.description.substring(start, end)
    const beforeText = formData.description.substring(0, start)
    const afterText = formData.description.substring(end)

    let newText = ''
    let newCursorStart = start
    let newCursorEnd = start

    switch (format) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`
        newCursorStart = start + 2
        newCursorEnd = selectedText ? end + 2 : start + 11
        break
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`
        newCursorStart = start + 1
        newCursorEnd = selectedText ? end + 1 : start + 12
        break
      case 'code':
        newText = `\`${selectedText || 'code'}\``
        newCursorStart = start + 1
        newCursorEnd = selectedText ? end + 1 : start + 5
        break
      case 'link':
        newText = `[${selectedText || 'link text'}](URL)`
        newCursorStart = selectedText ? start + selectedText.length + 3 : start + 12
        newCursorEnd = selectedText ? start + selectedText.length + 6 : start + 15
        break
      case 'h1':
        newText = `# ${selectedText || 'Heading 1'}`
        newCursorStart = start + 2
        newCursorEnd = selectedText ? end + 2 : start + 11
        break
      case 'h2':
        newText = `## ${selectedText || 'Heading 2'}`
        newCursorStart = start + 3
        newCursorEnd = selectedText ? end + 3 : start + 12
        break
      case 'h3':
        newText = `### ${selectedText || 'Heading 3'}`
        newCursorStart = start + 4
        newCursorEnd = selectedText ? end + 4 : start + 13
        break
      case 'ul':
        newText = `- ${selectedText || 'List item'}`
        newCursorStart = start + 2
        newCursorEnd = selectedText ? end + 2 : start + 11
        break
      case 'ol':
        newText = `1. ${selectedText || 'List item'}`
        newCursorStart = start + 3
        newCursorEnd = selectedText ? end + 3 : start + 12
        break
      case 'quote':
        newText = `> ${selectedText || 'Quote'}`
        newCursorStart = start + 2
        newCursorEnd = selectedText ? end + 2 : start + 7
        break
      case 'codeblock':
        newText = `\`\`\`\n${selectedText || 'code'}\n\`\`\``
        newCursorStart = start + 4
        newCursorEnd = selectedText ? start + 4 + selectedText.length : start + 8
        break
    }

    const fullNewText = beforeText + newText + afterText
    setFormData(prev => ({ ...prev, description: fullNewText }))

    // Set cursor position after state update
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorStart, newCursorEnd)
    }, 0)
  }

  // Handle keyboard shortcuts for markdown formatting
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          formatText('bold')
          break
        case 'i':
          e.preventDefault()
          formatText('italic')
          break
        case 'k':
          e.preventDefault()
          formatText('link')
          break
        case '`':
          e.preventDefault()
          formatText('code')
          break
      }
    }
  }

  // Mini task card component
  interface TaskDragItem {
    id: string
    index: number
    status: 'todo' | 'in-progress' | 'done'
    type: string
  }

  interface TaskCardProps {
    task: Project['tasks'][0]
    index: number
    moveTask: (dragIndex: number, hoverIndex: number, dragStatus: string, hoverStatus: string) => void
    onRemoveTask: (taskId: string) => void
    onUpdateTask: (taskId: string, newTitle: string) => void
    editingTaskId: string | null
    setEditingTaskId: (taskId: string | null) => void
  }

  const TaskCard: React.FC<TaskCardProps> = ({ task, index, moveTask, onRemoveTask, onUpdateTask, editingTaskId, setEditingTaskId }) => {
    const ref = React.useRef<HTMLDivElement>(null)
    const [tempTitle, setTempTitle] = React.useState(task.title)
    const isEditing = editingTaskId === task.id

    React.useEffect(() => {
      setTempTitle(task.title)
    }, [task.title])

    const handleSaveTitle = () => {
      onUpdateTask(task.id, tempTitle)
      setEditingTaskId(null)
    }

    const handleCancelEdit = () => {
      setTempTitle(task.title)
      setEditingTaskId(null)
    }

    const [, drop] = useDrop<TaskDragItem, void, Record<string, never>>({
      accept: 'TASK',
      hover(item: TaskDragItem, monitor) {
        if (!ref.current) return

        const dragIndex = item.index
        const hoverIndex = index
        const dragStatus = item.status
        const hoverStatus = task.status

        // Don't replace items with themselves
        if (dragIndex === hoverIndex && dragStatus === hoverStatus) return

        // Determine rectangle on screen
        const hoverBoundingRect = ref.current.getBoundingClientRect()
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
        const clientOffset = monitor.getClientOffset()

        if (!clientOffset) return

        const hoverClientY = clientOffset.y - hoverBoundingRect.top

        // Only perform the move when the mouse has crossed half of the items height
        if (dragStatus === hoverStatus) {
          // Dragging within the same column
          if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
          if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return
        }

        moveTask(dragIndex, hoverIndex, dragStatus, hoverStatus)
        item.index = hoverIndex
        item.status = hoverStatus
      },
    })

    const [{ isDragging }, drag] = useDrag({
      type: 'TASK',
      item: () => ({ id: task.id, index, status: task.status, type: 'TASK' }),
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    })

    React.useEffect(() => {
      drag(drop(ref))
    }, [drag, drop])

    const getStatusIcon = () => {
      switch (task.status) {
        case 'done':
          return <CheckCircle2 className="h-3 w-3 text-green-500" />
        case 'in-progress':
          return <CheckSquare className="h-3 w-3 text-blue-500" />
        default:
          return <Circle className="h-3 w-3 text-slate-400" />
      }
    }

    return (
      <div
        ref={ref}
        className={`
          flex items-center gap-2 p-2 bg-white dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700
          cursor-move transition-all duration-200 group
          ${isDragging ? 'opacity-50 rotate-1 scale-105' : 'hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-600'}
        `}
      >
        <GripVertical className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        {getStatusIcon()}

        {/* Editable Task Title */}
        {isEditing ? (
          <input
            type="text"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSaveTitle()
              }
              if (e.key === 'Escape') {
                e.preventDefault()
                handleCancelEdit()
              }
              // Prevent drag initiation when typing
              e.stopPropagation()
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-xs bg-transparent border-none outline-none text-slate-900 dark:text-white"
            autoFocus
          />
        ) : (
          <div className="relative flex-1 group/title">
            <span
              className={`text-xs cursor-pointer transition-colors relative group ${task.status === 'done' ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400'}`}
              onClick={() => setEditingTaskId(task.id)}
            >
              {task.title}
              {/* Subtle edit hint */}
              <span className="absolute -top-3 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[9px] text-slate-400 font-normal whitespace-nowrap pointer-events-none">
                click to edit
              </span>
            </span>
            {/* Underline hint */}
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover/title:w-full transition-all duration-300 ease-out"></div>
            <Edit3
              className="absolute -right-4 top-0 h-2 w-2 text-slate-400 hover:text-blue-500 cursor-pointer opacity-0 group-hover/title:opacity-100 transition-all duration-200 group-hover/title:scale-110"
              onClick={() => setEditingTaskId(task.id)}
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => onRemoveTask(task.id)}
          className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    )
  }

  // Mini task column component
  interface TaskColumnProps {
    title: string
    status: 'todo' | 'in-progress' | 'done'
    tasks: Project['tasks']
    onDropTask: (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => void
    moveTask: (dragIndex: number, hoverIndex: number, dragStatus: string, hoverStatus: string) => void
    onRemoveTask: (taskId: string) => void
    icon: React.ReactNode
  }

  const TaskColumn: React.FC<TaskColumnProps> = ({ title, status, tasks, onDropTask, moveTask, onRemoveTask, icon }) => {
    const [{ isOver }, drop] = useDrop<TaskDragItem, void, { isOver: boolean }>({
      accept: 'TASK',
      drop: (item) => {
        if (item.status !== status) {
          onDropTask(item.id, status)
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    })

    const columnTasks = tasks.filter(task => task.status === status)
    const dropRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      drop(dropRef)
    }, [drop])

    const handleAddTask = () => {
      const newTask = {
        id: `task-${Date.now()}`,
        title: 'New Task',
        status,
        order: columnTasks.length,
        created_at: new Date(),
        updated_at: new Date()
      };
      setFormData(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTask]
      }));
    };

    return (
      <div
        ref={dropRef}
        className={`
          relative flex flex-col gap-3 rounded-xl border border-white/10
          bg-gradient-to-b from-white/[0.06] to-white/[0.02]
          backdrop-blur-sm shadow-lg
          p-4 min-h-[200px] flex-1
          transition-all duration-300 ease-out
          ${isOver
            ? 'ring-2 ring-white/50 shadow-2xl shadow-white/20 bg-white/10 scale-[1.02]'
            : 'hover:shadow-xl hover:shadow-white/5 hover:bg-white/8'
          }
        `}
      >
        {/* Subtle inner glow effect when hovering */}
        <div className={`
          absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300
          ${isOver ? 'opacity-100' : 'group-hover:opacity-50'}
          bg-white/5
        `} />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="text-white/80">{icon}</div>
          <h4 className="font-medium text-white text-sm">{title}</h4>
          <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
            {columnTasks.length}
          </span>
        </div>

        {/* Scrollable Content */}
        <div className="relative z-10 flex-1 overflow-y-auto">
          <div className="space-y-2">
            {columnTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center mb-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white/20 border-dashed" />
                </div>
                <p className="text-xs text-white/60 font-medium">No tasks yet</p>
                <p className="text-xs text-white/40 mt-1">Drop tasks here or add new ones</p>
              </div>
            ) : (
              columnTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  moveTask={moveTask}
                  onRemoveTask={onRemoveTask}
                  onUpdateTask={updateTaskTitle}
                  editingTaskId={editingTaskId}
                  setEditingTaskId={setEditingTaskId}
                />
              ))
            )}
          </div>
        </div>

        {/* Footer with Add Task Button */}
        <div className="relative z-10 pt-3 border-t border-white/10">
          <button
            onClick={handleAddTask}
            className="
              w-full flex items-center justify-center gap-2
              px-3 py-2 rounded-lg
              bg-white/5 hover:bg-white/10
              transition-all duration-200 ease-out
              group
            "
          >
            <Plus className="h-3 w-3 transition-transform duration-200 group-hover:scale-110" />
            <span className="text-xs font-medium text-white/80">Add Task</span>
          </button>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-md flex items-center justify-center p-6">
      <div ref={modalRef} className="w-full max-w-4xl max-h-[90vh] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-2xl overflow-hidden">
        {/* Enhanced Header with Title, Status, and Tags */}
        <div className="border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50">
          {/* Top Row: Close Button */}
          <div className="flex justify-end p-4 pb-0">
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Main Header Content */}
          <div className="px-6 pb-6">
            {/* Title Section */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2 group">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyPress={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                    className="text-2xl font-bold bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 flex-1"
                    placeholder="Project title..."
                    autoFocus
                  />
                ) : (
                  <div className="relative flex-1">
                    <h1
                      className="text-2xl font-bold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-1 relative group"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      {formData.title || 'Untitled Project'}
                      {/* Subtle edit indicator */}
                      <span className="absolute -top-1 -right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-slate-400 font-normal">
                        click to edit
                      </span>
                    </h1>
                    {/* Underline hint */}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300 ease-out"></div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Edit3
                    className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors group-hover:text-blue-500 group-hover:scale-110 duration-200"
                    onClick={() => setIsEditingTitle(true)}
                  />
                  <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-medium">
                    Edit
                  </span>
                </div>
              </div>

              {/* URL Link */}
              {formData.url && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <ExternalLink className="h-3 w-3" />
                  <a
                    href={formData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                  >
                    {formData.url}
                  </a>
                </div>
              )}
            </div>

            {/* Status and Tags Row */}
            <div className="flex items-start gap-4 flex-wrap">
              {/* Status Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Status:</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    className={`
                      px-3 py-1 text-xs font-medium rounded-full border-2 cursor-pointer
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-all duration-200 flex items-center gap-1
                      ${getStatusConfig(formData.status).color}
                      ${getStatusConfig(formData.status).bg}
                      ${getStatusConfig(formData.status).border}
                      hover:opacity-80
                    `}
                  >
                    {getStatusConfig(formData.status).label}
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isStatusDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
                      {[
                        { value: 'planning', label: 'Planning' },
                        { value: 'in-progress', label: 'In Progress' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'on-hold', label: 'On Hold' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, status: option.value as Project['status'] }));
                            setIsStatusDropdownOpen(false);
                          }}
                          className={`
                            w-full px-3 py-2 text-xs font-medium text-left rounded-lg
                            transition-all duration-150 flex items-center gap-2
                            ${formData.status === option.value
                              ? `${getStatusConfig(option.value as Project['status']).color} ${getStatusConfig(option.value as Project['status']).bg}`
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }
                          `}
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            option.value === 'planning' ? 'bg-yellow-400' :
                            option.value === 'in-progress' ? 'bg-blue-400' :
                            option.value === 'completed' ? 'bg-green-400' : 'bg-red-400'
                          }`} />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tags Display */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Tags:</span>
                <div className="flex gap-1 flex-wrap">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-md text-xs font-medium"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}

                  {/* Quick Add Tag */}
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Add tag..."
                      className="w-20 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      onClick={addTag}
                      disabled={!newTag.trim()}
                      className="p-1 text-purple-600 hover:text-purple-700 disabled:text-slate-400 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 300px)' }}>
          <div className="space-y-10">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* URL */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Project URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="https://example.com"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Description
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setIsDescriptionPreview(false)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          !isDescriptionPreview
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                        }`}
                      >
                        <Edit className="h-3 w-3 mr-1 inline" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDescriptionPreview(true)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          isDescriptionPreview
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                        }`}
                      >
                        <Eye className="h-3 w-3 mr-1 inline" />
                        Preview
                      </button>
                    </div>
                  </div>

                  {!isDescriptionPreview && (
                    <div className="mb-2 p-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-t-lg border-b-0">
                      <div className="flex flex-wrap gap-1 items-center">
                        {/* Text formatting */}
                        <button
                          type="button"
                          onClick={() => formatText('bold')}
                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Bold (Ctrl+B)"
                        >
                          <Bold className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText('italic')}
                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Italic (Ctrl+I)"
                        >
                          <Italic className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText('code')}
                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Inline Code (Ctrl+`)"
                        >
                          <Code2 className="h-3 w-3" />
                        </button>

                        {/* Divider */}
                        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>

                        {/* Headers */}
                        <button
                          type="button"
                          onClick={() => formatText('h1')}
                          className="px-2 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Heading 1"
                        >
                          H1
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText('h2')}
                          className="px-2 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Heading 2"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText('h3')}
                          className="px-2 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Heading 3"
                        >
                          H3
                        </button>

                        {/* Divider */}
                        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>

                        {/* Lists and other elements */}
                        <button
                          type="button"
                          onClick={() => formatText('ul')}
                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Bullet List"
                        >
                          <List className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText('ol')}
                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Numbered List"
                        >
                          <ListOrdered className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText('quote')}
                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Quote"
                        >
                          <Quote className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText('link')}
                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Link (Ctrl+K)"
                        >
                          <Link className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText('codeblock')}
                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Code Block"
                        >
                          <Code className="h-3 w-3" />
                        </button>

                        {/* Info hint */}
                        <div className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                          Supports Markdown • Keyboard shortcuts available
                        </div>
                      </div>
                    </div>
                  )}

                  {!isDescriptionPreview ? (
                    <textarea
                      ref={descriptionTextareaRef}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      onKeyDown={handleKeyDown}
                      rows={6}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-t-none rounded-b-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-sm font-mono"
                      placeholder="Describe your project using Markdown...

**Example:**
# Project Overview
This is a **bold** statement with *italic* text.

## Features
- ✅ Feature 1
- 🚀 Feature 2
- 📱 Mobile responsive

## Tech Stack
```
React, TypeScript, Tailwind CSS
```

> **Note:** This supports GitHub Flavored Markdown

[Live Demo](https://demo.example.com) | [GitHub](https://github.com/user/repo)"
                    />
                  ) : (
                    <div className="w-full min-h-[140px] px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm overflow-auto">
                      {formData.description.trim() ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-slate">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({children}) => <h1 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{children}</h1>,
                              h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-slate-900 dark:text-white">{children}</h2>,
                              h3: ({children}) => <h3 className="text-sm font-medium mb-1 text-slate-900 dark:text-white">{children}</h3>,
                              p: ({children}) => <p className="mb-2 text-slate-700 dark:text-slate-300 leading-relaxed">{children}</p>,
                              ul: ({children}) => <ul className="list-disc list-inside mb-2 text-slate-700 dark:text-slate-300">{children}</ul>,
                              ol: ({children}) => <ol className="list-decimal list-inside mb-2 text-slate-700 dark:text-slate-300">{children}</ol>,
                              li: ({children}) => <li className="mb-1">{children}</li>,
                              a: ({href, children}) => <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                              code: ({children}) => <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-xs font-mono text-slate-800 dark:text-slate-200">{children}</code>,
                              pre: ({children}) => <pre className="bg-slate-100 dark:bg-slate-700 p-2 rounded text-xs font-mono overflow-x-auto mb-2">{children}</pre>,
                              strong: ({children}) => <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>,
                              em: ({children}) => <em className="italic text-slate-700 dark:text-slate-300">{children}</em>,
                              blockquote: ({children}) => <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-3 ml-2 italic text-slate-600 dark:text-slate-400">{children}</blockquote>,
                            }}
                          >
                            {formData.description}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-slate-400 dark:text-slate-500 italic">No description provided. Switch to Edit mode to add one.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Technologies Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md">
                  <Code className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">Technologies</h3>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="Add technology (e.g., React, Node.js)"
                />
                <button
                  onClick={addTechnology}
                  disabled={!newTech.trim()}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md text-xs font-medium"
                  >
                    {tech}
                    <button
                      onClick={() => removeTechnology(tech)}
                      className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Tasks Section - Mini Kanban Board */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                  <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">Task Management</h3>
              </div>

              {/* Mini Kanban Board */}
              <div className="grid grid-cols-3 gap-3 min-h-[160px]">
                <TaskColumn
                  title="To Do"
                  status="todo"
                  tasks={formData.tasks}
                  onDropTask={onDropTask}
                  moveTask={moveTask}
                  onRemoveTask={onRemoveTaskById}
                  icon={<Circle className="h-3 w-3 text-slate-500" />}
                />
                <TaskColumn
                  title="In Progress"
                  status="in-progress"
                  tasks={formData.tasks}
                  onDropTask={onDropTask}
                  moveTask={moveTask}
                  onRemoveTask={onRemoveTaskById}
                  icon={<CheckSquare className="h-3 w-3 text-blue-500" />}
                />
                <TaskColumn
                  title="Done"
                  status="done"
                  tasks={formData.tasks}
                  onDropTask={onDropTask}
                  moveTask={moveTask}
                  onRemoveTask={onRemoveTaskById}
                  icon={<CheckCircle2 className="h-3 w-3 text-green-500" />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50" style={{ minHeight: '60px', flexShrink: 0 }}>
          <button
            onClick={() => onDelete(project.id)}
            className="flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 font-medium text-sm"
          >
            <Trash2 className="h-4 w-4" />
            Delete Project
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.title.trim()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 text-sm ${
                !hasChanges || isSaving || !formData.title.trim()
                  ? 'bg-slate-400 cursor-not-allowed text-slate-200'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : !hasChanges ? (
                <>
                  <Save className="h-4 w-4" />
                  No Changes
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Project
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Render using portal to escape container bounds
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body)
  }

  return modalContent
}