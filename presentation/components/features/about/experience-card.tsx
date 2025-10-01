"use client"

import React from 'react'
import { TechStackCompact } from '@/presentation/components/shared/TechStack'

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
      {/* Timeline dot - enhanced for featured */}
      <div className={`absolute -left-3 sm:-left-4 top-0 w-6 h-6 rounded-full flex items-center justify-center ${
        exp.featured
          ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-lg shadow-yellow-500/50'
          : 'bg-gradient-to-r from-blue-500 to-purple-500'
      }`}>
        <div className={`w-2 h-2 rounded-full ${exp.featured ? 'bg-white' : 'bg-white'}`} />
        {exp.featured && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
        )}
      </div>

      <div className={`relative ${
        exp.featured
          ? 'bg-gradient-to-r from-yellow-50/90 via-orange-50/80 to-red-50/90 dark:from-yellow-950/20 dark:via-orange-950/15 dark:to-red-950/20 backdrop-blur-sm border-2 border-yellow-200/80 dark:border-yellow-800/50 rounded-2xl p-6 sm:p-8 shadow-xl shadow-yellow-500/20 dark:shadow-yellow-500/10'
          : 'bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 rounded-2xl p-6 sm:p-8 hover:border-gray-300/80 dark:hover:border-white/20'
      } transition-all duration-300`}>
        {/* Featured badge */}
        {exp.featured && (
          <div className="absolute -top-3 left-6 sm:left-8">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              FEATURED
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className={`text-xl sm:text-2xl font-bold mb-1 ${
              exp.featured
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-900 dark:text-white'
            }`}>{exp.title}</h3>
            <p className={`font-medium ${
              exp.featured
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}>{exp.company}</p>
            {exp.location && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{exp.location}</p>
            )}
          </div>
          <div className={`text-sm px-3 py-1 rounded-full ${
            exp.featured
              ? 'text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30'
              : 'text-gray-600 dark:text-white/60 bg-gray-100 dark:bg-white/10'
          }`}>
            {yearRange}
          </div>
        </div>
        <div className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
          <ul className="space-y-2">
            {exp.description
              .split('\n')
              .map(line => line.trim())
              .filter(line => line.startsWith('- '))
              .map(line => line.substring(2).trim())
              .filter(item => item.length > 0)
              .map((item, paraIndex) => (
              <li key={paraIndex} className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                  exp.featured
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}></div>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        {exp.technologies && exp.technologies.length > 0 && (
          <div className="mt-4">
            <TechStackCompact
              technologies={exp.technologies}
              size={16}
              className="justify-start"
            />
          </div>
        )}
      </div>
    </div>
  )
}