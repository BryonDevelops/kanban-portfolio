"use client"

import React from 'react'
import { ProjectCard } from '@/presentation/components/shared/ProjectCard'
import { SectionBadge } from '@/presentation/components/shared/section-badge'

export default function ProjectsShowcasePage() {
  const projects = [
    {
      title: "Kanban Portfolio",
      description: "A modern portfolio website built with Next.js, featuring a kanban board interface for project management and beautiful tech stack showcases. Includes real-time collaboration, drag-and-drop functionality, and responsive design.",
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase', 'React', 'PostgreSQL'],
      link: "https://github.com/BryonDevelops/kanban-portfolio",
      github: "https://github.com/BryonDevelops/kanban-portfolio",
      featured: true
    },
    {
      title: "E-commerce Platform",
      description: "Full-stack e-commerce solution with React frontend, Node.js backend, and PostgreSQL database. Features include user authentication, payment processing, inventory management, and admin dashboard.",
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Express', 'JWT'],
      link: "#",
      github: "#"
    },
    {
      title: "Task Management App",
      description: "A collaborative task management application with real-time updates, team workspaces, and advanced filtering. Built with modern web technologies and cloud infrastructure.",
      technologies: ['Vue.js', 'Firebase', 'Tailwind CSS', 'Vuex', 'PWA'],
      link: "#",
      github: "#"
    },
    {
      title: "Weather Dashboard",
      description: "Beautiful weather dashboard with location-based forecasts, interactive maps, and weather alerts. Features include geolocation, offline support, and customizable widgets.",
      technologies: ['React', 'OpenWeather API', 'Chart.js', 'Service Workers', 'CSS Grid'],
      link: "#",
      github: "#"
    },
    {
      title: "Code Snippet Manager",
      description: "Developer tool for organizing and sharing code snippets with syntax highlighting, tagging, and search functionality. Includes public sharing and team collaboration features.",
      technologies: ['Next.js', 'Prisma', 'PlanetScale', 'Monaco Editor', 'Vercel'],
      link: "#",
      github: "#"
    },
    {
      title: "Social Media Analytics",
      description: "Comprehensive analytics dashboard for social media performance tracking. Features include data visualization, automated reporting, and multi-platform integration.",
      technologies: ['Python', 'Django', 'D3.js', 'PostgreSQL', 'Celery', 'Redis'],
      link: "#",
      github: "#"
    }
  ]

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

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div
                key={project.title}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <ProjectCard {...project} />
              </div>
            ))}
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
                  href="/projects"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-200 dark:border-blue-800 bg-white/90 dark:bg-white/5 backdrop-blur-sm text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium rounded-lg transition-all duration-200"
                >
                  View Kanban Board
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}