"use client"

import { Skeleton } from "@/presentation/components/ui/skeleton"

export function BoardSkeleton() {
  const columnOrder = ['ideas', 'in-progress', 'completed']

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 md:gap-5 lg:gap-6 overflow-x-hidden">
      {columnOrder.map((colId) => (
        <div
          key={colId}
          className="flex-1 min-w-0 flex flex-col rounded-2xl border border-border bg-card backdrop-blur-xl shadow-2xl min-h-full overflow-hidden"
        >
          <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-h-0">
            {/* Column Header Skeleton */}
            <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 md:-mx-8 -mt-4 sm:-mt-6 md:-mt-8 px-6 sm:px-8 md:px-10 py-4 sm:py-6 md:py-8 bg-card/95 backdrop-blur-xl border-b border-border flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3 pl-4 sm:pl-6 md:pl-8">
                  <Skeleton className={`h-3 w-3 md:h-4 md:w-4 rounded-full ${
                    colId === 'ideas' ? 'bg-blue-400/50' :
                    colId === 'in-progress' ? 'bg-amber-400/50' :
                    'bg-emerald-400/50'
                  }`} />
                  <Skeleton className="h-5 w-24 md:h-6 md:w-32" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>

                <div className="flex items-center gap-1 sm:gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-6 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
              </div>
            </div>

            {/* Column Content Skeleton */}
            <div className="pt-6 sm:pt-8 md:pt-10 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 flex-1 space-y-4 md:space-y-6">
              {/* Project Cards Skeleton */}
              {Array.from({ length: colId === 'ideas' ? 3 : colId === 'in-progress' ? 2 : 1 }).map((_, index) => (
                <div
                  key={index}
                  className="relative rounded-xl border border-border bg-card backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(255,255,255,0.08),0_4px_16px_rgba(255,255,255,0.04)] p-3 sm:p-4 md:p-5 select-none"
                >
                  {/* Header area */}
                  <div className="relative mb-4 sm:mb-5 md:mb-6">
                    <div className="relative flex items-center justify-between gap-3 p-2 sm:p-3 rounded-lg">
                      {/* Left side - Drag handle and title */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Drag indicator skeleton */}
                        <div className="flex flex-col gap-0.5 p-2 rounded-md">
                          <Skeleton className="w-4 h-0.5 rounded-full" />
                          <Skeleton className="w-4 h-0.5 rounded-full" />
                          <Skeleton className="w-4 h-0.5 rounded-full" />
                        </div>

                        {/* Title skeleton */}
                        <div className="flex-1 min-w-0">
                          <Skeleton className="h-4 w-32 sm:h-5 sm:w-40 mb-1" />
                        </div>
                      </div>

                      {/* Right side - Action buttons */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                    <Skeleton className={`h-5 w-16 sm:h-6 sm:w-20 rounded-full`} />
                  </div>

                  {/* Project Image Placeholder */}
                  <div className="relative mb-3 sm:mb-4 md:mb-5 -mx-1">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/50 bg-muted/30">
                      <Skeleton className="w-full h-full rounded-lg" />
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-1 mb-1 sm:mb-2">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-12 rounded-md" />
                    <Skeleton className="h-5 w-14 rounded-md" />
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-5 w-12 rounded-md" />
                    <Skeleton className="h-5 w-10 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}