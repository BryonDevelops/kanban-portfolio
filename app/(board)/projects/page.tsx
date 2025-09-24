"use client"

import Board from "@/presentation/components/features/board/Board"
import { DndContext } from "@dnd-kit/core"
// import { HTML5Backend } from "react-dnd-html5-backend"
import { Input } from "@/presentation/components/ui/input"
import { Button } from "@/presentation/components/ui/button"
import { Plus, SlidersHorizontal, RefreshCw } from 'lucide-react'
import { BoardService } from "@/services/board/boardService"
import { TaskService } from "@/services/board/taskService"
import { ProjectService } from "@/services/board/projectService"
import { SupabaseBoardRepository } from "@/infrastructure/database/repositories/supaBaseBoardRepository"
import { IBoardRepository } from "@/domain/board/repositories/boardRepository.interface"
import { Project } from "@/domain/board/schemas/project.schema"
import { useBoardStore } from "@/presentation/stores/board/boardStore"
import { useIsAdmin } from "@/presentation/components/shared/ProtectedRoute"

export default function ProjectsPage() {
  const { loadProjects } = useBoardStore()
  const isAdmin = useIsAdmin()

  const repository: IBoardRepository = new SupabaseBoardRepository();
  const taskService = new TaskService(repository);
  const projectService = new ProjectService(repository);
  const boardService = new BoardService(repository, taskService, projectService);

  const handleCreateProject = async () => {
    try {
      const newProject = await boardService.createProject('ideas', 'New Project');
      // Ensure tasks status is strictly typed
      const fixedProject: Project = {
        ...newProject,
        tasks: newProject.tasks
      };

      console.log('Created project:', fixedProject);

      // Show success toast
      import("@/presentation/utils/toast").then(({ success }) => {
        success("Project created!", "Your new project has been added to the Ideas column.");
      });
    } catch (error) {
      console.error('Failed to create project:', error);

      // Show error toast
      import("@/presentation/utils/toast").then(({ error: errorToast }) => {
        errorToast("Failed to create project", error instanceof Error ? error.message : 'Please try again.');
      });
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Full screen background that extends behind topbar */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-50/80 via-blue-50/60 to-purple-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -z-10" />

      {/* Enhanced Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary gradient orbs */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-pink-300/20 via-purple-300/20 to-blue-300/20 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-cyan-300/20 via-emerald-300/20 to-teal-300/20 dark:from-emerald-500/20 dark:via-cyan-500/20 dark:to-blue-500/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Secondary accent orbs */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-r from-violet-300/15 to-fuchsia-300/15 dark:from-violet-500/10 dark:to-fuchsia-500/10 blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 px-3 sm:px-4 md:px-6 lg:px-6 xl:px-8 py-4 sm:py-6 md:py-8 lg:py-8">
        <div className="mx-auto max-w-7xl">
          {/* Modern Header Section - Mobile Optimized */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-tight">
                  <span className="bg-gradient-to-r from-slate-800 via-pink-600 to-purple-600 dark:from-white dark:via-blue-100 dark:to-purple-200 bg-clip-text text-transparent">
                    Projects
                  </span>
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  Organize, prioritize, and track progress across your creative work.
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Toolbar - Mobile Optimized */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <div className="space-y-3 sm:space-y-4">
              {/* Demo Mode Notice - Compact on Mobile */}
              {!isAdmin && (
                <div className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800/30">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                      <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-white" />
                    </div>
                    <span className="font-medium">Demo Mode:</span>
                    <span className="truncate">Changes saved locally in browser only</span>
                  </div>
                </div>
              )}

              {/* Search and Action Buttons Container */}
              <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 lg:items-center">
                {/* Search and Filters - Full width on mobile */}
                <div className="flex-1 min-w-0">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-300/20 to-purple-300/20 dark:from-blue-500/20 dark:to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center gap-2 sm:gap-3 rounded-xl border border-pink-200/50 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-md p-2.5 sm:p-3 shadow-lg">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 dark:from-blue-500 dark:to-purple-500 flex items-center justify-center flex-shrink-0">
                          <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-white" />
                        </div>
                        <Input
                          placeholder="Search projects..."
                          className="bg-transparent border-0 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-0 focus:outline-none text-sm sm:text-base min-w-0"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-pink-50 dark:hover:bg-white/10 rounded-lg p-1.5 sm:p-2 flex-shrink-0"
                      >
                        <SlidersHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Stack on mobile, horizontal on larger screens */}
                <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                  <Button
                    onClick={() => loadProjects(true)}
                    variant="outline"
                    size="sm"
                    className="group relative overflow-hidden border-pink-200/50 dark:border-white/20 bg-white/80 dark:bg-white/5 hover:bg-pink-50/50 dark:hover:bg-white/10 text-slate-700 dark:text-white/80 hover:text-slate-800 dark:hover:text-white backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 flex-1 sm:flex-initial justify-center"
                  >
                    <div className="relative flex items-center gap-2">
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="font-medium hidden xs:inline">Refresh</span>
                    </div>
                  </Button>
                  <Button
                    onClick={handleCreateProject}
                    size="sm"
                    className="group relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-600 dark:from-blue-600 dark:via-purple-600 dark:to-pink-600 hover:from-pink-400 hover:via-purple-500 hover:to-cyan-500 dark:hover:from-blue-500 dark:hover:via-purple-500 dark:hover:to-pink-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 flex-1 sm:flex-initial justify-center"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center gap-2">
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="font-medium hidden xs:inline">New Project</span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Board Container - Mobile Optimized */}
          <div className="relative">
            {/* Container glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-300/20 via-purple-300/20 to-cyan-300/20 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-xl sm:rounded-2xl lg:rounded-3xl blur opacity-20" />

            <div className="relative rounded-xl sm:rounded-2xl lg:rounded-3xl border border-pink-200/50 dark:border-white/10 bg-white/90 dark:bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Inner gradient border */}
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl lg:rounded-3xl bg-gradient-to-r from-pink-100/50 via-purple-100/50 to-cyan-100/50 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 opacity-50" />

              <div className="relative p-3 sm:p-4 lg:p-6 xl:p-8">
                <div className="h-[70vh] sm:h-[75vh] md:h-[78vh] lg:h-[80vh] xl:h-[85vh] overflow-hidden">
                  <DndContext>
                    <Board />
                  </DndContext>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
