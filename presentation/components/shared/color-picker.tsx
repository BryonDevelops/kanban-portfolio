"use client"

import React from 'react'

// Color picker component for category gradients
export function ColorPicker({
  value,
  onChange
}: {
  value: string
  onChange: (value: string) => void
}) {
  const gradientOptions = [
    { name: 'Blue to Cyan', value: 'from-blue-500 to-cyan-500', colors: ['#3b82f6', '#06b6d4'] },
    { name: 'Pink to Purple', value: 'from-pink-500 to-purple-500', colors: ['#ec4899', '#a855f7'] },
    { name: 'Green to Emerald', value: 'from-green-500 to-emerald-500', colors: ['#22c55e', '#10b981'] },
    { name: 'Orange to Red', value: 'from-orange-500 to-red-500', colors: ['#f97316', '#ef4444'] },
    { name: 'Indigo to Blue', value: 'from-indigo-500 to-blue-500', colors: ['#6366f1', '#3b82f6'] },
    { name: 'Teal to Cyan', value: 'from-teal-500 to-cyan-500', colors: ['#14b8a6', '#06b6d4'] },
    { name: 'Purple to Pink', value: 'from-purple-500 to-pink-500', colors: ['#a855f7', '#ec4899'] },
    { name: 'Yellow to Orange', value: 'from-yellow-500 to-orange-500', colors: ['#eab308', '#f97316'] },
    { name: 'Red to Pink', value: 'from-red-500 to-pink-500', colors: ['#ef4444', '#ec4899'] },
    { name: 'Emerald to Teal', value: 'from-emerald-500 to-teal-500', colors: ['#10b981', '#14b8a6'] },
    { name: 'Violet to Purple', value: 'from-violet-500 to-purple-500', colors: ['#8b5cf6', '#a855f7'] },
    { name: 'Sky to Blue', value: 'from-sky-500 to-blue-500', colors: ['#0ea5e9', '#3b82f6'] }
  ]

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Color Gradient</label>
      <div className="grid grid-cols-4 gap-2">
        {gradientOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange(option.value);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className={`relative h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
              value === option.value
                ? 'border-slate-800 dark:border-white ring-2 ring-slate-800/20 dark:ring-white/20'
                : 'border-slate-200 dark:border-slate-600'
            }`}
            style={{
              background: `linear-gradient(135deg, ${option.colors[0]}, ${option.colors[1]})`
            }}
            title={option.name}
          >
            {value === option.value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 dark:bg-black/90 rounded-full p-1">
                  <div className="w-2 h-2 bg-slate-800 dark:bg-white rounded-full"></div>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Selected: <span className="font-mono">{value}</span>
      </p>
    </div>
  )
}