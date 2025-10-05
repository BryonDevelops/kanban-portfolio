"use client"

import { TECH_STACK, TechItem } from '../../../features/projects/tech-data';
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { DndContext, DragEndEvent, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { X, Save, Plus, Trash2, Code, FileText, CheckSquare, Circle, CheckCircle2, GripVertical, Edit3, ExternalLink, Eye, Edit, Bold, Italic, Link, List, ListOrdered, Quote, Code2, ChevronDown, ChevronUp, Paperclip, Settings, Info, Maximize2, Minimize2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Project } from '../../../../../domain/board/schemas/project.schema'
import { createPortal } from 'react-dom'
import { useIsAdmin } from '../../../shared/ProtectedRoute'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs"
import { ImageUploadDropdown } from '../../../shared/image-upload-dropdown'
import { TechStackPicker } from '../../../shared/TechStackPicker';



type Props = {
  project: Project
  isOpen: boolean
  onClose: () => void
  onSave: (project: Project) => void
  onDelete: (projectId: string) => void
}

// localStorage utilities for non-admin users
const LOCAL_STORAGE_KEY = 'kanban-project-changes'

const saveProjectToLocalStorage = (projectId: string, projectData: Partial<Project>) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}')
    existingData[projectId] = {
      ...projectData,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingData))
  } catch (error) {
    console.error('Failed to save project to localStorage:', error)
  }
}

export default function EditProjectForm({ project, isOpen, onClose, onSave, onDelete }: Props) {
  const isAdmin = useIsAdmin()
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || '',
    url: project.url || '',
    status: project.status,
    technologies: [...project.technologies],
    tags: [...project.tags],
    tasks: [...(project.tasks || [])],
    image: project.image || '',
    attachments: [...(project.attachments || [])],
    notes: project.notes || '',
    architecture: project.architecture || ''
  })

  // newTech and setNewTech removed (replaced by TechStackPicker)
  const [newTag, setNewTag] = useState('')
  const [newAttachment, setNewAttachment] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [isDescriptionPreview, setIsDescriptionPreview] = useState(false)
  const [isImagePreviewExpanded, setIsImagePreviewExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const descriptionTextareaRef = React.useRef<HTMLTextAreaElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Client-only drag and drop wrapper to prevent hydration mismatches
  const TaskBoardClientOnly: React.FC<{
    formData: { tasks: Project['tasks'] };
    onDropTask: (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => void;
    onRemoveTaskById: (taskId: string) => void;
    setFormData: React.Dispatch<React.SetStateAction<typeof formData>>;
    editingTaskId: string | null;
    setEditingTaskId: (taskId: string | null) => void;
    updateTaskTitle: (taskId: string, newTitle: string) => void;
  }> = ({ formData, onDropTask, onRemoveTaskById, setFormData, editingTaskId, setEditingTaskId, updateTaskTitle }) => {
    const [isClient, setIsClient] = React.useState(false);

    // Dnd-kit sensors - must be called unconditionally
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor)
    )

    React.useEffect(() => {
      setIsClient(true);
    }, []);

    // Handle drag end for task reordering and status changes
    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event

      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      // Find the active task
      const activeTask = formData.tasks.find((task: Project['tasks'][0]) => task.id === activeId)
      if (!activeTask) return

      // Check if dropping on a column (status change)
      if (overId.startsWith('column-')) {
        const newStatus = overId.replace('column-', '') as 'todo' | 'in-progress' | 'done'
        if (activeTask.status !== newStatus) {
          onDropTask(activeId, newStatus)
        }
        return
      }

      // Check if dropping on another task (reordering)
      const overTask = formData.tasks.find((task: Project['tasks'][0]) => task.id === overId)
      if (!overTask) return

      // If same status, reorder within column
      if (activeTask.status === overTask.status) {
        const statusTasks = formData.tasks.filter((task: Project['tasks'][0]) => task.status === activeTask.status)
        const activeIndex = statusTasks.findIndex((task: Project['tasks'][0]) => task.id === activeId)
        const overIndex = statusTasks.findIndex((task: Project['tasks'][0]) => task.id === overId)

        if (activeIndex !== overIndex) {
          // Reorder tasks within the same status
          const reorderedTasks = [...formData.tasks]
          const statusTasksCopy = statusTasks.filter((task: Project['tasks'][0]) => task.id !== activeId)
          statusTasksCopy.splice(overIndex, 0, activeTask)

          // Update the main tasks array
          const updatedTasks = reorderedTasks.map((task: Project['tasks'][0]) => {
            if (task.status === activeTask.status) {
              return statusTasksCopy.shift() || task
            }
            return task
          })

          setFormData((prev) => ({
            ...prev,
            tasks: updatedTasks
          }))
        }
      } else {
        // Different status - move to new column
        onDropTask(activeId, overTask.status || 'todo')
      }
    }

    if (!isClient) {
      // Server-side rendering fallback
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 min-h-[160px]">
          <TaskColumn
            title="To Do"
            status="todo"
            tasks={formData.tasks}
            onRemoveTask={onRemoveTaskById}
            icon={<Circle className="h-3 w-3 text-slate-500" />}
            editingTaskId={editingTaskId}
            setEditingTaskId={setEditingTaskId}
            updateTaskTitle={updateTaskTitle}
          />
          <TaskColumn
            title="In Progress"
            status="in-progress"
            tasks={formData.tasks}
            onRemoveTask={onRemoveTaskById}
            icon={<CheckSquare className="h-3 w-3 text-blue-500" />}
            editingTaskId={editingTaskId}
            setEditingTaskId={setEditingTaskId}
            updateTaskTitle={updateTaskTitle}
          />
          <TaskColumn
            title="Done"
            status="done"
            tasks={formData.tasks}
            onRemoveTask={onRemoveTaskById}
            icon={<CheckCircle2 className="h-3 w-3 text-green-500" />}
            editingTaskId={editingTaskId}
            setEditingTaskId={setEditingTaskId}
            updateTaskTitle={updateTaskTitle}
          />
        </div>
      );
    }

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 min-h-[160px]">
          <SortableContext items={formData.tasks.map((task: Project['tasks'][0]) => task.id)} strategy={verticalListSortingStrategy}>
            <TaskColumn
              title="To Do"
              status="todo"
              tasks={formData.tasks}
              onRemoveTask={onRemoveTaskById}
              icon={<Circle className="h-3 w-3 text-slate-500" />}
              editingTaskId={editingTaskId}
              setEditingTaskId={setEditingTaskId}
              updateTaskTitle={updateTaskTitle}
            />
            <TaskColumn
              title="In Progress"
              status="in-progress"
              tasks={formData.tasks}
              onRemoveTask={onRemoveTaskById}
              icon={<CheckSquare className="h-3 w-3 text-blue-500" />}
              editingTaskId={editingTaskId}
              setEditingTaskId={setEditingTaskId}
              updateTaskTitle={updateTaskTitle}
            />
            <TaskColumn
              title="Done"
              status="done"
              tasks={formData.tasks}
              onRemoveTask={onRemoveTaskById}
              icon={<CheckCircle2 className="h-3 w-3 text-green-500" />}
              editingTaskId={editingTaskId}
              setEditingTaskId={setEditingTaskId}
              updateTaskTitle={updateTaskTitle}
            />
          </SortableContext>
        </div>
      </DndContext>
    );
  }

  // Click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      // Don't close modal if clicking on dropdown menu content, dialog content, or Unsplash modal
      if (target.closest('[data-radix-popper-content-wrapper]') ||
          target.closest('[data-radix-dropdown-menu-content]') ||
          target.closest('[data-radix-dropdown-menu-trigger]') ||
          target.closest('[data-radix-dialog-overlay]') ||
          target.closest('[data-radix-dialog-content]') ||
          target.closest('[data-radix-dialog-trigger]') ||
          target.closest('[data-unsplash-modal]')) {
        return
      }

      if (modalRef.current && !modalRef.current.contains(target)) {
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
      formData.image !== (project.image || '') ||
      JSON.stringify(formData.attachments) !== JSON.stringify(project.attachments || []) ||
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
        image: formData.image.trim() || undefined,
        attachments: formData.attachments,
        notes: formData.notes?.trim() || undefined,
        architecture: formData.architecture?.trim() || undefined,
        updated_at: new Date()
      }

      if (isAdmin) {
        // Admin users save to database
        await onSave(updatedProject)
        onClose()
        // Show success toast for database save
        import("@/presentation/utils/toast").then(({ success }) => {
          success("Project saved!", "Your changes have been saved to the database.");
        });
      } else {
        // Non-admin users save to localStorage
        saveProjectToLocalStorage(project.id, {
          title: updatedProject.title,
          description: updatedProject.description,
          url: updatedProject.url,
          status: updatedProject.status,
          technologies: updatedProject.technologies,
          tags: updatedProject.tags,
          tasks: updatedProject.tasks,
          image: updatedProject.image,
          attachments: updatedProject.attachments,
          notes: updatedProject.notes,
          architecture: updatedProject.architecture,
          updated_at: updatedProject.updated_at
        })
        onClose()
        // Show info toast for localStorage save
        import("@/presentation/utils/toast").then(({ info }) => {
          info("Project saved locally!", "Your changes are saved in your browser. Only admins can save to the database.");
        });
      }
    } catch (error) {
      console.error('Failed to save project:', error)
    } finally {
      setIsSaving(false)
    }
  }, [formData, project, onSave, onClose, isAdmin])

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

  // addTechnology and removeTechnology removed (replaced by TechStackPicker)

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

  const addAttachment = () => {
    if (newAttachment.trim()) {
      const attachment = {
        id: `attachment-${Date.now()}`,
        name: newAttachment.trim(),
        url: newAttachment.trim(),
        type: 'link' // default type for URL attachments
      }
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, attachment]
      }))
      setNewAttachment('')
    }
  }

  const removeAttachment = (attachmentId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
    }))
  }

  // Task drag and drop functions
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

  interface TaskCardProps {
    task: Project['tasks'][0]
    index: number
    onRemoveTask: (taskId: string) => void
    onUpdateTask: (taskId: string, newTitle: string) => void
    editingTaskId: string | null
    setEditingTaskId: (taskId: string | null) => void
  }

  const TaskCard: React.FC<TaskCardProps> = ({ task, index, onRemoveTask, onUpdateTask, editingTaskId, setEditingTaskId }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: task.id,
      data: {
        type: 'TASK',
        task,
        index,
        status: task.status || 'todo'
      }
    })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

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
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
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
    onRemoveTask: (taskId: string) => void
    icon: React.ReactNode
    editingTaskId: string | null
    setEditingTaskId: (taskId: string | null) => void
    updateTaskTitle: (taskId: string, newTitle: string) => void
  }

  const TaskColumn: React.FC<TaskColumnProps> = ({ title, status, tasks, onRemoveTask, icon, editingTaskId, setEditingTaskId, updateTaskTitle }) => {
    const { isOver, setNodeRef } = useDroppable({
      id: `column-${status}`,
      data: {
        type: 'COLUMN',
        status
      }
    })

    const columnTasks = tasks.filter(task => task.status === status)

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
        ref={setNodeRef}
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
    <div className={`fixed z-[9999] bg-black/50 backdrop-blur-md ${
      isFullscreen
        ? 'inset-0 p-0'
        : 'inset-0 flex items-center justify-center p-2 sm:p-4 md:p-6'
    }`}>
      <div
        ref={modalRef}
        className={`w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl overflow-hidden relative ${
          isFullscreen
            ? 'max-w-none max-h-screen h-screen rounded-none flex flex-col'
            : 'max-w-4xl max-h-[95vh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl'
        }`}
      >
        {/* Enhanced Header with Title, Status, and Tags */}
        <div className="border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50">
          {/* Top Row: Fullscreen and Close Buttons */}
          <div className="flex justify-between items-center p-4 pb-0">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Main Header Content */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            {/* Title Section */}
            <div className="mb-3 sm:mb-4">
              <div className="flex items-start gap-2 sm:gap-3 mb-2 group">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyPress={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                    className="text-xl sm:text-2xl font-bold bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 flex-1"
                    placeholder="Project title..."
                    autoFocus
                  />
                ) : (
                  <div className="relative flex-1">
                    <h1
                      className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-1 relative group"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      {formData.title || 'Untitled Project'}
                    </h1>
                    {/* Underline hint */}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300 ease-out"></div>
                  </div>
                )}
              </div>

              {/* URL Link */}
              {formData.url && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Status Selector */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Status:</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    className={`
                      px-3 py-1.5 text-xs font-medium rounded-full border-2 cursor-pointer
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-all duration-200 flex items-center gap-2 min-w-[100px] justify-center
                      ${getStatusConfig(formData.status).color}
                      ${getStatusConfig(formData.status).bg}
                      ${getStatusConfig(formData.status).border}
                      hover:opacity-80
                    `}
                  >
                    {getStatusConfig(formData.status).label}
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isStatusDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
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
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
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
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Tags:</span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">({formData.tags.length})</span>
                </div>
                <div className="flex gap-1 flex-wrap items-center">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-md text-xs font-medium"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition-colors ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}

                  {/* Quick Add Tag */}
                  <div className="flex items-center gap-1 ml-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Add tag..."
                      className="w-20 sm:w-24 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
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
        <div className={`p-4 sm:p-6 overflow-y-auto relative z-10 ${isFullscreen ? 'flex-1' : ''}`} style={isFullscreen ? {} : { maxHeight: 'calc(95vh - 300px)' }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                <span className="hidden sm:inline">Resources</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Notes</span>
              </TabsTrigger>
              <TabsTrigger value="architecture" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Architecture</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

                  {/* Image URL */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Project Image
                      </label>
                      <div
                        className="relative group cursor-help"
                        title="Optional: Add a cover image for your project (JPG, PNG, WebP, etc.) - upload from device, paste from clipboard, or browse Unsplash"
                      >
                        <Info className="h-3 w-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 text-xs rounded shadow-lg max-w-xs text-center leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                          <div className="font-medium mb-1">Optional Image Upload</div>
                          <div>Add a cover image for your project:</div>
                          <div>• Upload from device (JPG, PNG, WebP)</div>
                          <div>• Paste from clipboard</div>
                          <div>• Browse Unsplash</div>
                        </div>
                      </div>
                    </div>
                    <ImageUploadDropdown
                      value={formData.image}
                      onChange={(value) => {
                        setFormData(prev => ({ ...prev, image: value || '' }))
                      }}
                      placeholder="Select or upload project image..."
                    />
                  </div>

                  {/* Project Image Preview */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Image Preview
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsImagePreviewExpanded(!isImagePreviewExpanded)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-all duration-200"
                      >
                        {isImagePreviewExpanded ? (
                          <>
                            <span>Hide</span>
                            <ChevronUp className="h-3 w-3" />
                          </>
                        ) : (
                          <>
                            <span>Show</span>
                            <ChevronDown className="h-3 w-3" />
                          </>
                        )}
                      </button>
                    </div>

                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isImagePreviewExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="relative w-full max-w-md mx-auto">
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 shadow-sm">
                          {formData.image ? (
                            <>
                              <Image
                                src={formData.image}
                                alt={`${formData.title} preview`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                  // Hide image on error
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-2xl mb-2">🖼️</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">No image URL provided</div>
                                <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">Enter a URL above to see preview</div>
                              </div>
                            </div>
                          )}
                        </div>
                        {formData.image && (
                          <div className="absolute top-2 right-2 px-2 py-1 text-xs rounded-md bg-black/60 text-white backdrop-blur-sm font-medium">
                            Preview
                          </div>
                        )}
                      </div>
                    </div>
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
                        <div className="flex flex-wrap gap-1 items-center overflow-x-auto">
                          {/* Text formatting */}
                          <button
                            type="button"
                            onClick={() => formatText('bold')}
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                            title="Bold (Ctrl+B)"
                          >
                            <Bold className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => formatText('italic')}
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                            title="Italic (Ctrl+I)"
                          >
                            <Italic className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => formatText('code')}
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                            title="Inline Code (Ctrl+`)"
                          >
                            <Code2 className="h-3 w-3" />
                          </button>

                          {/* Divider */}
                          <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1 flex-shrink-0"></div>

                          {/* Headers */}
                          <button
                            type="button"
                            onClick={() => formatText('h1')}
                            className="px-2 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                            title="Heading 1"
                          >
                            H1
                          </button>
                          <button
                            type="button"
                            onClick={() => formatText('h2')}
                            className="px-2 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                            title="Heading 2"
                          >
                            H2
                          </button>
                          <button
                            type="button"
                            onClick={() => formatText('h3')}
                            className="px-2 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                            title="Heading 3"
                          >
                            H3
                          </button>

                          {/* Divider */}
                          <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1 flex-shrink-0"></div>

                          {/* Lists and other elements */}
                          <button
                            type="button"
                            onClick={() => formatText('ul')}
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                            title="Bullet List"
                          >
                            <List className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => formatText('ol')}
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                            title="Numbered List"
                          >
                            <ListOrdered className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => formatText('quote')}
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                            title="Quote"
                          >
                            <Quote className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => formatText('link')}
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                            title="Link (Ctrl+K)"
                          >
                            <Link className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => formatText('codeblock')}
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                            title="Code Block"
                          >
                            <Code className="h-3 w-3" />
                          </button>

                          {/* Info hint */}
                          <div className="ml-auto text-xs text-slate-500 dark:text-slate-400 hidden sm:block flex-shrink-0">
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

                <TechStackPicker
                  value={formData.technologies
                    .map(t => TECH_STACK.find(item => item.id === (typeof t === 'string' ? t : (t as TechItem).id))!)
                    .filter(Boolean) as TechItem[]}
                  onChange={techs => setFormData(prev => ({
                    ...prev,
                    technologies: techs.map(t => t.id)
                  }))}
                />
              </div>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-6">
              {/* Attachments Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-md">
                    <Paperclip className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">Attachments</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-500">({formData.attachments.length})</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newAttachment}
                    onChange={(e) => setNewAttachment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addAttachment()}
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Add attachment URL (e.g., https://example.com/file.pdf)"
                  />
                  <button
                    onClick={addAttachment}
                    disabled={!newAttachment.trim()}
                    className="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <Paperclip className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 truncate"
                          >
                            {attachment.name}
                          </a>
                          {attachment.type && (
                            <span className="text-xs text-slate-500 dark:text-slate-500 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                              {attachment.type}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500 truncate mt-1">
                          {attachment.url}
                        </div>
                      </div>
                      <button
                        onClick={() => removeAttachment(attachment.id)}
                        className="flex-shrink-0 p-1 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {formData.attachments.length === 0 && (
                    <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                      <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No attachments yet</p>
                      <p className="text-xs mt-1">Add links to documents, files, or resources</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-6">
              {/* Tasks Section - Mini Kanban Board */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                    <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">Task Management</h3>
                </div>

                {/* Mini Kanban Board */}
                <TaskBoardClientOnly
                  formData={{ tasks: formData.tasks }}
                  onDropTask={onDropTask}
                  onRemoveTaskById={onRemoveTaskById}
                  setFormData={setFormData}
                  editingTaskId={editingTaskId}
                  setEditingTaskId={setEditingTaskId}
                  updateTaskTitle={updateTaskTitle}
                />
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                    <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">Internal Notes</h3>
                </div>

                <div className="space-y-2">
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={12}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none text-sm"
                    placeholder="Add internal notes, observations, or reminders about this project...

**Examples:**
- Key decisions made during development
- Important considerations for future updates
- Lessons learned
- TODO items for later
- Meeting notes or discussions"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Architecture Tab */}
            <TabsContent value="architecture" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-md">
                    <Settings className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">Technical Architecture</h3>
                </div>

                <div className="space-y-2">
                  <textarea
                    value={formData.architecture || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, architecture: e.target.value }))}
                    rows={12}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none text-sm font-mono"
                    placeholder="Document the technical architecture, design patterns, and implementation details...

**Examples:**
# System Architecture
- Frontend: React + TypeScript
- Backend: Node.js + Express
- Database: PostgreSQL
- Authentication: JWT tokens

# Design Patterns
- Component composition
- Custom hooks for state management
- Repository pattern for data access

# Key Components
- User authentication flow
- Data validation layers
- Error handling strategies

# Infrastructure
- Deployment pipeline
- Monitoring and logging
- Performance optimizations"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 ${isFullscreen ? 'mt-auto' : ''}`} style={isFullscreen ? {} : { minHeight: '60px', flexShrink: 0 }}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(project.id)}
              className="flex items-center justify-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 font-medium text-sm"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete Project</span>
              <span className="sm:hidden">Delete</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.title.trim()}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 text-sm ${
                !hasChanges || isSaving || !formData.title.trim()
                  ? 'bg-slate-400 cursor-not-allowed text-slate-200'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : !hasChanges ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  No Changes
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isAdmin ? 'Save to Database' : 'Save Locally'}
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