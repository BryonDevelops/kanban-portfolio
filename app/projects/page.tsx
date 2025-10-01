"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { ProjectCard, ShowcasedProject } from '@/presentation/components/shared/ProjectCard'
import { SectionBadge } from '@/presentation/components/shared/section-badge'
import { useIsAdmin } from '@/presentation/components/shared/ProtectedRoute'
import { CreateShowcasedProjectForm } from '@/presentation/components/features/projects/forms/CreateShowcasedProjectForm'
import { EditShowcasedProjectForm } from '@/presentation/components/features/projects/forms/EditShowcasedProjectForm'
import { Button } from '@/presentation/components/ui/button'
import { Plus, RefreshCw } from 'lucide-react'
import { Project } from '@/domain/board/schemas/project.schema'

export default function ProjectsShowcasePage() {
  const isAdmin = useIsAdmin()

  // State for managing projects
  const [projects, setProjects] = useState<ShowcasedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [manualProjects, setManualProjects] = useState<ShowcasedProject[]>([
    {
      id: "kanban-portfolio",
      title: "Kanban Portfolio",
      description: "A modern portfolio website built with Next.js, featuring a kanban board interface for project management and beautiful tech stack showcases. Includes real-time collaboration, drag-and-drop functionality, and responsive design.",
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase', 'React', 'PostgreSQL'],
      link: "https://github.com/BryonDevelops/kanban-portfolio",
      github: "https://github.com/BryonDevelops/kanban-portfolio",
      featured: true
    },
  ])

  // Admin UI state
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<ShowcasedProject | null>(null)

  // Fetch completed projects from kanban board
  const fetchCompletedProjects = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')
      if (response.ok) {
        const kanbanProjects: Project[] = await response.json()

        // Filter for completed projects and convert to ShowcasedProject format
        const completedProjects: ShowcasedProject[] = kanbanProjects
          .filter(project => project.status === 'completed')
          .map(project => ({
            id: project.id,
            title: project.title,
            description: project.description || '',
            technologies: project.technologies,
            image: project.image,
            link: project.url,
            github: project.url, // You might want to have separate github field in Project schema
            featured: false, // You can add logic to determine featured projects
            isCompletedKanbanProject: true
          }))

        // Combine with manual projects and sort (completed projects first, then manual)
        setProjects([...completedProjects, ...manualProjects])
      }
    } catch (error) {
      console.error('Failed to fetch completed projects:', error)
      // Fallback to manual projects only
      setProjects(manualProjects)
      } finally {
        setLoading(false)
      }
    }, [manualProjects])

  // Load projects on component mount
  useEffect(() => {
    fetchCompletedProjects()
  }, [fetchCompletedProjects])  // Project management functions
  const handleProjectCreated = (newProject: ShowcasedProject) => {
    setManualProjects(prev => [newProject, ...prev])
  }

  const handleProjectUpdated = (updatedProject: ShowcasedProject) => {
    setManualProjects(prev =>
      prev.map(project =>
        project.id === updatedProject.id ? updatedProject : project
      )
    )
    setProjectToEdit(null)
  }

  const handleProjectDeleted = (projectToDelete: ShowcasedProject) => {
    setManualProjects(prev => prev.filter(project => project.id !== projectToDelete.id))

    // Show success toast
    import("@/presentation/utils/toast").then(({ success }) => {
      success("Project deleted!", `"${projectToDelete.title}" has been removed from the showcase.`)
    })
  }

  const handleEditProject = (project: ShowcasedProject) => {
    setProjectToEdit(project)
    setShowEditForm(true)
  }

  return (
    <div className="relative min-h-screen">
      {/* Full screen background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-pink-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -z-10" />

      {/* Enhanced Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary gradient orbs */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-blue-300/20 via-purple-300/20 to-pink-300/20 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-cyan-300/20 via-emerald-300/20 to-teal-300/20 dark:from-emerald-500/10 dark:via-cyan-500/10 dark:to-blue-500/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Secondary accent orbs */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-r from-violet-300/15 to-fuchsia-300/15 dark:from-violet-500/5 dark:to-fuchsia-500/5 blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-16 sm:mb-20 lg:mb-24">
            <SectionBadge text="Projects" className="mb-6" />

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-white dark:via-blue-100 dark:to-purple-200 bg-clip-text text-transparent">
                Featured Work
              </span>
              <br />
              <span className="text-gray-900 dark:text-white/90">Built with Modern Tech</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              A showcase of projects that demonstrate my expertise in full-stack development,
              modern web technologies, and creating exceptional user experiences.
            </p>
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8 mx-auto max-w-md">
              <div className="text-center mb-4">
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  <span className="font-semibold">Admin Mode:</span> {loading ? 'Loading...' : `Managing ${projects.length} showcase projects`}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Manual Project
                  </Button>
                  <Button
                    onClick={fetchCompletedProjects}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
                Shows completed kanban projects + manual showcase projects. Use (⋮) menu to edit/delete manual projects.
              </p>
            </div>
          )}

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => {
              // Only allow editing/deleting of manual projects (those with 'showcase-' prefix or in manualProjects)
              const isManualProject = project.id?.startsWith('showcase-') || manualProjects.some(mp => mp.id === project.id)

              return (
                <div
                  key={project.id || project.title}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <ProjectCard
                    {...project}
                    onEdit={isManualProject ? handleEditProject : undefined}
                    onDelete={isManualProject ? handleProjectDeleted : undefined}
                  />
                </div>
              )
            })}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16 sm:mt-20 lg:mt-24">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Interested in Working Together?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                I&apos;m always excited to take on new challenges and collaborate on innovative projects.
                Let&apos;s discuss how we can bring your ideas to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Get In Touch
                </a>
                <a
                  href="/board"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-200 dark:border-blue-800 bg-white/90 dark:bg-white/5 backdrop-blur-sm text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium rounded-lg transition-all duration-200"
                >
                  View Kanban Board
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Forms */}
      <CreateShowcasedProjectForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onProjectCreated={handleProjectCreated}
      />

      <EditShowcasedProjectForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        project={projectToEdit}
        onProjectUpdated={handleProjectUpdated}
      />
    </div>
  )
}