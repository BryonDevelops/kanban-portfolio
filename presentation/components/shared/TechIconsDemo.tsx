"use client"

import React from 'react'
import { TechIcon, POPULAR_TECH_STACKS } from './TechIcon'
import { TechStack, TechStackCompact } from './TechStack'
import { TechSkillCard } from './TechSkillCard'
import { ProjectCard } from './ProjectCard'

export function TechIconsDemo() {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Tech Icons Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Showcase your skills and projects with beautiful tech icons
        </p>
      </div>

      {/* Individual Tech Icons */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Individual Tech Icons
        </h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {POPULAR_TECH_STACKS.frontend.slice(0, 8).map((tech) => (
            <div key={tech} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
              <TechIcon name={tech} size={48} />
              <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {tech}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stacks */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Tech Stacks
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Frontend Stack
            </h3>
            <TechStack technologies={[...POPULAR_TECH_STACKS.frontend]} showLabels />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Full Stack
            </h3>
            <TechStackCompact
              technologies={[
                ...POPULAR_TECH_STACKS.frontend.slice(0, 3),
                ...POPULAR_TECH_STACKS.backend.slice(0, 2),
                ...POPULAR_TECH_STACKS.databases.slice(0, 1)
              ]}
            />
          </div>
        </div>
      </section>

      {/* Tech Skill Cards */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Tech Skill Cards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TechSkillCard
            name="React"
            iconName="React"
            color="from-blue-500 to-cyan-500"
            description="Modern UI library"
          />
          <TechSkillCard
            name="TypeScript"
            iconName="TypeScript"
            color="from-blue-600 to-blue-800"
            description="Typed JavaScript"
          />
          <TechSkillCard
            name="Next.js"
            iconName="Next.js"
            color="from-gray-900 to-gray-700"
            description="React framework"
          />
        </div>
      </section>

      {/* Project Cards */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Project Cards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProjectCard
            title="Kanban Portfolio"
            description="A modern portfolio website built with Next.js, featuring a kanban board interface for project management and beautiful tech stack showcases."
            technologies={['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase']}
            link="#"
            github="#"
            featured={true}
          />
          <ProjectCard
            title="E-commerce Platform"
            description="Full-stack e-commerce solution with React frontend, Node.js backend, and PostgreSQL database."
            technologies={['React', 'Node.js', 'PostgreSQL', 'Stripe']}
            link="#"
            github="#"
          />
        </div>
      </section>

      {/* Usage Examples */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Usage Examples
        </h2>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`// Individual icon
<TechIcon name="React" size={32} />

// Tech stack with labels
<TechStack
  technologies={['React', 'TypeScript', 'Next.js']}
  showLabels
/>

// Compact inline stack
<TechStackCompact
  technologies={['React', 'Node.js', 'PostgreSQL']}
/>

// Skill card
<TechSkillCard
  name="React"
  iconName="React"
  color="from-blue-500 to-cyan-500"
  description="Modern UI library"
/>

// Project card
<ProjectCard
  title="My Project"
  description="Project description..."
  technologies={['React', 'TypeScript']}
  github="https://github.com/user/repo"
/>`}
          </pre>
        </div>
      </section>
    </div>
  )
}