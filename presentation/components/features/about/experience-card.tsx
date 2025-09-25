"use client"

import React from 'react'

type Experience = {
  _id: string
  title: string
  company: string
  startDate: string
  endDate?: string
  isCurrent?: boolean
  description: string
  location?: string
  technologies?: string[]
  companyUrl?: string
  featured?: boolean
}

interface ExperienceCardProps {
  experience: Experience
  index: number
  isLast?: boolean
}

export function ExperienceCard({ experience: exp, index, isLast = false }: ExperienceCardProps) {
  const startYear = new Date(exp.startDate).getFullYear()
  const endYear = exp.endDate ? new Date(exp.endDate).getFullYear() : (exp.isCurrent ? 'Present' : '')
  const yearRange = exp.endDate ? `${startYear} - ${endYear}` : `${startYear} - Present`

  return (
    <div
      key={exp._id || index}
      className={`relative pl-8 sm:pl-12 border-l-2 ${isLast ? 'border-l-0' : 'border-gray-200/60 dark:border-white/20'}`}
    >
      {/* Timeline dot */}
      <div className="absolute -left-3 sm:-left-4 top-0 w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-white" />
      </div>

      <div className="bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 rounded-2xl p-6 sm:p-8 hover:border-gray-300/80 dark:hover:border-white/20 transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">{exp.title}</h3>
            <p className="text-blue-600 dark:text-blue-400 font-medium">{exp.company}</p>
            {exp.location && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{exp.location}</p>
            )}
          </div>
          <div className="text-sm text-gray-600 dark:text-white/60 bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full">
            {yearRange}
          </div>
        </div>
        <div className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
          <ul className="space-y-2">
            {exp.description.split('-').filter(item => item.trim()).map((item, paraIndex) => (
              <li key={paraIndex} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mt-2"></div>
                <span className="flex-1">{item.trim()}</span>
              </li>
            ))}
          </ul>
        </div>
        {exp.technologies && exp.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {exp.technologies.map((tech, techIndex) => (
              <span
                key={techIndex}
                className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}