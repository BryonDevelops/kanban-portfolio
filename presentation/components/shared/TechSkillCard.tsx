"use client"

import React from 'react'
import { TechIcon } from './TechIcon'

interface TechSkillCardProps {
  name: string
  iconName?: string // Simple Icons name
  color: string
  description?: string
}

export function TechSkillCard({ name, iconName, color, description }: TechSkillCardProps) {
  return (
    <div className="group relative p-6 rounded-2xl bg-white/95 dark:bg-white/8 backdrop-blur-md border border-gray-200/80 dark:border-white/15 hover:border-gray-300/90 dark:hover:border-white/30 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-gray-300/30 dark:hover:shadow-white/10 hover:-translate-y-2 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
        <div className="absolute top-4 right-3 w-0.5 h-0.5 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-3 left-4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-2 right-2 w-0.5 h-0.5 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="flex flex-col items-center justify-center text-center relative z-10 h-full">
        {/* Icon container */}
        <div className="flex-1 flex items-center justify-center">
          <div className={`relative p-5 rounded-2xl bg-gradient-to-br ${color} shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-125 group-hover:rotate-3 overflow-hidden`}>
            {/* Tech Icon */}
            <div className="h-8 w-8 text-white drop-shadow-lg relative z-10 group-hover:animate-pulse flex items-center justify-center">
              <TechIcon name={iconName || name} size={32} className="text-white" />
            </div>

            {/* Icon background glow */}
            <div className="absolute inset-0 rounded-2xl bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

            {/* Rotating border effect */}
            <div className={`absolute inset-0 rounded-2xl border-2 border-white/50 opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:animate-spin`} style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* Text container that slides up from bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg px-2 py-1 border border-gray-200/50 dark:border-white/20 shadow-lg">
              <span className="text-sm font-bold text-gray-900 dark:text-white block text-center leading-tight drop-shadow-sm">
                {name.split('').map((letter, index) => (
                  <span
                    key={index}
                    className="inline-block opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 ease-out"
                    style={{
                      transitionDelay: `${index * 30}ms`,
                    }}
                  >
                    {letter === ' ' ? '\u00A0' : letter}
                  </span>
                ))}
              </span>
              {description && (
                <span className="text-xs text-gray-600 dark:text-gray-400 block mt-1">
                  {description}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced animated background glow with multiple layers */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-15 transition-opacity duration-700 blur-2xl group-hover:blur-3xl`} />
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-tl ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-1000 blur-xl`} style={{ animationDelay: '0.2s' }} />

      {/* Floating particles effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '2s' }} />
        <div className="absolute top-3/4 right-1/4 w-0.5 h-0.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '1.5s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }} />
      </div>

      {/* Pulsing border effect */}
      <div className={`absolute inset-0 rounded-2xl border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-pulse`} />
    </div>
  )
}